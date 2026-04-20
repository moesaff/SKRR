import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Dimensions,
  PanResponder,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useUser } from '../context/UserContext';
import { ALL_MAKES } from '../constants/carDatabase';
import { CARD_BACKGROUNDS, AURA_OPTIONS } from '../components/FlipCard';

const DRIVETRAINS = ['RWD', 'FWD', 'AWD', '4WD'];
const CURRENT_YEAR = new Date().getFullYear();
const PICKER_STRIP_W = Dimensions.get('window').width - 96;

// ── Aura picker icons ─────────────────────────────────────────────────────────

function AuraPickerIcon({ id, color }: { id: string; color: string }) {
  const S = 30;
  const c = S / 2;
  const glow = { shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 5 };
  const dot = (style: object) => <View style={[style, glow]} />;

  if (id === 'none') {
    return (
      <View style={{ width: S, height: S, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: '#444' }} />
      </View>
    );
  }

  if (id === 'midnight_purple') {
    // Spiral: 9 dots tracing a 1.5-rotation inward spiral
    return (
      <View style={{ width: S, height: S }}>
        {Array.from({ length: 9 }, (_, i) => {
          const pct = i / 8;
          const angle = pct * Math.PI * 3;
          const r = 11 * (1 - pct * 0.58);
          const ds = Math.max(1.5, 4.5 - pct * 2.5);
          return (
            <View
              key={i}
              style={[{
                position: 'absolute',
                width: ds, height: ds, borderRadius: ds / 2,
                backgroundColor: color,
                left: c + Math.cos(angle) * r - ds / 2,
                top: c + Math.sin(angle) * r - ds / 2,
                opacity: 0.35 + pct * 0.65,
              }, glow]}
            />
          );
        })}
      </View>
    );
  }

  if (id === 'bolt') {
    // Lightning bolt: 3 angled bars forming a Z
    return (
      <View style={{ width: S, height: S }}>
        {dot({ position: 'absolute', width: 13, height: 3.5, borderRadius: 1.75, backgroundColor: color, left: 12, top: 5,  transform: [{ rotate: '-55deg' }] })}
        {dot({ position: 'absolute', width: 9,  height: 3.5, borderRadius: 1.75, backgroundColor: color, left: 10, top: 13, transform: [{ rotate: '-10deg' }] })}
        {dot({ position: 'absolute', width: 13, height: 3.5, borderRadius: 1.75, backgroundColor: color, left: 5,  top: 20, transform: [{ rotate: '-55deg' }] })}
      </View>
    );
  }

  if (id === 'miami_pink') {
    // Palm tree: trunk + 5 pill-shaped leaves radiating from trunk top
    const leaves = [-155, -120, -90, -60, -25];
    return (
      <View style={{ width: S, height: S }}>
        {dot({ position: 'absolute', width: 3, height: 13, borderRadius: 1.5, backgroundColor: color, left: c - 1.5, top: 15 })}
        {leaves.map((angle, i) => (
          <View key={i} style={{ position: 'absolute', left: c, top: 15, width: 0, height: 0, transform: [{ rotate: `${angle}deg` }] }}>
            {dot({ position: 'absolute', width: 11, height: 2.5, borderRadius: 2, backgroundColor: color, left: 0, top: -1.25, opacity: i === 2 ? 1 : 0.75 })}
          </View>
        ))}
      </View>
    );
  }

  if (id === 'ghost_white') {
    // Ghost: clipped dome + side pillars + eye dots + 3 wavy bumps
    return (
      <View style={{ width: S, height: S }}>
        {/* Top dome — half circle using overflow:hidden clip */}
        <View style={{ position: 'absolute', width: 18, height: 9, overflow: 'hidden', left: c - 9, top: 3 }}>
          <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: color, ...glow }} />
        </View>
        {/* Left side pillar */}
        {dot({ position: 'absolute', width: 2, height: 12, borderRadius: 1, backgroundColor: color, left: c - 9,     top: 11 })}
        {/* Right side pillar */}
        {dot({ position: 'absolute', width: 2, height: 12, borderRadius: 1, backgroundColor: color, left: c + 7,     top: 11 })}
        {/* Eyes */}
        {dot({ position: 'absolute', width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: color, left: c - 5.5, top: 8 })}
        {dot({ position: 'absolute', width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: color, left: c + 2,   top: 8 })}
        {/* Wavy bottom bumps */}
        {[c - 9, c - 3, c + 3].map((x, i) => (
          <View key={i} style={[{ position: 'absolute', width: 6, height: 5, borderBottomLeftRadius: 3, borderBottomRightRadius: 3, borderWidth: 2, borderTopWidth: 0, borderColor: color, left: x, top: 21 }, glow]} />
        ))}
      </View>
    );
  }

  if (id === 'sunset') {
    const sunY = 20, sunR = 7;
    return (
      <View style={{ width: S, height: S }}>
        {/* Horizon line */}
        {dot({ position: 'absolute', width: 26, height: 2, borderRadius: 1, backgroundColor: color, left: 2, top: sunY - 1 })}
        {/* Sun half circle */}
        {dot({ position: 'absolute', width: sunR * 2, height: sunR, borderTopLeftRadius: sunR, borderTopRightRadius: sunR, backgroundColor: color, left: c - sunR, top: sunY - sunR })}
        {/* Rays from sun center */}
        {[-45, -22, 0, 22, 45].map((angle, i) => (
          <View key={i} style={{ position: 'absolute', left: c, top: sunY, width: 0, height: 0, transform: [{ rotate: `${angle}deg` }] }}>
            {dot({ position: 'absolute', width: 2, height: 5, borderRadius: 1, backgroundColor: color, left: -1, top: -(sunR + 6), opacity: 0.8 })}
          </View>
        ))}
      </View>
    );
  }

  return null;
}

