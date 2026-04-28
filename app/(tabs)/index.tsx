import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  Modal, TouchableOpacity, ScrollView, FlatList, TextInput, Alert,
  KeyboardAvoidingView, Platform, Pressable, Dimensions, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import {
  collection, query, where, getDocs, doc, getDoc,
  updateDoc, arrayUnion, arrayRemove, onSnapshot,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useUser } from '../../context/UserContext';
import QRCode from 'react-native-qrcode-svg';
import { CameraView, useCameraPermissions } from 'expo-camera';
import FlipCard, { CardData, CARD_HEIGHT } from '../../components/FlipCard';
import { mockUser } from '../../constants/mockData';

type ConnectedUser = {
  id: string;
  username: string;
  city: string;
  skrrId: string;
  car: { year: string | number; make: string; model: string };
  cardStyle?: { outlineColor: string };
};

function firestoreToCardData(uid: string, d: any): CardData {
  return {
    ...mockUser,
    id: uid,
    skrrId: d.skrrId ?? '',
    username: d.username ?? 'Unknown',
    location: d.city ?? '',
    profilePhoto: d.profilePhoto ?? null,
    car: {
      ...mockUser.car,
      year: Number(d.car?.year) || mockUser.car.year,
      make: d.car?.make ?? mockUser.car.make,
      model: d.car?.model ?? mockUser.car.model,
      photo: d.car?.photo ?? null,
      hp: Number(d.car?.hp) || 0,
      torque: Number(d.car?.torque) || 0,
      mods: d.car?.mods ?? [],
      zeroToSixty: d.car?.zeroToSixty ?? '',
      drivetrain: d.car?.drivetrain ?? '',
      engine: d.car?.engine ?? '',
    },
    stats: {
      meetsAttended: d.meetsAttended ?? 0,
      meetsHosted: d.meetsHosted ?? 0,
      friends: (d.connections ?? d.following ?? []).length,
      rating: d.rating ?? 0,
    },
    rank: d.rank ?? '',
    cardStyle: d.cardStyle ?? mockUser.cardStyle,
  };
}

