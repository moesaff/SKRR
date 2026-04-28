import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  ActivityIndicator, Platform,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Colors } from '../../constants/colors';

interface Meet {
  id: string;
  title: string;
  location: string;
  date: string;
  attendees: number;
  hostedBy: string;
  lat?: number;
  lng?: number;
}

const WORLD_REGION: Region = {
  latitude: 20,
  longitude: 0,
  latitudeDelta: 100,
  longitudeDelta: 100,
};

export default function MapTab() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [meets, setMeets] = useState<Meet[]>([]);
  const [selected, setSelected] = useState<Meet | null>(null);
  const [loading, setLoading] = useState(true);
  const sheetAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const q = query(
      collection(db, 'meets'),
      where('status', '!=', 'ended'),
      orderBy('status'),
      orderBy('createdAt', 'desc'),
    );
    const unsub = onSnapshot(q, (snap) => {
      const results: Meet[] = [];
      snap.forEach(d => {
        const data = d.data();
        if (data.lat && data.lng) {
          results.push({ id: d.id, ...data } as Meet);
        }
      });
      setMeets(results);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status !== 'granted') return;
      Location.getCurrentPositionAsync({}).then(pos => {
        mapRef.current?.animateToRegion({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: 0.3,
          longitudeDelta: 0.3,
        }, 800);
      }).catch(() => {});
    });
  }, []);

  function selectMeet(meet: Meet) {
    setSelected(meet);
    Animated.spring(sheetAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 12 }).start();
    mapRef.current?.animateToRegion({
      latitude: meet.lat! - 0.01,
      longitude: meet.lng!,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    }, 400);
  }

  function dismissSheet() {
    Animated.timing(sheetAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setSelected(null));
  }

  const sheetY = sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [220, 0] });

  async function goToNearMe() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const pos = await Location.getCurrentPositionAsync({});
    mapRef.current?.animateToRegion({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    }, 600);
  }

  return (
    <View style={s.container}>
      <MapView
        ref={mapRef}
        style={s.map}
        initialRegion={WORLD_REGION}
        customMapStyle={darkMapStyle}
        onPress={dismissSheet}
        showsUserLocation
        showsCompass={false}
        showsScale={false}
      >
        {meets.map(meet => (
          <Marker
            key={meet.id}
            coordinate={{ latitude: meet.lat!, longitude: meet.lng! }}
            onPress={(e) => { e.stopPropagation(); selectMeet(meet); }}
            tracksViewChanges={false}
            anchor={{ x: 0.5, y: 1 }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => selectMeet(meet)}
              style={s.pinWrap}
            >
              <View style={[s.pin, selected?.id === meet.id && s.pinActive]}>
                <Ionicons name="flag" size={12} color="#000" />
              </View>
              <View style={s.pinTail} />
            </TouchableOpacity>
          </Marker>
        ))}
      </MapView>

      {loading && (
        <View style={s.loadingOverlay}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      )}

      {!loading && meets.length === 0 && (
        <View style={s.emptyOverlay} pointerEvents="none">
          <View style={s.emptyBadge}>
            <Ionicons name="flag-outline" size={18} color={Colors.textMuted} />
            <Text style={s.emptyText}>No active meets right now</Text>
          </View>
        </View>
      )}

      <View style={s.countBadge} pointerEvents="none">
        <View style={s.dot} />
        <Text style={s.countText}>{meets.length} ACTIVE {meets.length === 1 ? 'MEET' : 'MEETS'}</Text>
      </View>

      <TouchableOpacity style={s.nearMeBtn} onPress={goToNearMe} activeOpacity={0.8}>
        <Ionicons name="navigate" size={15} color={Colors.accent} />
        <Text style={s.nearMeText}>NEAR ME</Text>
      </TouchableOpacity>

      {selected && (
        <Animated.View style={[s.sheet, { transform: [{ translateY: sheetY }] }]}>
          <View style={s.sheetHandle} />
          <Text style={s.meetTitle} numberOfLines={1}>{selected.title}</Text>
          <View style={s.sheetRow}>
            <Ionicons name="location" size={13} color={Colors.accent} />
            <Text style={s.sheetMeta} numberOfLines={1}>{selected.location}</Text>
          </View>
          <View style={s.sheetRow}>
            <Ionicons name="calendar" size={13} color={Colors.accent} />
            <Text style={s.sheetMeta}>{selected.date}</Text>
          </View>
          <View style={s.sheetRow}>
            <Ionicons name="people" size={13} color={Colors.accent} />
            <Text style={s.sheetMeta}>{selected.attendees} going · hosted by {selected.hostedBy}</Text>
          </View>
          <TouchableOpacity
            style={s.viewBtn}
            activeOpacity={0.8}
            onPress={() => { dismissSheet(); router.push(`/meet/${selected.id}`); }}
          >
            <Text style={s.viewBtnText}>VIEW MEET</Text>
            <Ionicons name="arrow-forward" size={14} color="#000" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  pinWrap: { alignItems: 'center' },
  pin: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.accent,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.6, shadowRadius: 6,
    elevation: 6,
  },
  pinActive: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#fff',
    borderColor: Colors.accent, borderWidth: 2.5,
  },
  pinTail: {
    width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 7,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: Colors.accent,
    alignSelf: 'center',
    marginTop: -1,
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(5,5,15,0.6)',
  },

  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end', alignItems: 'center',
    paddingBottom: 120,
  },
  emptyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(13,13,31,0.9)',
    borderWidth: 1, borderColor: Colors.cardBorder,
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
  },
  emptyText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },

  nearMeBtn: {
    position: 'absolute', top: Platform.OS === 'ios' ? 100 : 60, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(13,13,31,0.88)',
    borderWidth: 1, borderColor: Colors.accent + '60',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  nearMeText: { color: Colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },

  countBadge: {
    position: 'absolute', top: Platform.OS === 'ios' ? 56 : 16, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(13,13,31,0.88)',
    borderWidth: 1, borderColor: Colors.cardBorder,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.accent },
  countText: { color: Colors.text, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },

  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#0D0D1F',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1, borderColor: Colors.cardBorder,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.cardBorder,
    alignSelf: 'center', marginBottom: 16,
  },
  meetTitle: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 0.5, marginBottom: 12 },
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 },
  sheetMeta: { color: Colors.textMuted, fontSize: 13, fontWeight: '500', flex: 1 },

  viewBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.accent, borderRadius: 12,
    paddingVertical: 14, marginTop: 16,
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  viewBtnText: { color: '#000', fontSize: 13, fontWeight: '900', letterSpacing: 2 },
});

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0d0d1f' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b6b8a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d0d1f' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a3a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0d0d1f' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1f1f4a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#05050f' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#9999cc' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#555577' }] },
];
