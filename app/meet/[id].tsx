import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, Alert, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import {
  doc, getDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove, increment, deleteDoc, runTransaction, setDoc,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useUser } from '../../context/UserContext';
import FlipCard, { CardData } from '../../components/FlipCard';
import { mockUser } from '../../constants/mockData';

interface MeetData {
  id: string;
  title: string;
  location: string;
  date: string;
  description: string;
  carTypes: string[];
  attendees: number;
  attendeeUids: string[];
  hostedBy: string;
  hostUid: string;
  status: 'active' | 'ended';
}

interface UserProfile {
  id: string;
  username: string;
  city: string;
  skrrId: string;
  profilePhoto?: string | null;
  car: { year?: string | number; make?: string; model?: string };
  cardStyle?: { outlineColor?: string };
}

// ─── Profile Card Modal ───────────────────────────────────────────────────────

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

function ProfileCardModal({ userId, visible, onClose }: {
  userId: string; visible: boolean; onClose: () => void;
}) {
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible || !userId) return;
    setLoading(true);
    setCardData(null);
    getDoc(doc(db, 'users', userId))
      .then(snap => {
        if (snap.exists()) setCardData(firestoreToCardData(snap.id, snap.data()));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId, visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={pc.overlay}>
        <TouchableOpacity style={pc.dimArea} activeOpacity={1} onPress={onClose} />

        {/* Close button sits ABOVE the sheet so it never overlaps the card */}
        <TouchableOpacity
          style={pc.closeBtn}
          onPress={onClose}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Ionicons name="close" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={pc.sheet}>
          <View style={pc.handle} />

          {loading ? (
            <ActivityIndicator color={Colors.accent} style={{ marginVertical: 60 }} />
          ) : cardData ? (
            <View style={pc.cardWrap}>
              <View style={pc.hintRow}>
                <Ionicons name="swap-horizontal" size={12} color={Colors.textMuted} />
                <Text style={pc.hintText}>Tap VEHICLE STATS to flip</Text>
              </View>
              {/* scale gives the rotating card room so perspective overflow never hits the sheet edge */}
              <View style={pc.cardScale}>
                <FlipCard data={cardData} />
              </View>
            </View>
          ) : (
            <Text style={pc.notFound}>User not found</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MeetDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: me } = useUser();
  const router = useRouter();

  const [meet, setMeet] = useState<MeetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [attendeeProfiles, setAttendeeProfiles] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showAttendees, setShowAttendees] = useState(false);
  const [respectGiven, setRespectGiven] = useState<Set<string>>(new Set());
  const [respectCount, setRespectCount] = useState(0);
  const [givingRespect, setGivingRespect] = useState<string | null>(null);

  const RESPECT_LIMIT = 3;

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'meets', id as string), async snap => {
      if (!snap.exists()) { setLoading(false); return; }
      const d = snap.data();
      const data: MeetData = {
        id: snap.id,
        title: d.title ?? '',
        location: d.location ?? '',
        date: d.date ?? '',
        description: d.description ?? '',
        carTypes: d.carTypes ?? [],
        attendees: d.attendees ?? 0,
        attendeeUids: d.attendeeUids ?? [],
        hostedBy: d.hostedBy ?? '',
        hostUid: d.hostUid ?? '',
        status: d.status ?? 'active',
      };
      setMeet(data);
      setLoading(false);

      // Fetch attendee profiles
      const uids: string[] = d.attendeeUids ?? [];
      const profiles = await Promise.all(
        uids.map(async (uid) => {
          try {
            const s = await getDoc(doc(db, 'users', uid));
            if (!s.exists()) return null;
            const u = s.data();
            return {
              id: s.id,
              username: u.username ?? 'Unknown',
              city: u.city ?? '',
              skrrId: u.skrrId ?? '',
              profilePhoto: u.profilePhoto ?? null,
              car: u.car ?? {},
              cardStyle: u.cardStyle ?? null,
            } as UserProfile;
          } catch { return null; }
        })
      );
      setAttendeeProfiles(profiles.filter(Boolean) as UserProfile[]);
    });
    return () => unsub();
  }, [id]);

  // Live-sync respect given by me for this meet
  useEffect(() => {
    if (!id || !me.id || me.id === '1') return;
    const unsub = onSnapshot(doc(db, 'meets', id as string, 'respectGiven', me.id), snap => {
      if (snap.exists()) {
        const d = snap.data();
        setRespectGiven(new Set(d.recipients ?? []));
        setRespectCount(d.count ?? 0);
      } else {
        setRespectGiven(new Set());
        setRespectCount(0);
      }
    });
    return () => unsub();
  }, [id, me.id]);

  const isJoined = meet?.attendeeUids.includes(me.id) ?? false;
  const isHost   = meet?.hostUid === me.id;

  async function endMeet() {
    if (!meet) return;
    Alert.alert(
      'End Meet',
      'Mark this meet as ended? Attendees will be able to give Respect to each other.',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'End Meet', onPress: async () => {
            try {
              await updateDoc(doc(db, 'meets', meet.id), { status: 'ended' });
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  }

  async function giveRespect(targetUid: string) {
    if (!meet || !me.id || me.id === '1') return;
    if (targetUid === me.id) return;
    if (respectGiven.has(targetUid)) return;
    if (respectCount >= RESPECT_LIMIT) {
      Alert.alert('Limit Reached', `You can only give ${RESPECT_LIMIT} Respects per meet.`);
      return;
    }
    setGivingRespect(targetUid);
    try {
      const respectRef = doc(db, 'meets', meet.id, 'respectGiven', me.id);
      const targetRef  = doc(db, 'users', targetUid);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(respectRef);
        const data = snap.data() ?? { recipients: [], count: 0 };
        if ((data.count ?? 0) >= RESPECT_LIMIT) throw new Error(`You've reached the ${RESPECT_LIMIT} Respect limit for this meet.`);
        if ((data.recipients ?? []).includes(targetUid)) throw new Error('You already gave Respect to this person.');
        tx.set(respectRef, { recipients: [...(data.recipients ?? []), targetUid], count: (data.count ?? 0) + 1 });
        tx.update(targetRef, { rating: increment(1) });
      });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setGivingRespect(null);
    }
  }

  async function cancelMeet() {
    if (!meet) return;
    Alert.alert(
      'Cancel Meet',
      'Are you sure you want to cancel this meet? This cannot be undone.',
      [
        { text: 'Keep It', style: 'cancel' },
        {
          text: 'Cancel Meet', style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'meets', meet.id));
              router.back();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  }

  async function toggleJoin() {
    if (!meet || !me.id || me.id === '1') return;
    setJoining(true);
    try {
      if (isJoined) {
        await updateDoc(doc(db, 'meets', meet.id), {
          attendeeUids: arrayRemove(me.id),
          attendees: increment(-1),
        });
      } else {
        await updateDoc(doc(db, 'meets', meet.id), {
          attendeeUids: arrayUnion(me.id),
          attendees: increment(1),
        });
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <ActivityIndicator color={Colors.accent} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!meet) {
    return (
      <SafeAreaView style={s.container}>
        <Text style={{ color: Colors.textMuted, textAlign: 'center', marginTop: 60 }}>Meet not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Title + host */}
        <Text style={s.title}>{meet.title}</Text>
        <TouchableOpacity style={s.hostRow} onPress={() => meet.hostUid && setSelectedUserId(meet.hostUid)}>
          <View style={s.hostAvatar}>
            <Ionicons name="person" size={14} color={Colors.textMuted} />
          </View>
          <Text style={s.hostLabel}>Hosted by </Text>
          <Text style={s.hostName}>{meet.hostedBy}</Text>
          <Ionicons name="chevron-forward" size={13} color={Colors.textMuted} style={{ marginLeft: 2 }} />
        </TouchableOpacity>

        {/* Info boxes */}
        <InfoBox icon="location" label="LOCATION" value={meet.location} />
        <InfoBox icon="calendar" label="DATE & TIME" value={meet.date} />

        {/* Description */}
        {meet.description ? (
          <View style={s.section}>
            <Text style={s.sectionLabel}>ABOUT THIS MEET</Text>
            <Text style={s.description}>{meet.description}</Text>
          </View>
        ) : null}

        {/* Car types */}
        {meet.carTypes.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>CAR TYPES WELCOME</Text>
            <View style={s.tagsRow}>
              {meet.carTypes.map(type => (
                <View key={type} style={s.tag}>
                  <Text style={s.tagText}>{type}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Attendees */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>WHO'S GOING · {meet.attendees}</Text>
          <TouchableOpacity
            style={s.attendeeRow}
            onPress={() => attendeeProfiles.length > 0 && setShowAttendees(true)}
            activeOpacity={0.75}
          >
            {attendeeProfiles.length === 0 ? (
              <Text style={s.emptyAttendees}>No one yet — be the first to join.</Text>
            ) : (
              <>
                <View style={s.bubbleStack}>
                  {attendeeProfiles.slice(0, 5).map((u, i) => {
                    const accent = u.cardStyle?.outlineColor ?? Colors.accent;
                    return (
                      <View
                        key={u.id}
                        style={[s.bubble, { borderColor: accent, marginLeft: i === 0 ? 0 : -10, zIndex: 5 - i }]}
                      >
                        {u.id === meet.hostUid
                          ? <Ionicons name="star" size={14} color={Colors.accent} />
                          : <Ionicons name="person" size={14} color={Colors.textMuted} />
                        }
                      </View>
                    );
                  })}
                  {meet.attendees > 5 && (
                    <View style={[s.bubble, s.bubbleOverflow, { marginLeft: -10 }]}>
                      <Text style={s.bubbleOverflowText}>+{meet.attendees - 5}</Text>
                    </View>
                  )}
                </View>
                <Text style={s.attendeeSeeAll}>
                  {meet.attendees === 1 ? '1 person going' : `${meet.attendees} people going`}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Give Respect — shown to attendees after meet ends */}
        {meet.status === 'ended' && isJoined && (
          <View style={s.section}>
            <View style={s.respectHeader}>
              <Ionicons name="flame" size={14} color={Colors.accent} />
              <Text style={s.sectionLabel}>GIVE RESPECT</Text>
              <Text style={s.respectRemaining}>{RESPECT_LIMIT - respectCount} left</Text>
            </View>
            <Text style={s.respectHint}>You were at this meet. Give up to {RESPECT_LIMIT} Respects.</Text>
            {attendeeProfiles
              .filter(u => u.id !== me.id)
              .map(u => {
                const accent = u.cardStyle?.outlineColor ?? Colors.accent;
                const alreadyGiven = respectGiven.has(u.id);
                const isLoading = givingRespect === u.id;
                const limitReached = respectCount >= RESPECT_LIMIT;
                return (
                  <View key={u.id} style={s.respectRow}>
                    <View style={[s.respectAvatar, { borderColor: accent }]}>
                      <Ionicons name="person" size={16} color={Colors.textMuted} />
                    </View>
                    <Text style={s.respectUsername} numberOfLines={1}>{u.username}</Text>
                    <TouchableOpacity
                      style={[s.respectBtn, alreadyGiven && { backgroundColor: Colors.accent + '20', borderColor: Colors.accent }]}
                      onPress={() => giveRespect(u.id)}
                      disabled={alreadyGiven || limitReached || isLoading}
                      activeOpacity={0.7}
                    >
                      {isLoading
                        ? <ActivityIndicator size="small" color={Colors.accent} />
                        : <>
                            <Ionicons name={alreadyGiven ? 'flame' : 'flame-outline'} size={14} color={alreadyGiven ? Colors.accent : Colors.textMuted} />
                            <Text style={[s.respectBtnText, alreadyGiven && { color: Colors.accent }]}>
                              {alreadyGiven ? 'GIVEN' : 'RESPECT'}
                            </Text>
                          </>
                      }
                    </TouchableOpacity>
                  </View>
                );
              })}
          </View>
        )}

        {meet.status === 'ended' && (
          <View style={s.endedBanner}>
            <Ionicons name="flag" size={14} color={Colors.textMuted} />
            <Text style={s.endedBannerText}>THIS MEET HAS ENDED</Text>
          </View>
        )}

        {/* Join button — hidden for host and ended meets */}
        {!isHost && meet.status === 'active' && (
          <TouchableOpacity
            style={[s.joinBtn, isJoined && s.joinBtnLeave]}
            onPress={toggleJoin}
            disabled={joining}
            activeOpacity={0.8}
          >
            {joining ? (
              <ActivityIndicator color={isJoined ? Colors.accent : '#000'} />
            ) : (
              <>
                <Ionicons
                  name={isJoined ? 'checkmark-circle' : 'add-circle'}
                  size={20}
                  color={isJoined ? Colors.accent : '#000'}
                />
                <Text style={[s.joinBtnText, isJoined && s.joinBtnTextLeave]}>
                  {isJoined ? "YOU'RE IN · TAP TO LEAVE" : 'JOIN THIS MEET'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Host controls */}
        {isHost && meet.status === 'active' && (
          <TouchableOpacity style={s.endBtn} onPress={endMeet} activeOpacity={0.8}>
            <Ionicons name="flag" size={16} color="#000" />
            <Text style={s.endBtnText}>END THIS MEET</Text>
          </TouchableOpacity>
        )}
        {isHost && (
          <TouchableOpacity style={s.cancelBtn} onPress={cancelMeet} activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={16} color="#FF3B30" />
            <Text style={s.cancelBtnText}>CANCEL THIS MEET</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      <ProfileCardModal
        userId={selectedUserId ?? ''}
        visible={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />

      <AttendeesSheet
        visible={showAttendees}
        attendees={attendeeProfiles}
        hostUid={meet.hostUid}
        onClose={() => setShowAttendees(false)}
        onSelectUser={(uid) => { setShowAttendees(false); setSelectedUserId(uid); }}
      />
    </SafeAreaView>
  );
}

// ─── Attendees Sheet ──────────────────────────────────────────────────────────

function AttendeesSheet({ visible, attendees, hostUid, onClose, onSelectUser }: {
  visible: boolean;
  attendees: UserProfile[];
  hostUid: string;
  onClose: () => void;
  onSelectUser: (uid: string) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={as.overlay}>
        <TouchableOpacity style={as.dimArea} activeOpacity={1} onPress={onClose} />
        <View style={[as.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={as.header}>
            <View style={as.handle} />
            <TouchableOpacity
              style={as.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Ionicons name="close" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={as.title}>WHO'S GOING · {attendees.length}</Text>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={as.list}>
            {attendees.map(u => {
              const accent = u.cardStyle?.outlineColor ?? Colors.accent;
              const carLabel = [u.car.year, u.car.make, u.car.model].filter(Boolean).join(' ');
              const isHost = u.id === hostUid;
              return (
                <TouchableOpacity
                  key={u.id}
                  style={as.row}
                  onPress={() => onSelectUser(u.id)}
                  activeOpacity={0.75}
                >
                  <View style={[as.avatar, { borderColor: accent, shadowColor: accent }]}>
                    {u.profilePhoto
                      ? <Image source={{ uri: u.profilePhoto }} style={as.avatarImg} />
                      : <Ionicons name="person" size={18} color={Colors.textMuted} />
                    }
                    {isHost && (
                      <View style={as.hostBadge}>
                        <Ionicons name="star" size={8} color="#000" />
                      </View>
                    )}
                  </View>
                  <View style={as.info}>
                    <View style={as.nameRow}>
                      <Text style={as.username}>{u.username}</Text>
                      {isHost && <Text style={[as.hostTag, { color: accent }]}>HOST</Text>}
                    </View>
                    {carLabel ? <Text style={[as.car, { color: accent }]} numberOfLines={1}>{carLabel}</Text> : null}
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function InfoBox({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={s.infoBox}>
      <Ionicons name={icon as any} size={15} color={Colors.accent} />
      <View style={{ flex: 1 }}>
        <Text style={s.infoBoxLabel}>{label}</Text>
        <Text style={s.infoBoxValue}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.background },
  scroll:          { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 50 },
  title:           { color: Colors.text, fontSize: 26, fontWeight: '900', letterSpacing: 0.3, marginBottom: 10 },
  hostRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  hostAvatar:      { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  hostLabel:       { color: Colors.textMuted, fontSize: 13 },
  hostName:        { color: Colors.accent, fontSize: 13, fontWeight: '700' },
  infoBox:         { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: 12, padding: 14, marginBottom: 10 },
  infoBoxLabel:    { color: Colors.accent, fontSize: 9, fontWeight: '800', letterSpacing: 2, marginBottom: 3 },
  infoBoxValue:    { color: Colors.text, fontSize: 14, fontWeight: '700' },
  section:         { marginTop: 20, marginBottom: 4 },
  sectionLabel:    { color: Colors.accent, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 12 },
  description:     { color: Colors.textSecondary, fontSize: 14, lineHeight: 22 },
  tagsRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag:             { backgroundColor: Colors.accentDim, borderWidth: 1, borderColor: Colors.accent + '40', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 },
  tagText:         { color: Colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  emptyAttendees:  { color: Colors.textMuted, fontSize: 13, fontStyle: 'italic' },
  attendeeRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14 },
  bubbleStack:     { flexDirection: 'row', alignItems: 'center' },
  bubble:          { width: 34, height: 34, borderRadius: 17, borderWidth: 2, backgroundColor: Colors.inputBg, justifyContent: 'center', alignItems: 'center' },
  bubbleOverflow:  { backgroundColor: Colors.card, borderColor: Colors.cardBorder },
  bubbleOverflowText: { color: Colors.textMuted, fontSize: 10, fontWeight: '900' },
  attendeeSeeAll:  { flex: 1, color: Colors.text, fontSize: 13, fontWeight: '700' },
  hostBadge:       { position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center' },
  joinBtn:         { backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 28, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 10 },
  joinBtnLeave:    { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.accent },
  joinBtnText:     { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  joinBtnTextLeave:{ color: Colors.accent },
  cancelBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12, borderWidth: 1, borderColor: '#FF3B3040', borderRadius: 14, paddingVertical: 16, backgroundColor: '#FF3B3010' },
  cancelBtnText:     { color: '#FF3B30', fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  endBtn:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 28, borderRadius: 14, paddingVertical: 18, backgroundColor: Colors.accent },
  endBtnText:        { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  endedBanner:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, paddingVertical: 10, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: 10, backgroundColor: Colors.card },
  endedBannerText:   { color: Colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  respectHeader:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  respectHint:       { color: Colors.textMuted, fontSize: 12, marginBottom: 14, lineHeight: 18 },
  respectRemaining:  { marginLeft: 'auto' as any, color: Colors.accent, fontSize: 11, fontWeight: '800' },
  respectRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  respectAvatar:     { width: 36, height: 36, borderRadius: 18, borderWidth: 2, backgroundColor: Colors.inputBg, justifyContent: 'center', alignItems: 'center' },
  respectUsername:   { flex: 1, color: Colors.text, fontSize: 14, fontWeight: '700' },
  respectBtn:        { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  respectBtnText:    { color: Colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
});

const pc = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'flex-end' },
  dimArea:   { flex: 1 },
  // Close button floats above the sheet, never inside it
  closeBtn:  { position: 'absolute', bottom: '100%', alignSelf: 'flex-end', right: 20, marginBottom: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A1A2E', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2A2A3E' },
  sheet:     { backgroundColor: '#080810', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: '#1A1A2E', paddingBottom: 40, overflow: 'visible' },
  handle:    { width: 36, height: 4, borderRadius: 2, backgroundColor: '#2A2A3E', alignSelf: 'center', marginTop: 14, marginBottom: 10 },
  cardWrap:  { alignItems: 'center', paddingBottom: 8 },
  // Scale down slightly so the card's perspective rotation never clips against the sheet edges
  cardScale: { transform: [{ scale: 0.88 }], transformOrigin: 'top center' },
  hintRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  hintText:  { color: Colors.textMuted, fontSize: 11, fontWeight: '500' },
  notFound:  { color: Colors.textMuted, textAlign: 'center', padding: 40 },
});

const as = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'flex-end' },
  dimArea:   { flex: 1 },
  sheet:     { backgroundColor: '#080810', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: '#1A1A2E', maxHeight: '75%' },
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 14, paddingHorizontal: 20, paddingBottom: 4, zIndex: 10 },
  handle:    { width: 36, height: 4, borderRadius: 2, backgroundColor: '#2A2A3E' },
  closeBtn:  { position: 'absolute', right: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A1A2E', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  title:     { color: Colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 2, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  list:      { paddingHorizontal: 16, paddingBottom: 8 },
  row:       { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  avatar:    { width: 44, height: 44, borderRadius: 22, borderWidth: 2, backgroundColor: Colors.inputBg, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.35, shadowRadius: 6, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%', borderRadius: 22 },
  hostBadge: { position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center' },
  info:      { flex: 1 },
  nameRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  username:  { color: Colors.text, fontSize: 14, fontWeight: '800' },
  hostTag:   { fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  car:       { fontSize: 11, fontWeight: '600', marginTop: 2 },
});