export default function Network() {
  const { user: me } = useUser();
  const [connections, setConnections] = useState<ConnectedUser[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<ConnectedUser[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileCard, setProfileCard] = useState<CardData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  async function viewProfile(uid: string) {
    setLoadingProfile(true);
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) setProfileCard(firestoreToCardData(uid, snap.data()));
    } finally {
      setLoadingProfile(false);
    }
  }

  // Listen to my user doc for connection changes
  useEffect(() => {
    if (!me.id || me.id === '1') { setLoading(false); return; }
    const unsub = onSnapshot(doc(db, 'users', me.id), async (snap) => {
      if (!snap.exists()) { setLoading(false); return; }
      const data = snap.data();
      const connIds: string[] = data.connections ?? [];
      const reqIds: string[] = data.incomingRequests ?? [];

      const fetchUsers = async (ids: string[]): Promise<ConnectedUser[]> => {
        if (!ids.length) return [];
        const results: ConnectedUser[] = [];
        await Promise.all(ids.map(async (id) => {
          try {
            const s = await getDoc(doc(db, 'users', id));
            if (s.exists()) {
              const d = s.data();
              results.push({
                id, username: d.username ?? 'Unknown', city: d.city ?? '',
                skrrId: d.skrrId ?? '', car: d.car ?? {},
                cardStyle: d.cardStyle ?? null,
              });
            }
          } catch {}
        }));
        return results;
      };

      const [connUsers, reqUsers] = await Promise.all([
        fetchUsers(connIds), fetchUsers(reqIds),
      ]);
      setConnections(connUsers);
      setIncomingRequests(reqUsers);
      setLoading(false);
    });
    return () => unsub();
  }, [me.id]);

  async function acceptRequest(fromUser: ConnectedUser) {
    if (!me.id) return;
    try {
      await Promise.all([
        updateDoc(doc(db, 'users', me.id), {
          incomingRequests: arrayRemove(fromUser.id),
          connections: arrayUnion(fromUser.id),
        }),
        updateDoc(doc(db, 'users', fromUser.id), {
          sentRequests: arrayRemove(me.id),
          connections: arrayUnion(me.id),
        }),
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  }

  async function declineRequest(fromUser: ConnectedUser) {
    if (!me.id) return;
    try {
      await Promise.all([
        updateDoc(doc(db, 'users', me.id), {
          incomingRequests: arrayRemove(fromUser.id),
        }),
        updateDoc(doc(db, 'users', fromUser.id), {
          sentRequests: arrayRemove(me.id),
        }),
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  }

  const accent = (u: ConnectedUser) => u.cardStyle?.outlineColor ?? Colors.accent;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>MY NETWORK</Text>
          <TouchableOpacity style={s.addBtn} onPress={() => setShowAdd(true)}>
            <Ionicons name="person-add" size={16} color="#000" />
            <Text style={s.addBtnText}>ADD</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.accent} style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* Incoming requests */}
            {incomingRequests.length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionLabel}>REQUESTS</Text>
                {incomingRequests.map(u => (
                  <TouchableOpacity key={u.id} style={s.requestCard} onPress={() => viewProfile(u.id)} activeOpacity={0.75}>
                    <View style={[s.reqAvatar, { borderColor: accent(u) }]}>
                      <Ionicons name="person" size={20} color={Colors.textMuted} />
                    </View>
                    <View style={s.reqInfo}>
                      <Text style={s.reqUsername}>{u.username}</Text>
                      {u.skrrId ? <Text style={[s.reqSkrrId, { color: accent(u) }]}>#{u.skrrId}</Text> : null}
                      <Text style={s.reqViewCard}>Tap to view card →</Text>
                    </View>
                    <TouchableOpacity style={[s.reqAccept, { backgroundColor: accent(u) }]} onPress={() => acceptRequest(u)}>
                      <Ionicons name="checkmark" size={16} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={s.reqDecline} onPress={() => declineRequest(u)}>
                      <Ionicons name="close" size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Connections */}
            <View style={s.section}>
              <Text style={s.sectionLabel}>CONNECTIONS · {connections.length}</Text>
              {connections.length === 0 ? (
                <View style={s.empty}>
                  <Ionicons name="people-outline" size={44} color={Colors.textMuted} />
                  <Text style={s.emptyTitle}>NO CONNECTIONS YET</Text>
                  <Text style={s.emptyText}>Add people by SKRR ID, QR code, or at a meet.</Text>
                </View>
              ) : (
                <FlatList
                  data={connections}
                  keyExtractor={u => u.id}
                  scrollEnabled={false}
                  renderItem={({ item: u }) => (
                    <View style={s.connCard}>
                      <View style={[s.connAvatar, { borderColor: accent(u), shadowColor: accent(u) }]}>
                        <Ionicons name="person" size={22} color={Colors.textMuted} />
                      </View>
                      <View style={s.connInfo}>
                        <Text style={s.connUsername}>{u.username}</Text>
                        <Text style={s.connCar} numberOfLines={1}>
                          {[u.car.year, u.car.make, u.car.model].filter(Boolean).join(' ')}
                        </Text>
                      </View>
                      {u.skrrId ? (
                        <Text style={[s.connSkrrId, { color: accent(u) }]}>#{u.skrrId}</Text>
                      ) : null}
                    </View>
                  )}
                />
              )}
            </View>

            {/* How to add */}
            {connections.length === 0 && (
              <View style={s.howTo}>
                <Text style={s.howToTitle}>HOW TO CONNECT</Text>
                <HowToRow icon="qr-code" label="Scan QR Code" sub="In-person tap" />
<HowToRow icon="search" label="SKRR ID" sub="Intentional add, requires approval" />
                <HowToRow icon="flag" label="Same Meet" sub="Checked in together → request after" />
              </View>
            )}
          </>
        )}
      </ScrollView>

      <AddModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        myId={me.id}
        myUsername={me.username}
        mySkrrId={me.skrrId ?? ''}
        myConnections={connections.map(c => c.id)}
      />

      {/* Profile card viewer */}
      <Modal visible={!!profileCard} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setProfileCard(null)}>
        <View style={s.profileOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setProfileCard(null)} />
          {profileCard && (
            <View style={{ transform: [{ scale: 0.88 }] }}>
              <FlipCard data={profileCard} />
            </View>
          )}
          <TouchableOpacity style={s.profileCloseBtn} onPress={() => setProfileCard(null)}>
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      {loadingProfile && (
        <View style={s.profileLoadingOverlay}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      )}
    </SafeAreaView>
  );
}

function HowToRow({ icon, label, sub }: { icon: any; label: string; sub: string }) {
  return (
    <View style={s.howToRow}>
      <View style={s.howToIcon}>
        <Ionicons name={icon} size={16} color={Colors.accent} />
      </View>
      <View>
        <Text style={s.howToLabel}>{label}</Text>
        <Text style={s.howToSub}>{sub}</Text>
      </View>
    </View>
  );
}

// ─── Add Modal ────────────────────────────────────────────────────────────────

function AddModal({ visible, onClose, myId, myUsername, mySkrrId, myConnections }: {
  visible: boolean; onClose: () => void;
  myId: string; myUsername: string; mySkrrId: string; myConnections: string[];
}) {
  const [tab, setTab] = useState<'id' | 'qr'>('id');
  const [skrrInput, setSkrrInput] = useState('');
  const [searchResult, setSearchResult] = useState<ConnectedUser | null>(null);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function reset() {
    setSkrrInput(''); setSearchResult(null); setSent(false);
  }

  async function searchSkrrId() {
    const id = skrrInput.trim().toUpperCase().replace('#', '');
    if (!id) return;
    setSearching(true);
    setSearchResult(null);
    setSent(false);
    try {
      const q = query(collection(db, 'users'), where('skrrId', '==', id));
      const snap = await getDocs(q);
      if (snap.empty) {
        Alert.alert('Not Found', 'No user with that SKRR ID.');
      } else {
        const d = snap.docs[0];
        setSearchResult({
          id: d.id,
          username: d.data().username ?? 'Unknown',
          city: d.data().city ?? '',
          skrrId: d.data().skrrId ?? '',
          car: d.data().car ?? {},
          cardStyle: d.data().cardStyle ?? null,
        });
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSearching(false);
    }
  }

  async function sendRequest(target: ConnectedUser) {
    if (!myId || myId === '1') return;
    setSending(true);
    try {
      await Promise.all([
        updateDoc(doc(db, 'users', target.id), {
          incomingRequests: arrayUnion(myId),
        }),
        updateDoc(doc(db, 'users', myId), {
          sentRequests: arrayUnion(target.id),
        }),
      ]);
      setSent(true);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSending(false);
    }
  }

  const alreadyConnected = searchResult ? myConnections.includes(searchResult.id) : false;
  const isMe = searchResult?.id === myId;
  const accentColor = searchResult?.cardStyle?.outlineColor ?? Colors.accent;

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={as.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={as.sheet}>
          <View style={as.header}>
            <Text style={as.title}>ADD TO NETWORK</Text>
            <TouchableOpacity onPress={() => { reset(); onClose(); }} style={as.closeBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
              <Ionicons name="close" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={as.tabs}>
            <TouchableOpacity style={[as.tab, tab === 'id' && as.tabActive]} onPress={() => setTab('id')}>
              <Text style={[as.tabText, tab === 'id' && as.tabTextActive]}>SKRR ID</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[as.tab, tab === 'qr' && as.tabActive]} onPress={() => setTab('qr')}>
              <Text style={[as.tabText, tab === 'qr' && as.tabTextActive]}>QR CODE</Text>
            </TouchableOpacity>
          </View>

          {tab === 'id' ? (
            <View style={as.content}>
              <Text style={as.hint}>Enter someone's SKRR ID to send a connection request.</Text>
              <View style={as.inputRow}>
                <Text style={as.hashPrefix}>#</Text>
                <TextInput
                  style={as.input}
                  value={skrrInput}
                  onChangeText={t => { setSkrrInput(t); setSearchResult(null); setSent(false); }}
                  placeholder="e.g. JDM001"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="characters"
                  returnKeyType="search"
                  onSubmitEditing={searchSkrrId}
                />
                <TouchableOpacity style={as.searchBtn} onPress={searchSkrrId} disabled={searching}>
                  {searching ? <ActivityIndicator color="#000" size="small" /> : <Ionicons name="search" size={16} color="#000" />}
                </TouchableOpacity>
              </View>

              {searchResult && !isMe && (
                <View style={[as.resultCard, { borderColor: accentColor + '60' }]}>
                  <View style={[as.resultAvatar, { borderColor: accentColor }]}>
                    <Ionicons name="person" size={28} color={Colors.textMuted} />
                  </View>
                  <Text style={[as.resultSkrrId, { color: accentColor }]}>#{searchResult.skrrId}</Text>
                  <Text style={as.resultUsername}>{searchResult.username}</Text>
                  {searchResult.city ? <Text style={as.resultCity}>{searchResult.city}</Text> : null}

                  {alreadyConnected ? (
                    <View style={as.alreadyConnected}>
                      <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
                      <Text style={as.alreadyText}>Already connected</Text>
                    </View>
                  ) : sent ? (
                    <View style={as.alreadyConnected}>
                      <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
                      <Text style={as.alreadyText}>Request sent!</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[as.requestBtn, { backgroundColor: accentColor }]}
                      onPress={() => sendRequest(searchResult!)}
                      disabled={sending}
                    >
                      {sending
                        ? <ActivityIndicator color="#000" />
                        : <><Ionicons name="person-add" size={16} color="#000" /><Text style={as.requestBtnText}>SEND REQUEST</Text></>
                      }
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ) : (
            <QRTab
              mySkrrId={mySkrrId}
              myUsername={myUsername}
              myId={myId}
              myConnections={myConnections}
              onSendRequest={sendRequest}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── QR Tab ───────────────────────────────────────────────────────────────────

function QRTab({ mySkrrId, myUsername, myId, myConnections, onSendRequest }: {
  mySkrrId: string; myUsername: string; myId: string;
  myConnections: string[];
  onSendRequest: (target: ConnectedUser) => Promise<void>;
}) {
  const [mode, setMode] = useState<'show' | 'scan'>('show');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<ConnectedUser | null>(null);
  const [loadingResult, setLoadingResult] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const qrValue = `skrr://add/${mySkrrId}`;

  async function handleBarcode({ data }: { data: string }) {
    if (scanned || loadingResult) return;
    setScanned(true);
    const match = data.match(/^skrr:\/\/add\/([A-Z0-9]+)$/);
    if (!match) {
      Alert.alert('Invalid QR', 'This QR code is not a SKRR ID.', [
        { text: 'Retry', onPress: () => setScanned(false) },
      ]);
      return;
    }
    const id = match[1];
    setLoadingResult(true);
    try {
      const q = query(collection(db, 'users'), where('skrrId', '==', id));
      const snap = await getDocs(q);
      if (snap.empty) {
        Alert.alert('Not Found', 'No SKRR user with that ID.', [
          { text: 'Retry', onPress: () => setScanned(false) },
        ]);
        setLoadingResult(false);
        return;
      }
      const d = snap.docs[0];
      setScanResult({
        id: d.id,
        username: d.data().username ?? 'Unknown',
        city: d.data().city ?? '',
        skrrId: d.data().skrrId ?? '',
        car: d.data().car ?? {},
        cardStyle: d.data().cardStyle ?? null,
      });
    } catch (e: any) {
      Alert.alert('Error', e.message);
      setScanned(false);
    } finally {
      setLoadingResult(false);
    }
  }

  async function handleSend() {
    if (!scanResult) return;
    setSending(true);
    await onSendRequest(scanResult);
    setSent(true);
    setSending(false);
  }

  const accentColor = scanResult?.cardStyle?.outlineColor ?? Colors.accent;
  const alreadyConnected = scanResult ? myConnections.includes(scanResult.id) : false;
  const isMe = scanResult?.id === myId;

  return (
    <View>
      {/* Sub-tabs: Show / Scan */}
      <View style={as.subTabs}>
        <TouchableOpacity
          style={[as.subTab, mode === 'show' && as.subTabActive]}
          onPress={() => { setMode('show'); setScanned(false); setScanResult(null); setSent(false); }}
        >
          <Ionicons name="qr-code" size={14} color={mode === 'show' ? Colors.accent : Colors.textMuted} />
          <Text style={[as.subTabText, mode === 'show' && as.subTabTextActive]}>MY QR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[as.subTab, mode === 'scan' && as.subTabActive]}
          onPress={() => { setMode('scan'); setScanned(false); setScanResult(null); setSent(false); }}
        >
          <Ionicons name="scan" size={14} color={mode === 'scan' ? Colors.accent : Colors.textMuted} />
          <Text style={[as.subTabText, mode === 'scan' && as.subTabTextActive]}>SCAN</Text>
        </TouchableOpacity>
      </View>

      {mode === 'show' ? (
        <View style={as.qrShowContent}>
          <View style={as.qrBox}>
            {mySkrrId ? (
              <QRCode
                value={qrValue}
                size={180}
                color="#FFFFFF"
                backgroundColor="transparent"
                quietZone={12}
              />
            ) : (
              <ActivityIndicator color={Colors.accent} />
            )}
          </View>
          <Text style={as.qrSkrrId}>#{mySkrrId}</Text>
          <Text style={as.qrUsername}>{myUsername}</Text>
          <Text style={as.qrHint}>Show this to someone to let them scan you in.</Text>
        </View>
      ) : (
        <View style={as.scanContent}>
          {!permission?.granted ? (
            <View style={as.permContent}>
              <Ionicons name="camera-outline" size={40} color={Colors.textMuted} />
              <Text style={as.permText}>Camera access is needed to scan QR codes.</Text>
              <TouchableOpacity style={as.permBtn} onPress={requestPermission}>
                <Text style={as.permBtnText}>ALLOW CAMERA</Text>
              </TouchableOpacity>
            </View>
          ) : scanResult && !isMe ? (
            <View style={[as.resultCard, { borderColor: accentColor + '60', marginHorizontal: 24, marginTop: 20 }]}>
              <View style={[as.resultAvatar, { borderColor: accentColor }]}>
                <Ionicons name="person" size={28} color={Colors.textMuted} />
              </View>
              <Text style={[as.resultSkrrId, { color: accentColor }]}>#{scanResult.skrrId}</Text>
              <Text style={as.resultUsername}>{scanResult.username}</Text>
              {scanResult.city ? <Text style={as.resultCity}>{scanResult.city}</Text> : null}
              {alreadyConnected ? (
                <View style={as.alreadyConnected}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
                  <Text style={as.alreadyText}>Already connected</Text>
                </View>
              ) : sent ? (
                <View style={as.alreadyConnected}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
                  <Text style={as.alreadyText}>Request sent!</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[as.requestBtn, { backgroundColor: accentColor }]}
                  onPress={handleSend}
                  disabled={sending}
                >
                  {sending
                    ? <ActivityIndicator color="#000" />
                    : <><Ionicons name="person-add" size={16} color="#000" /><Text style={as.requestBtnText}>SEND REQUEST</Text></>
                  }
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => { setScanResult(null); setScanned(false); setSent(false); }} style={as.scanAgainBtn}>
                <Text style={as.scanAgainText}>Scan another</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={as.cameraWrap}>
              <CameraView
                style={as.camera}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={scanned ? undefined : handleBarcode}
              />
              {loadingResult && (
                <View style={as.cameraOverlay}>
                  <ActivityIndicator color={Colors.accent} size="large" />
                </View>
              )}
              <View style={as.scanFrame}>
                <View style={[as.scanCorner, as.scanCornerTL]} />
                <View style={[as.scanCorner, as.scanCornerTR]} />
                <View style={[as.scanCorner, as.scanCornerBL]} />
                <View style={[as.scanCorner, as.scanCornerBR]} />
              </View>
              <Text style={as.scanLabel}>Point at a SKRR QR code</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background },
  scroll:         { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 60 },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title:          { color: Colors.text, fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  addBtn:         { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.accent, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  addBtnText:     { color: '#000', fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },
  section:        { marginBottom: 28 },
  sectionLabel:   { color: Colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 12 },

  // Requests
  requestCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 12, borderWidth: 1, borderColor: Colors.cardBorder, padding: 12, marginBottom: 8, gap: 10 },
  reqAvatar:      { width: 40, height: 40, borderRadius: 20, borderWidth: 2, backgroundColor: Colors.inputBg, justifyContent: 'center', alignItems: 'center' },
  reqInfo:        { flex: 1 },
  reqUsername:    { color: Colors.text, fontSize: 14, fontWeight: '800' },
  reqSkrrId:      { fontSize: 11, fontWeight: '700', marginTop: 2 },
  reqAccept:      { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  reqDecline:     { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, justifyContent: 'center', alignItems: 'center' },
  reqViewCard:    { color: Colors.textMuted, fontSize: 10, fontWeight: '600', marginTop: 2 },
  profileOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  profileCloseBtn:{ position: 'absolute', top: 60, right: 24, width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A2E', justifyContent: 'center', alignItems: 'center' },
  profileLoadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },

  // Connections
  connCard:       { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 12, borderWidth: 1, borderColor: Colors.cardBorder, padding: 12, marginBottom: 8, gap: 12 },
  connAvatar:     { width: 44, height: 44, borderRadius: 22, borderWidth: 2, backgroundColor: Colors.inputBg, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 6 },
  connInfo:       { flex: 1 },
  connUsername:   { color: Colors.text, fontSize: 14, fontWeight: '800' },
  connCar:        { color: Colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2 },
  connSkrrId:     { fontSize: 11, fontWeight: '900', letterSpacing: 1 },

  // Empty
  empty:          { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyTitle:     { color: Colors.textMuted, fontSize: 12, fontWeight: '900', letterSpacing: 3 },
  emptyText:      { color: Colors.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 20 },

  // How to
  howTo:          { backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.cardBorder, padding: 20 },
  howToTitle:     { color: Colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 16 },
  howToRow:       { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  howToIcon:      { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.accentDim, borderWidth: 1, borderColor: Colors.accent + '40', justifyContent: 'center', alignItems: 'center' },
  howToLabel:     { color: Colors.text, fontSize: 13, fontWeight: '700' },
  howToSub:       { color: Colors.textMuted, fontSize: 11, marginTop: 1 },
});

const as = StyleSheet.create({
  overlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  sheet:            { backgroundColor: '#080810', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: '#1A1A2E', paddingBottom: 40 },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#111122' },
  title:            { color: Colors.accent, fontSize: 14, fontWeight: '900', letterSpacing: 3 },
  closeBtn:         { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1A1A2E', justifyContent: 'center', alignItems: 'center' },
  tabs:             { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#111122' },
  tab:              { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive:        { borderBottomWidth: 2, borderBottomColor: Colors.accent },
  tabText:          { color: Colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  tabTextActive:    { color: Colors.accent },
  content:          { padding: 24 },
  hint:             { color: Colors.textMuted, fontSize: 13, marginBottom: 16, lineHeight: 20 },
  inputRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4, gap: 8 },
  hashPrefix:       { color: Colors.accent, fontSize: 18, fontWeight: '900' },
  input:            { flex: 1, color: Colors.text, fontSize: 16, fontWeight: '700', paddingVertical: 10 },
  searchBtn:        { backgroundColor: Colors.accent, borderRadius: 8, padding: 8 },
  resultCard:       { marginTop: 20, backgroundColor: Colors.card, borderWidth: 1, borderRadius: 14, padding: 20, alignItems: 'center', gap: 6 },
  resultAvatar:     { width: 64, height: 64, borderRadius: 32, borderWidth: 2, backgroundColor: Colors.inputBg, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  resultSkrrId:     { fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  resultUsername:   { color: Colors.text, fontSize: 18, fontWeight: '900' },
  resultCity:       { color: Colors.textMuted, fontSize: 12 },
  requestBtn:       { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 24, marginTop: 12 },
  requestBtnText:   { color: '#000', fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  alreadyConnected: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  alreadyText:      { color: Colors.accent, fontSize: 13, fontWeight: '700' },
  // Sub-tabs (Show QR / Scan)
  subTabs:          { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#111122', marginTop: 4 },
  subTab:           { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  subTabActive:     { borderBottomWidth: 2, borderBottomColor: Colors.accent },
  subTabText:       { color: Colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  subTabTextActive: { color: Colors.accent },

  // Show QR
  qrShowContent:    { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24, gap: 8 },
  qrBox:            { width: 204, height: 204, borderRadius: 20, backgroundColor: '#14141F', borderWidth: 1, borderColor: Colors.accent + '40', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  qrSkrrId:         { color: Colors.accent, fontSize: 18, fontWeight: '900', letterSpacing: 3 },
  qrUsername:       { color: Colors.text, fontSize: 14, fontWeight: '700' },
  qrHint:           { color: Colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 4, lineHeight: 18 },

  // Scan
  scanContent:      { minHeight: 300 },
  permContent:      { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24, gap: 14 },
  permText:         { color: Colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  permBtn:          { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 28 },
  permBtnText:      { color: '#000', fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  cameraWrap:       { position: 'relative', height: 300, marginHorizontal: 24, marginVertical: 20, borderRadius: 16, overflow: 'hidden' },
  camera:           { flex: 1 },
  cameraOverlay:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  scanFrame:        { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scanCorner:       { position: 'absolute', width: 24, height: 24, borderColor: Colors.accent, borderWidth: 3 },
  scanCornerTL:     { top: 40, left: 40, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  scanCornerTR:     { top: 40, right: 40, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  scanCornerBL:     { bottom: 40, left: 40, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
  scanCornerBR:     { bottom: 40, right: 40, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },
  scanLabel:        { position: 'absolute', bottom: 14, alignSelf: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  scanAgainBtn:     { marginTop: 12 },
  scanAgainText:    { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
});
