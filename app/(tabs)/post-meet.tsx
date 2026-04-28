import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Dimensions,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Modal, ActivityIndicator,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Circle, Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Colors } from '../../constants/colors';
import { collection, addDoc, onSnapshot, query, orderBy, where, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useUser } from '../../context/UserContext';

const { width: SW, height: SH } = Dimensions.get('window');
const CAR_TYPES = ['All Types', 'JDM', 'Euro', 'Muscle', 'Super/Hyper', 'Stance', 'Bikes'];
const GOOGLE_KEY = 'AIzaSyBN2H0Lh-y9vuNXQ4t4QFOnhMSAnLDznXY';
const RADIUS_OPTIONS = [
  { label: '3.1 mi',  sublabel: '5 km',   meters: 5000   },
  { label: '9.3 mi',  sublabel: '15 km',  meters: 15000  },
  { label: '24.9 mi', sublabel: '40 km',  meters: 40000  },
  { label: '62.1 mi', sublabel: '100 km', meters: 100000 },
];

interface Meet {
  id: string; title: string; location: string; date: string;
  description: string; carTypes: string[]; attendees: number;
  hostedBy: string; createdAt: any;
  lat?: number; lng?: number; radiusMeters?: number;
}

interface PickedLocation {
  lat: number; lng: number; address: string; radiusMeters: number;
}

const HOURS   = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const MINUTES = ['00','15','30','45'];
const DRUM_H  = 48;

function buildDays() {
  const days: Date[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push(d);
  }
  return days;
}
const DAY_NAMES  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDateTime(days: Date[], dayIdx: number, hourIdx: number, minIdx: number, ampm: 'AM'|'PM'): string {
  const d = days[dayIdx];
  const fullDay = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()];
  const mon = MONTH_ABBR[d.getMonth()];
  const hour = HOURS[hourIdx];
  const min  = MINUTES[minIdx];
  return `${fullDay}, ${mon} ${d.getDate()} · ${hour}:${min} ${ampm}`;
}

// ─── Drum Scroll ──────────────────────────────────────────────────────────────