function hsvToHex(h: number, s: number, v: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  const hex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${hex(f(5))}${hex(f(3))}${hex(f(1))}`;
}

function hexToHsv(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return [0, 1, 1];
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  return [h < 0 ? h + 360 : h, max === 0 ? 0 : d / max, max];
}

function ColorPickerModal({ visible, initial, onClose, onSelect }: {
  visible: boolean; initial: string; onClose: () => void; onSelect: (c: string) => void;
}) {
  const initHsv = hexToHsv(initial);
  const [hue, setHue]   = useState(initHsv[0]);
  const [sat, setSat]   = useState(initHsv[1]);
  const [val, setVal]   = useState(initHsv[2]);

  useEffect(() => {
    if (visible) { const [h, s, v] = hexToHsv(initial); setHue(h); setSat(s); setVal(v); }
  }, [visible]);

  const selected   = hsvToHex(hue, sat, val);
  const pureHue    = hsvToHex(hue, 1, 1);
  const brightBase = hsvToHex(hue, sat, 1);

  const huePan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => setHue(Math.max(0, Math.min(360, (e.nativeEvent.locationX / PICKER_STRIP_W) * 360))),
    onPanResponderMove: (e) => setHue(Math.max(0, Math.min(360, (e.nativeEvent.locationX / PICKER_STRIP_W) * 360))),
  })).current;

  const satPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => setSat(Math.max(0, Math.min(1, e.nativeEvent.locationX / PICKER_STRIP_W))),
    onPanResponderMove: (e) => setSat(Math.max(0, Math.min(1, e.nativeEvent.locationX / PICKER_STRIP_W))),
  })).current;

  const valPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => setVal(Math.max(0, Math.min(1, e.nativeEvent.locationX / PICKER_STRIP_W))),
    onPanResponderMove: (e) => setVal(Math.max(0, Math.min(1, e.nativeEvent.locationX / PICKER_STRIP_W))),
  })).current;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={pk.overlay}>
        <View style={pk.sheet}>
          <Text style={pk.title}>OUTLINE COLOR</Text>
          <View style={[pk.preview, { backgroundColor: selected, shadowColor: selected }]} />

          <Text style={pk.stripLabel}>HUE</Text>
          <View style={pk.stripWrap} {...huePan.panHandlers}>
            <LinearGradient colors={['#FF0000','#FFFF00','#00FF00','#00FFFF','#0000FF','#FF00FF','#FF0000']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={pk.strip} />
            <View style={[pk.thumb, { left: Math.max(0, (hue / 360) * PICKER_STRIP_W - 9) }]} />
          </View>

          <Text style={pk.stripLabel}>SATURATION</Text>
          <View style={pk.stripWrap} {...satPan.panHandlers}>
            <LinearGradient colors={['#888888', pureHue]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={pk.strip} />
            <View style={[pk.thumb, { left: Math.max(0, sat * PICKER_STRIP_W - 9) }]} />
          </View>

          <Text style={pk.stripLabel}>BRIGHTNESS</Text>
          <View style={pk.stripWrap} {...valPan.panHandlers}>
            <LinearGradient colors={['#000000', brightBase]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={pk.strip} />
            <View style={[pk.thumb, { left: Math.max(0, val * PICKER_STRIP_W - 9) }]} />
          </View>

          <View style={pk.btns}>
            <Pressable style={pk.cancelBtn} onPress={onClose}>
              <Text style={pk.cancelTxt}>CANCEL</Text>
            </Pressable>
            <Pressable style={[pk.selectBtn, { backgroundColor: selected, shadowColor: selected }]} onPress={() => { onSelect(selected); onClose(); }}>
              <Text style={[pk.selectTxt, { color: val < 0.55 ? '#fff' : '#000' }]}>SELECT</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const pk = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'flex-end' },
  sheet:     { backgroundColor: '#0E0E0E', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 52, borderTopWidth: 1, borderColor: '#222' },
  title:     { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 3, textAlign: 'center', marginBottom: 24 },
  preview:   { width: 72, height: 72, borderRadius: 36, alignSelf: 'center', marginBottom: 28, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 20 },
  stripLabel:{ color: '#555', fontSize: 9, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  stripWrap: { width: PICKER_STRIP_W, height: 44, justifyContent: 'center', marginBottom: 20, position: 'relative' },
  strip:     { width: '100%', height: 28, borderRadius: 14 },
  thumb:     { position: 'absolute', width: 18, height: 44, top: 0, borderWidth: 3, borderColor: '#fff', borderRadius: 9, backgroundColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.6, shadowRadius: 4 },
  btns:      { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 15, borderRadius: 12, borderWidth: 1, borderColor: '#2A2A2A', alignItems: 'center' },
  cancelTxt: { color: '#555', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  selectBtn: { flex: 2, paddingVertical: 15, borderRadius: 12, alignItems: 'center', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 12 },
  selectTxt: { fontSize: 12, fontWeight: '900', letterSpacing: 2 },
});

export default function EditCard() {
  const router = useRouter();
  const { user, updateUser, updateCar } = useUser();

  const [username, setUsername] = useState(user.username);
  const [location, setLocation] = useState(user.location);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(user.profilePhoto);

  const [carYear, setCarYear] = useState(user.car.year);
  const [make, setMake] = useState(user.car.make);
  const [showMakeSuggestions, setShowMakeSuggestions] = useState(false);
  const [model, setModel] = useState(user.car.model);

  const makeSuggestions = useMemo(() => {
    if (!make.trim()) return [];
    const q = make.toLowerCase().replace(/[-\s]/g, '');
    return ALL_MAKES.filter((m) =>
      m.toLowerCase().replace(/[-\s]/g, '').includes(q)
    ).slice(0, 8);
  }, [make]);
  const [carPhoto, setCarPhoto] = useState<string | null>(user.car.photo ?? null);

  const [hp, setHp] = useState(String(user.car.hp));
  const [torque, setTorque] = useState(String(user.car.torque));
  const [zeroToSixty, setZeroToSixty] = useState(user.car.zeroToSixty);
  const [drivetrain, setDrivetrain] = useState(user.car.drivetrain);
  const [engine, setEngine] = useState(user.car.engine);
  const [modsText, setModsText] = useState(user.car.mods.join('\n'));

  const [cardBg, setCardBg] = useState(user.cardStyle?.background ?? 'original');
  const [outlineColor, setOutlineColor] = useState(user.cardStyle?.outlineColor ?? '#FF0080');
  const [aura, setAura] = useState(user.cardStyle?.aura ?? 'none');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const pickImage = async (type: 'profile' | 'car') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to upload images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'profile' ? [1, 1] : [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      if (type === 'profile') setProfilePhoto(uri);
      else setCarPhoto(uri);
    }
  };

  const handleSave = () => {
    if (!username.trim()) {
      Alert.alert('Missing info', 'Username cannot be empty.');
      return;
    }
    updateUser({
      username: username.trim(),
      location: location.trim(),
      profilePhoto,
      cardStyle: { background: cardBg, outlineColor, aura },
    });
    updateCar({
      year: carYear,
      make: make.trim(),
      model: model.trim(),
      photo: carPhoto,
      hp: parseInt(hp) || 0,
      torque: parseInt(torque) || 0,
      zeroToSixty: zeroToSixty.trim(),
      drivetrain,
      engine: engine.trim(),
      mods: modsText.split('\n').map((m) => m.trim()).filter(Boolean),
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── PROFILE ── */}
          <SectionHeader title="PROFILE" icon="person" />

          <Pressable style={styles.photoPicker} onPress={() => pickImage('profile')}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.profilePhotoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera" size={28} color={Colors.accent} />
                <Text style={styles.photoPlaceholderText}>ADD PHOTO</Text>
              </View>
            )}
            <View style={styles.photoEditBadge}>
              <Ionicons name="pencil" size={10} color="#000" />
            </View>
          </Pressable>

          <Field label="USERNAME" value={username} onChangeText={setUsername} placeholder="Your username" icon="at" />
          <Field label="CITY" value={location} onChangeText={setLocation} placeholder="e.g. Los Angeles, CA" icon="location" />

          {/* ── VEHICLE ── */}
          <SectionHeader title="VEHICLE" icon="car-sport" />

          <Pressable style={styles.carPhotoPicker} onPress={() => pickImage('car')}>
            {carPhoto ? (
              <Image source={{ uri: carPhoto }} style={styles.carPhotoPreview} />
            ) : (
              <View style={styles.carPhotoPlaceholder}>
                <Ionicons name="camera" size={24} color={Colors.accentCyan} />
                <Text style={styles.carPhotoPlaceholderText}>ADD CAR PHOTO</Text>
              </View>
            )}
            <View style={[styles.photoEditBadge, { backgroundColor: Colors.accentCyan }]}>
              <Ionicons name="pencil" size={10} color="#000" />
            </View>
          </Pressable>

          <Text style={styles.label}>YEAR</Text>
          <YearPicker value={carYear} onChange={setCarYear} />

          <Text style={styles.label}>MAKE</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="car-sport" size={14} color={Colors.accent} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              value={make}
              onChangeText={(t) => { setMake(t); setShowMakeSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowMakeSuggestions(false), 150)}
              placeholder="e.g. Nissan, BMW, Ferrari"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="words"
            />
            {make.length > 0 && (
              <Pressable onPress={() => setMake('')}>
                <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
              </Pressable>
            )}
          </View>
          {showMakeSuggestions && makeSuggestions.length > 0 && (
            <View style={styles.suggestions}>
              {makeSuggestions.map((m) => (
                <Pressable
                  key={m}
                  style={styles.suggestionItem}
                  onPress={() => { setMake(m); setShowMakeSuggestions(false); }}
                >
                  <Ionicons name="car-sport" size={13} color={Colors.accent} />
                  <Text style={styles.suggestionText}>{m}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Field label="MODEL" value={model} onChangeText={setModel} placeholder="e.g. Skyline R34, M3, 488 GTB" icon="list" />

          {/* ── VEHICLE STATS ── */}
          <SectionHeader title="VEHICLE STATS" icon="speedometer" />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="HP" value={hp} onChangeText={setHp} placeholder="500" keyboardType="numeric" accent={Colors.accent} />
            </View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}>
              <Field label="TORQUE (lb-ft)" value={torque} onChangeText={setTorque} placeholder="400" keyboardType="numeric" accent={Colors.accentCyan} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="0-60 TIME" value={zeroToSixty} onChangeText={setZeroToSixty} placeholder="4.2s" />
            </View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}>
              <Field label="ENGINE" value={engine} onChangeText={setEngine} placeholder="RB26DETT" />
            </View>
          </View>

          <Text style={styles.label}>DRIVETRAIN</Text>
          <View style={styles.drivetrainRow}>
            {DRIVETRAINS.map((d) => (
              <Pressable
                key={d}
                style={[styles.drivetrainBtn, drivetrain === d && styles.drivetrainBtnActive]}
                onPress={() => setDrivetrain(d)}
              >
                <Text style={[styles.drivetrainText, drivetrain === d && styles.drivetrainTextActive]}>{d}</Text>
              </Pressable>
            ))}
          </View>

          {/* ── MODS ── */}
          <SectionHeader title="MODS" icon="build" />
          <Text style={styles.modsHint}>One mod per line</Text>
          <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingTop: 12 }]}>
            <TextInput
              style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
              value={modsText}
              onChangeText={setModsText}
              placeholder={'HKS GT2835 Turbo\nNismo Suspension\nBride Seats'}
              placeholderTextColor={Colors.textMuted}
              multiline
            />
          </View>

          {/* ── CARD STYLE ── */}
          <SectionHeader title="CARD STYLE" icon="color-palette" />

          <Text style={styles.label}>BACKGROUND</Text>
          <View style={styles.bgRow}>
            {CARD_BACKGROUNDS.map((bg) => (
              <Pressable
                key={bg.id}
                onPress={() => setCardBg(bg.id)}
                style={[styles.bgOption, { backgroundColor: bg.color, borderColor: cardBg === bg.id ? outlineColor : '#333' }]}
              >
                {cardBg === bg.id && <Ionicons name="checkmark" size={14} color={bg.id === 'white' ? '#000' : '#fff'} />}
                <Text style={[styles.bgLabel, bg.id === 'white' && { color: '#333' }]}>{bg.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>OUTLINE</Text>
          <Pressable style={[styles.colorPickerBtn, { borderColor: outlineColor }]} onPress={() => setShowColorPicker(true)}>
            <View style={[styles.colorPickerSwatch, { backgroundColor: outlineColor, shadowColor: outlineColor }]} />
            <Text style={[styles.colorPickerLabel, { color: outlineColor }]}>
              {outlineColor.toUpperCase()}
            </Text>
            <Ionicons name="color-palette" size={18} color={outlineColor} />
          </Pressable>
          <ColorPickerModal
            visible={showColorPicker}
            initial={outlineColor}
            onClose={() => setShowColorPicker(false)}
            onSelect={setOutlineColor}
          />

          <Text style={styles.label}>AURA</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingRight: 4 }}>
              {AURA_OPTIONS.map((a) => (
                <Pressable
                  key={a.id}
                  onPress={() => setAura(a.id)}
                  style={[
                    styles.auraOption,
                    aura === a.id && { borderColor: a.color === 'transparent' ? '#555' : a.color, backgroundColor: (a.color === 'transparent' ? '#555' : a.color) + '20' },
                  ]}
                >
                  <AuraPickerIcon id={a.id} color={a.color === 'transparent' ? '#555' : a.color} />
                  <Text style={[styles.auraLabel, aura === a.id && { color: Colors.text }]}>{a.label}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Ionicons name="checkmark-circle" size={18} color="#000" />
            <Text style={styles.saveBtnText}>SAVE CARD</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const YEAR_ITEM_H = 40;
const WHEEL_VISIBLE = 3;
const MIN_YEAR = 1970;
const MAX_YEAR = new Date().getFullYear() + 1;
const ALL_YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i);

function YearPicker({ value, onChange }: { value: number; onChange: (y: number) => void }) {
  const scrollRef = useRef<ScrollView>(null);
  const [displayed, setDisplayed] = useState(value);

  useEffect(() => {
    const idx = value - MIN_YEAR;
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: idx * YEAR_ITEM_H, animated: false });
    }, 80);
  }, []);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / YEAR_ITEM_H);
    const year = ALL_YEARS[Math.max(0, Math.min(idx, ALL_YEARS.length - 1))];
    if (year !== displayed) setDisplayed(year);
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / YEAR_ITEM_H);
    const year = ALL_YEARS[Math.max(0, Math.min(idx, ALL_YEARS.length - 1))];
    setDisplayed(year);
    onChange(year);
  };

  return (
    <View style={ypStyles.outer}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={YEAR_ITEM_H}
        decelerationRate="fast"
        onScroll={onScroll}
        onMomentumScrollEnd={onScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: YEAR_ITEM_H * Math.floor(WHEEL_VISIBLE / 2) }}
      >
        {ALL_YEARS.map((year) => {
          const dist = Math.abs(year - displayed);
          const isSelected = dist === 0;
          return (
            <View key={year} style={{ height: YEAR_ITEM_H, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[
                ypStyles.yearText,
                { opacity: Math.max(0.2, 1 - dist * 0.5), fontSize: isSelected ? 24 : 15 },
                isSelected && ypStyles.yearTextSelected,
              ]}>
                {year}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      {/* Top fade overlay */}
      <View style={ypStyles.fadeTop} pointerEvents="none" />
      {/* Selection lines */}
      <View style={ypStyles.selector} pointerEvents="none" />
      {/* Bottom fade overlay */}
      <View style={ypStyles.fadeBottom} pointerEvents="none" />
    </View>
  );
}

const ypStyles = StyleSheet.create({
  outer: {
    height: YEAR_ITEM_H * WHEEL_VISIBLE,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    marginBottom: 14,
  },
  yearText: {
    color: Colors.textMuted,
    fontWeight: '600',
    letterSpacing: 1,
  },
  yearTextSelected: {
    color: Colors.accent,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: Colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  selector: {
    position: 'absolute',
    top: YEAR_ITEM_H * Math.floor(WHEEL_VISIBLE / 2),
    left: 24,
    right: 24,
    height: YEAR_ITEM_H,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.accent + '80',
  },
  fadeTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: YEAR_ITEM_H * Math.floor(WHEEL_VISIBLE / 2),
    backgroundColor: Colors.card,
    opacity: 0.65,
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: YEAR_ITEM_H * Math.floor(WHEEL_VISIBLE / 2),
    backgroundColor: Colors.card,
    opacity: 0.65,
  },
});

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon as any} size={14} color={Colors.accent} />
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType, icon, accent }: any) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        {icon && <Ionicons name={icon} size={14} color={Colors.accent} style={{ marginRight: 8 }} />}
        <TextInput
          style={[styles.input, accent && { color: accent }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          keyboardType={keyboardType ?? 'default'}
          autoCapitalize="words"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 50 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 16 },
  sectionTitle: { color: Colors.accent, fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  sectionLine: { flex: 1, height: 1, backgroundColor: Colors.accent + '30' },

  photoPicker: { alignSelf: 'center', marginBottom: 20, position: 'relative' },
  profilePhotoPreview: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: Colors.accent },
  photoPlaceholder: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: Colors.inputBg, borderWidth: 2, borderColor: Colors.accent,
    justifyContent: 'center', alignItems: 'center', gap: 4,
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 12,
  },
  photoPlaceholderText: { color: Colors.accent, fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  photoEditBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center',
  },

  carPhotoPicker: { marginBottom: 16, position: 'relative' },
  carPhotoPreview: { width: '100%', height: 140, borderRadius: 12, borderWidth: 1, borderColor: Colors.accentCyan },
  carPhotoPlaceholder: {
    width: '100%', height: 140, borderRadius: 12,
    backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.accentCyan + '50',
    justifyContent: 'center', alignItems: 'center', gap: 6,
  },
  carPhotoPlaceholderText: { color: Colors.accentCyan, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },


  row: { flexDirection: 'row' },
  fieldWrapper: { marginBottom: 14 },
  label: { color: Colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 7 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    marginBottom: 14,
  },
  input: { flex: 1, color: Colors.text, fontSize: 14, fontWeight: '500' },

  suggestions: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.accent + '40',
    borderRadius: 10, marginTop: -10, marginBottom: 14, overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  suggestionText: { color: Colors.text, fontSize: 14, fontWeight: '600' },

  drivetrainRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  drivetrainBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: 8,
  },
  drivetrainBtnActive: { backgroundColor: Colors.cyanDim, borderColor: Colors.accentCyan },
  drivetrainText: { color: Colors.textMuted, fontSize: 12, fontWeight: '800' },
  drivetrainTextActive: { color: Colors.accentCyan },

  modsHint: { color: Colors.textMuted, fontSize: 10, marginBottom: 8 },

  bgRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  bgOption: {
    width: '30%', height: 56, borderRadius: 10, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center', gap: 4,
  },
  bgLabel: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 1 },

  colorPickerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    marginBottom: 14,
  },
  colorPickerSwatch: {
    width: 32, height: 32, borderRadius: 16,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10,
  },
  colorPickerLabel: { flex: 1, fontSize: 13, fontWeight: '800', letterSpacing: 1.5 },

  auraOption: {
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: '#333',
    alignItems: 'center', gap: 6, minWidth: 80,
  },
  auraLabel: { color: Colors.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 0.5, textAlign: 'center' },

  saveBtn: {
    backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24,
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 10,
  },
  saveBtnText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
});