function Drum({ items, index, onChange }: { items: string[]; index: number; onChange: (i: number) => void }) {
  const ref = useRef<ScrollView>(null);
  const pendingIdx = useRef(index);

  useEffect(() => {
    ref.current?.scrollTo({ y: index * DRUM_H, animated: false });
  }, []);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const raw = e.nativeEvent.contentOffset.y;
    pendingIdx.current = Math.max(0, Math.min(Math.round(raw / DRUM_H), items.length - 1));
  }, [items.length]);

  const onEnd = useCallback(() => {
    onChange(pendingIdx.current);
  }, [onChange]);

  return (
    <View style={dt.drumWrap}>
      <View style={dt.drumHighlight} pointerEvents="none" />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={DRUM_H}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: DRUM_H }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onEnd}
        onScrollEndDrag={onEnd}
      >
        {items.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={dt.drumItem}
            onPress={() => {
              onChange(i);
              ref.current?.scrollTo({ y: i * DRUM_H, animated: true });
            }}
          >
            <Text style={[dt.drumText, i === index && dt.drumTextActive]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Date Time Picker ─────────────────────────────────────────────────────────

function DateTimePicker({ dayIdx, hourIdx, minIdx, ampm, onDayChange, onHourChange, onMinChange, onAmPmChange }: {
  dayIdx: number; hourIdx: number; minIdx: number; ampm: 'AM'|'PM';
  onDayChange: (i: number) => void;
  onHourChange: (i: number) => void;
  onMinChange: (i: number) => void;
  onAmPmChange: (v: 'AM'|'PM') => void;
}) {
  const days = buildDays();

  return (
    <View style={dt.container}>
      {/* Day strip */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={dt.dayStrip}>
        {days.map((d, i) => {
          const label = i === 0 ? 'TODAY' : i === 1 ? 'TMRW' : DAY_NAMES[d.getDay()].toUpperCase();
          const active = i === dayIdx;
          return (
            <TouchableOpacity key={i} style={[dt.dayPill, active && dt.dayPillActive]} onPress={() => onDayChange(i)}>
              <Text style={[dt.dayPillLabel, active && dt.dayPillLabelActive]}>{label}</Text>
              <Text style={[dt.dayPillNum, active && dt.dayPillNumActive]}>{d.getDate()}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Time drums */}
      <View style={dt.timeRow}>
        <Drum items={HOURS} index={hourIdx} onChange={onHourChange} />
        <Text style={dt.timeSep}>:</Text>
        <Drum items={MINUTES} index={minIdx} onChange={onMinChange} />
        <View style={dt.ampmCol}>
          {(['AM','PM'] as const).map(v => (
            <TouchableOpacity key={v} style={[dt.ampmBtn, ampm === v && dt.ampmBtnActive]} onPress={() => onAmPmChange(v)}>
              <Text style={[dt.ampmText, ampm === v && dt.ampmTextActive]}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Map Picker ───────────────────────────────────────────────────────────────

function MapPicker({ onConfirm, onClose }: {
  onConfirm: (loc: PickedLocation) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 34.0522, longitude: -118.2437,
    latitudeDelta: 0.05, longitudeDelta: 0.05,
  });
  const [radiusIdx, setRadiusIdx] = useState(1);
  const [geocoding, setGeocoding] = useState(false);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pickedName = useRef<string | null>(null);
  const [pinnedCoord, setPinnedCoord] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const newRegion = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 800);
    })();
  }, []);

  async function fetchSuggestions(text: string) {
    if (text.length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${GOOGLE_KEY}`
      );
      const json = await res.json();
      setSuggestions(json.predictions ?? []);
    } catch { setSuggestions([]); }
  }

  function onSearchChange(text: string) {
    setSearch(text);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => fetchSuggestions(text), 300);
  }

  async function selectSuggestion(place: any) {
    setSearch(place.description);
    setSuggestions([]);
    pickedName.current = place.description; // remember the human-readable name
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=geometry&key=${GOOGLE_KEY}`
      );
      const json = await res.json();
      const loc = json.result?.geometry?.location;
      if (loc) {
        const newRegion = { latitude: loc.lat, longitude: loc.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 };
        setRegion(newRegion);
        setPinnedCoord({ latitude: loc.lat, longitude: loc.lng });
        mapRef.current?.animateToRegion(newRegion, 600);
      }
    } catch {}
  }

  async function handleConfirm() {
    const coord = pinnedCoord ?? { latitude: region.latitude, longitude: region.longitude };
    if (pickedName.current) {
      onConfirm({ lat: coord.latitude, lng: coord.longitude, address: pickedName.current, radiusMeters: RADIUS_OPTIONS[radiusIdx].meters });
      return;
    }
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coord.latitude},${coord.longitude}&key=${GOOGLE_KEY}`
      );
      const json = await res.json();
      const address = json.results?.[0]?.formatted_address ?? (search || `${coord.latitude.toFixed(4)}, ${coord.longitude.toFixed(4)}`);
      onConfirm({ lat: coord.latitude, lng: coord.longitude, address, radiusMeters: RADIUS_OPTIONS[radiusIdx].meters });
    } catch {
      onConfirm({ lat: coord.latitude, lng: coord.longitude, address: search || `${coord.latitude.toFixed(4)}, ${coord.longitude.toFixed(4)}`, radiusMeters: RADIUS_OPTIONS[radiusIdx].meters });
    } finally {
      setGeocoding(false);
    }
  }

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={region}
        onRegionChangeComplete={(r) => { setRegion(r); if (!pinnedCoord) pickedName.current = null; }}
        showsUserLocation
        showsCompass={false}
        customMapStyle={darkMapStyle}
      >
        {pinnedCoord ? (
          <>
            <Circle
              center={pinnedCoord}
              radius={RADIUS_OPTIONS[radiusIdx].meters}
              strokeColor={Colors.accent}
              strokeWidth={2}
              fillColor={Colors.accent + '22'}
            />
            <Marker coordinate={pinnedCoord} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={false}>
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="location" size={40} color={Colors.accent} />
              </View>
            </Marker>
          </>
        ) : (
          <Circle
            center={{ latitude: region.latitude, longitude: region.longitude }}
            radius={RADIUS_OPTIONS[radiusIdx].meters}
            strokeColor={Colors.accent}
            strokeWidth={2}
            fillColor={Colors.accent + '22'}
          />
        )}
      </MapView>

      {!pinnedCoord && (
        <View style={mp.pinContainer} pointerEvents="none">
          <Ionicons name="location" size={40} color={Colors.accent} style={{ marginBottom: 4 }} />
          <View style={mp.pinShadow} />
        </View>
      )}

      <View style={[mp.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={onClose} style={mp.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={mp.searchBox}>
          <Ionicons name="search" size={14} color={Colors.textMuted} />
          <TextInput
            style={mp.searchInput}
            value={search}
            onChangeText={onSearchChange}
            placeholder="Search location..."
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); setSuggestions([]); }}>
              <Ionicons name="close-circle" size={14} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {suggestions.length > 0 && (
        <View style={[mp.suggestionsBox, { top: insets.top + 72 }]}>
          {suggestions.slice(0, 4).map((p: any) => (
            <TouchableOpacity key={p.place_id} style={mp.suggestionItem} onPress={() => selectSuggestion(p)}>
              <Ionicons name="location-outline" size={12} color={Colors.accent} style={{ marginRight: 8 }} />
              <Text style={mp.suggestionText} numberOfLines={1}>{p.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={[mp.bottomPanel, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={mp.panelHint}>{pinnedCoord ? 'Pin locked · search again to change location' : 'Pan the map to position the pin'}</Text>
        <Text style={mp.radiusLabel}>MEET RADIUS</Text>
        <View style={mp.radiusRow}>
          {RADIUS_OPTIONS.map((opt, i) => (
            <TouchableOpacity
              key={opt.label}
              style={[mp.radiusBtn, i === radiusIdx && mp.radiusBtnActive]}
              onPress={() => setRadiusIdx(i)}
            >
              <Text style={[mp.radiusBtnText, i === radiusIdx && mp.radiusBtnTextActive]}>{opt.label}</Text>
              <Text style={[mp.radiusBtnSub, i === radiusIdx && mp.radiusBtnSubActive]}>{opt.sublabel}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={mp.confirmBtn} onPress={handleConfirm} disabled={geocoding}>
          {geocoding
            ? <ActivityIndicator color="#000" />
            : <><Ionicons name="checkmark-circle" size={18} color="#000" /><Text style={mp.confirmBtnText}>CONFIRM LOCATION</Text></>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Post Meet Modal ──────────────────────────────────────────────────────────

function PostMeetModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { user } = useUser();
  const [step, setStep] = useState<'form' | 'map'>('form');
  const [title, setTitle] = useState('');
  const [pickedLoc, setPickedLoc] = useState<PickedLocation | null>(null);
  const [dayIdx, setDayIdx]   = useState(0);
  const [hourIdx, setHourIdx] = useState(6); // default 7
  const [minIdx, setMinIdx]   = useState(0); // default :00
  const [ampm, setAmpm]       = useState<'AM'|'PM'>('PM');
  const [description, setDescription] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const DAYS = buildDays();

  function handleClose() {
    setStep('form');
    onClose();
  }

  const toggleType = (type: string) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handlePost = async () => {
    if (!title.trim() || !pickedLoc) {
      Alert.alert('Missing Info', 'Title and location are required.');
      return;
    }
    const dateString = formatDateTime(DAYS, dayIdx, hourIdx, minIdx, ampm);
    setLoading(true);
    try {
      await addDoc(collection(db, 'meets'), {
        title: title.trim(),
        location: pickedLoc.address,
        lat: pickedLoc.lat,
        lng: pickedLoc.lng,
        radiusMeters: pickedLoc.radiusMeters,
        date: dateString,
        description: description.trim(),
        carTypes: selectedTypes,
        attendees: 1,
        attendeeUids: [user.id],
        hostedBy: user.username,
        hostUid: user.id,
        createdAt: serverTimestamp(),
        status: 'active',
      });
      if (user.id && user.id !== '1') {
        await updateDoc(doc(db, 'users', user.id), { meetsHosted: increment(1) });
      }
      setTitle(''); setPickedLoc(null); setDayIdx(0); setHourIdx(6); setMinIdx(0); setAmpm('PM');
      setDescription(''); setSelectedTypes([]);
      setStep('form');
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const radiusLabel = pickedLoc
    ? RADIUS_OPTIONS.find(r => r.meters === pickedLoc.radiusMeters)?.label ?? ''
    : ''
;

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={s.modalOverlay}>
        {step === 'map' ? (
          <MapPicker
            onConfirm={(loc) => { setPickedLoc(loc); setStep('form'); }}
            onClose={() => setStep('form')}
          />
        ) : (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.modalSheet}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>POST A MEET</Text>
              <TouchableOpacity onPress={handleClose} style={s.modalClose}>
                <Text style={s.modalCloseTxt}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={s.modalScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Field label="MEET TITLE" value={title} onChangeText={setTitle} placeholder="e.g. SoCal JDM Night" />

              <View style={s.fieldWrapper}>
                <Text style={s.fieldLabel}>LOCATION</Text>
                <TouchableOpacity
                  style={[s.locBtn, pickedLoc && s.locBtnSet]}
                  onPress={() => setStep('map')}
                  activeOpacity={0.75}
                >
                  <Ionicons name="location" size={16} color={pickedLoc ? Colors.accent : Colors.textMuted} />
                  <View style={{ flex: 1 }}>
                    {pickedLoc ? (
                      <>
                        <Text style={s.locAddress} numberOfLines={1}>{pickedLoc.address}</Text>
                        <Text style={s.locRadius}>Radius: {radiusLabel}</Text>
                      </>
                    ) : (
                      <Text style={s.locPlaceholder}>Tap to drop a pin on the map</Text>
                    )}
                  </View>
                  <Ionicons name="map" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={s.fieldWrapper}>
                <Text style={s.fieldLabel}>WHEN</Text>
                <DateTimePicker
                  dayIdx={dayIdx} hourIdx={hourIdx} minIdx={minIdx} ampm={ampm}
                  onDayChange={setDayIdx} onHourChange={setHourIdx}
                  onMinChange={setMinIdx} onAmPmChange={setAmpm}
                />
              </View>
              <Field label="DESCRIPTION" value={description} onChangeText={setDescription} placeholder="Tell people what to expect..." multiline />
              <Text style={s.fieldLabel}>CAR TYPES WELCOME</Text>
              <View style={s.tagsGrid}>
                {CAR_TYPES.map(type => (
                  <TouchableOpacity key={type} activeOpacity={0.7} style={[s.tag, selectedTypes.includes(type) && s.tagActive]} onPress={() => toggleType(type)}>
                    <Text style={[s.tagText, selectedTypes.includes(type) && s.tagTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={s.postBtn} activeOpacity={0.8} onPress={handlePost}>
                {loading ? <ActivityIndicator color="#000" /> : <>
                  <Ionicons name="add-circle" size={18} color="#000" />
                  <Text style={s.postBtnText}>POST MEET</Text>
                </>}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </View>
    </Modal>
  );
}

function Field({ label, value, onChangeText, placeholder, multiline, icon }: any) {
  return (
    <View style={s.fieldWrapper}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={[s.inputWrapper, multiline && s.inputWrapperMultiline]}>
        {icon && <Ionicons name={icon} size={14} color={Colors.accent} style={{ marginRight: 8 }} />}
        <TextInput style={[s.input, multiline && s.inputMultiline]} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={Colors.textMuted} multiline={multiline} numberOfLines={multiline ? 4 : 1} />
      </View>
    </View>
  );
}

// ─── Meet Card ────────────────────────────────────────────────────────────────

function MeetCard({ meet, distance }: { meet: Meet; distance: number | null }) {
  const router = useRouter();
  return (
    <TouchableOpacity activeOpacity={0.75} style={s.meetCard} onPress={() => router.push(`/meet/${meet.id}`)}>
      <View style={s.meetCardTop}>
        <Text style={s.meetTitle} numberOfLines={1}>{meet.title}</Text>
        <View style={s.meetCardTopRight}>
          {distance !== null && (
            <Text style={s.distanceText}>{fmtDistance(distance)}</Text>
          )}
          <View style={s.attendeesBadge}>
            <Ionicons name="people" size={11} color={Colors.accent} />
            <Text style={s.attendeesText}>{meet.attendees}</Text>
          </View>
        </View>
      </View>
      <View style={s.meetRow}>
        <Ionicons name="location" size={12} color={Colors.accent} />
        <Text style={s.meetMeta} numberOfLines={1}>{meet.location}</Text>
      </View>
      <View style={s.meetRow}>
        <Ionicons name="calendar" size={12} color={Colors.textMuted} />
        <Text style={[s.meetMeta, { color: Colors.textMuted }]}>{meet.date}</Text>
      </View>
      <View style={s.meetFooter}>
        <View style={s.carTypesRow}>
          {meet.carTypes.map(t => (
            <View key={t} style={s.typePill}>
              <Text style={s.typePillText}>{t}</Text>
            </View>
          ))}
        </View>
        <Text style={s.hostedBy}>by {meet.hostedBy}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RADIUS_KM = 100;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)}m away` : `${km.toFixed(1)} km away`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Meets() {
  const [showPostModal, setShowPostModal] = useState(false);
  const [allMeets, setAllMeets] = useState<Meet[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [meetsLoading, setMeetsLoading] = useState(true);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status === 'granted') {
        Location.getCurrentPositionAsync({}).then(pos => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        }).catch(() => {}).finally(() => setLocationLoading(false));
      } else {
        setLocationLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'meets'), where('status', '!=', 'ended'), orderBy('status'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const results: Meet[] = [];
      snap.forEach(d => results.push({ id: d.id, ...d.data() } as Meet));
      setAllMeets(results);
      setMeetsLoading(false);
    });
    return () => unsub();
  }, []);

  const loading = locationLoading || meetsLoading;

  const nearbyMeets = userCoords
    ? allMeets
        .filter(m => m.lat && m.lng && haversineKm(userCoords.lat, userCoords.lng, m.lat!, m.lng!) <= RADIUS_KM)
        .sort((a, b) => haversineKm(userCoords.lat, userCoords.lng, a.lat!, a.lng!) - haversineKm(userCoords.lat, userCoords.lng, b.lat!, b.lng!))
    : allMeets;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={s.postCta} activeOpacity={0.8} onPress={() => setShowPostModal(true)}>
          <View style={s.postCtaLeft}>
            <Ionicons name="add-circle" size={22} color="#000" />
            <Text style={s.postCtaText}>POST A MEET</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#000" />
        </TouchableOpacity>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionDot} />
            <Text style={s.sectionTitle}>
              {userCoords ? `MEETS NEAR YOU · ${RADIUS_KM}KM` : 'ALL MEETS'}
            </Text>
          </View>
          {loading ? (
            <ActivityIndicator color={Colors.accent} style={{ marginTop: 40 }} />
          ) : nearbyMeets.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="flag-outline" size={48} color={Colors.textMuted} />
              <Text style={s.emptyTitle}>NO MEETS NEARBY</Text>
              <Text style={s.emptyText}>No meets within {RADIUS_KM}km. Check the Map tab to see meets worldwide.</Text>
            </View>
          ) : (
            nearbyMeets.map(m => (
              <MeetCard
                key={m.id}
                meet={m}
                distance={userCoords && m.lat && m.lng ? haversineKm(userCoords.lat, userCoords.lng, m.lat, m.lng) : null}
              />
            ))
          )}
        </View>
      </ScrollView>
      <PostMeetModal visible={showPostModal} onClose={() => setShowPostModal(false)} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:             { flex: 1, backgroundColor: Colors.background },
  scroll:                { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  postCta:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.accent, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 16, marginBottom: 28, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 8 },
  postCtaLeft:           { flexDirection: 'row', alignItems: 'center', gap: 10 },
  postCtaText:           { color: '#000', fontSize: 15, fontWeight: '900', letterSpacing: 2 },
  section:               { marginBottom: 28 },
  sectionHeader:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionDot:            { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.accent },
  sectionTitle:          { color: Colors.text, fontSize: 10, fontWeight: '900', letterSpacing: 2.5 },
  meetCard:              { backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.cardBorder, padding: 16, marginBottom: 10 },
  meetCardTop:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  meetCardTopRight:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  distanceText:          { color: Colors.textMuted, fontSize: 11, fontWeight: '700' },
  meetTitle:             { color: Colors.text, fontSize: 16, fontWeight: '900', flex: 1, marginRight: 10 },
  attendeesBadge:        { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.accentDim, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: Colors.accent + '40' },
  attendeesText:         { color: Colors.accent, fontSize: 11, fontWeight: '800' },
  meetRow:               { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  meetMeta:              { color: Colors.textSecondary, fontSize: 12, fontWeight: '500', flex: 1 },
  meetFooter:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  carTypesRow:           { flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 },
  typePill:              { backgroundColor: Colors.inputBg, borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: Colors.cardBorder },
  typePillText:          { color: Colors.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  hostedBy:              { color: Colors.textMuted, fontSize: 10, fontWeight: '600', marginLeft: 8 },
  empty:                 { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyTitle:            { color: Colors.textMuted, fontSize: 13, fontWeight: '900', letterSpacing: 3 },
  emptyText:             { color: Colors.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 20 },
  modalOverlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end', overflow: 'hidden' },
  modalSheet:            { backgroundColor: '#080810', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: '#1A1A2E', maxHeight: '92%' },
  modalHeader:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#111122' },
  modalTitle:            { color: Colors.accent, fontSize: 14, fontWeight: '900', letterSpacing: 3 },
  modalClose:            { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1A1A2E', justifyContent: 'center', alignItems: 'center' },
  modalCloseTxt:         { color: '#888', fontSize: 14, fontWeight: '700' },
  modalScroll:           { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  fieldWrapper:          { marginBottom: 16 },
  fieldLabel:            { color: Colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  inputWrapper:          { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13 },
  inputWrapperMultiline: { alignItems: 'flex-start', paddingTop: 12 },
  input:                 { flex: 1, color: Colors.text, fontSize: 14, fontWeight: '500' },
  inputMultiline:        { height: 90, textAlignVertical: 'top' },
  locBtn:                { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14 },
  locBtnSet:             { borderColor: Colors.accent + '60' },
  locPlaceholder:        { color: Colors.textMuted, fontSize: 14 },
  locAddress:            { color: Colors.text, fontSize: 13, fontWeight: '600' },
  locRadius:             { color: Colors.accent, fontSize: 11, fontWeight: '600', marginTop: 2 },
  tagsGrid:              { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 },
  tag:                   { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 8 },
  tagActive:             { backgroundColor: Colors.accentDim, borderColor: Colors.accent },
  tagText:               { color: Colors.textMuted, fontSize: 12, fontWeight: '700' },
  tagTextActive:         { color: Colors.accent },
  postBtn:               { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 8 },
  postBtnText:           { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
});

const dt = StyleSheet.create({
  container:        { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: 14, overflow: 'hidden' },
  dayStrip:         { paddingHorizontal: 12, paddingVertical: 14, gap: 8 },
  dayPill:          { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.cardBorder, minWidth: 52 },
  dayPillActive:    { backgroundColor: Colors.accentDim, borderColor: Colors.accent },
  dayPillLabel:     { color: Colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  dayPillLabelActive: { color: Colors.accent },
  dayPillNum:       { color: Colors.textMuted, fontSize: 18, fontWeight: '900', marginTop: 2 },
  dayPillNumActive: { color: Colors.text },
  timeRow:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderTopColor: Colors.cardBorder, paddingHorizontal: 20, paddingVertical: 4, gap: 4 },
  timeSep:          { color: Colors.textMuted, fontSize: 22, fontWeight: '900', marginBottom: 4, paddingHorizontal: 4 },
  drumWrap:         { width: 56, height: DRUM_H * 3, overflow: 'hidden', position: 'relative' },
  drumHighlight:    { position: 'absolute', top: DRUM_H, left: 0, right: 0, height: DRUM_H, backgroundColor: '#1A1A2E', borderRadius: 8, borderWidth: 1, borderColor: Colors.accent + '30' },
  drumItem:         { height: DRUM_H, justifyContent: 'center', alignItems: 'center' },
  drumText:         { color: Colors.textMuted, fontSize: 22, fontWeight: '700' },
  drumTextActive:   { color: Colors.text, fontSize: 24, fontWeight: '900' },
  ampmCol:          { marginLeft: 12, gap: 8 },
  ampmBtn:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.cardBorder },
  ampmBtnActive:    { backgroundColor: Colors.accentDim, borderColor: Colors.accent },
  ampmText:         { color: Colors.textMuted, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  ampmTextActive:   { color: Colors.accent },
});

const mp = StyleSheet.create({
  pinContainer:    { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  pinShadow:       { width: 8, height: 4, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.3)' },
  topBar:          { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: 'rgba(5,5,15,0.85)' },
  backBtn:         { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center' },
  topTitle:        { color: Colors.accent, fontSize: 13, fontWeight: '900', letterSpacing: 3 },
  bottomPanel:     { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(5,5,15,0.92)', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: '#1A1A2E', paddingHorizontal: 20, paddingTop: 20 },
  panelHint:       { color: Colors.textMuted, fontSize: 12, textAlign: 'center', marginBottom: 16 },
  radiusLabel:     { color: Colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 10 },
  radiusRow:       { flexDirection: 'row', gap: 10, marginBottom: 20 },
  radiusBtn:       { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Colors.cardBorder, alignItems: 'center', backgroundColor: Colors.card },
  radiusBtnActive: { backgroundColor: Colors.accentDim, borderColor: Colors.accent },
  radiusBtnText:       { color: Colors.textMuted, fontSize: 12, fontWeight: '800' },
  radiusBtnTextActive: { color: Colors.accent },
  radiusBtnSub:        { color: Colors.textMuted, fontSize: 10, fontWeight: '500', opacity: 0.6, marginTop: 2 },
  radiusBtnSubActive:  { color: Colors.accent, opacity: 0.7 },
  confirmBtn:      { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  confirmBtnText:  { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  searchBox:       { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, marginLeft: 10, borderWidth: 1, borderColor: Colors.cardBorder },
  searchInput:     { flex: 1, color: Colors.text, fontSize: 13, fontWeight: '500' },
  suggestionsBox:  { position: 'absolute', left: 16, right: 16, backgroundColor: '#0a0a1a', borderRadius: 12, borderWidth: 1, borderColor: Colors.cardBorder, overflow: 'hidden', zIndex: 999 },
  suggestionItem:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  suggestionText:  { color: Colors.text, fontSize: 13, flex: 1 },
});

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1c2a3a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#050510' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];
