import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  Pressable, KeyboardAvoidingView, Platform, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import * as Location from 'expo-location';

const GOOGLE_KEY = 'AIzaSyBN2H0Lh-y9vuNXQ4t4QFOnhMSAnLDznXY';
const TOTAL_STEPS = 3;

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Step 2
  const [username, setUsername] = useState('');
  const [city, setCity] = useState('');
  const [cityCoords, setCityCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [cityQuery, setCityQuery] = useState('');

  // Step 3
  const [carYear, setCarYear] = useState('');
  const [carMake, setCarMake] = useState('');
  const [carModel, setCarModel] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleGPS() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission denied', 'Enable location access to use GPS.'); return; }
    const loc = await Location.getCurrentPositionAsync({});
    const [place] = await Location.reverseGeocodeAsync(loc.coords);
    const label = [place.city, place.region].filter(Boolean).join(', ');
    setCity(label);
    setCityQuery(label);
    setCityCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
  }

  async function next() {
    if (step < TOTAL_STEPS) { setStep(s => s + 1); return; }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const skrrId = Math.random().toString(36).substr(2, 6).toUpperCase();
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        skrrId,
        username,
        email: email.trim(),
        city,
        location: cityCoords ?? null,
        car: { year: carYear, make: carMake, model: carModel },
        createdAt: serverTimestamp(),
        meetsAttended: 0,
        following: [],
      });
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Sign up failed', e.message);
    } finally {
      setLoading(false);
    }
  }

  function back() {
    if (step > 1) setStep(s => s - 1);
    else router.back();
  }

  const canContinue = step === 1
    ? email.trim().length > 0 && password.length >= 6
    : step === 2
    ? username.trim().length > 0 && city.trim().length > 0
    : carYear.trim().length > 0 && carMake.trim().length > 0 && carModel.trim().length > 0;

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, overflow: 'visible' }}>
        <View style={[s.inner, { overflow: 'visible', zIndex: 1 }]}>

          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={back} style={s.backBtn}>
              <Ionicons name="chevron-back" size={22} color={Colors.text} />
            </TouchableOpacity>
            <Text style={s.logo}>SKRR</Text>
            <View style={{ width: 38 }} />
          </View>

          {/* Step indicator */}
          <View style={s.stepRow}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View key={i} style={[s.stepDot, i + 1 <= step && s.stepDotActive]} />
            ))}
          </View>

          {/* Step title */}
          <Text style={s.stepTitle}>
            {step === 1 ? 'Create your account' : step === 2 ? 'Set up your profile' : 'Add your ride'}
          </Text>
          <Text style={s.stepSub}>
            {step === 1 ? 'Step 1 of 3 — Enter your credentials' : step === 2 ? 'Step 2 of 3 — Tell us about yourself' : 'Step 3 of 3 — What are you driving?'}
          </Text>

          {/* Fields */}
          <View style={[s.form, step === 2 && { overflow: 'visible', zIndex: 10 }]}>
            {step === 1 && (
              <>
                <InputField icon="mail" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
                <View style={s.inputWrapper}>
                  <Ionicons name="lock-closed" size={16} color={Colors.accent} />
                  <TextInput
                    style={s.input}
                    placeholder="Password (min. 6 characters)"
                    placeholderTextColor={Colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPass(v => !v)}>
                    <Ionicons name={showPass ? 'eye-off' : 'eye'} size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </>
            )}

            {step === 2 && (
              <>
                <InputField icon="at" placeholder="Username" value={username} onChangeText={setUsername} />

                <View style={s.cityRow}>
                  <View style={[s.placesWrapper, { flex: 1 }]}>
                    <Ionicons name="location" size={16} color={Colors.accent} />
                    <TextInput
                      style={s.input}
                      placeholder="City (e.g. Niagara Falls, NY)"
                      placeholderTextColor={Colors.textMuted}
                      value={cityQuery}
                      onChangeText={async (text) => {
                        setCityQuery(text);
                        setCity('');
                        if (text.length < 2) { setCitySuggestions([]); return; }
                        try {
                          const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&types=(cities)&key=${GOOGLE_KEY}`;
                          const res = await fetch(url);
                          const json = await res.json();
setCitySuggestions(json.predictions ?? []);
                        } catch (e) { console.log('Places fetch error:', e); setCitySuggestions([]); }
                      }}
                      autoCapitalize="words"
                    />
                  </View>
                  <TouchableOpacity style={s.gpsBtn} onPress={handleGPS}>
                    <Ionicons name="navigate" size={16} color={Colors.accentCyan} />
                  </TouchableOpacity>
                </View>

                {citySuggestions.length > 0 && (
                  <View style={s.suggestionList}>
                    {citySuggestions.map((item) => (
                      <TouchableOpacity
                        key={item.place_id}
                        style={s.suggestionItem}
                        onPress={() => {
                          setCity(item.description);
                          setCityQuery(item.description);
                          setCitySuggestions([]);
                        }}
                      >
                        <Ionicons name="location-outline" size={13} color={Colors.accent} />
                        <Text style={s.suggestionText}>{item.description}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {city.length > 0 && citySuggestions.length === 0 && (
                  <Text style={s.cityConfirm}>✓ {city}</Text>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <InputField icon="calendar" placeholder="Year (e.g. 2021)" value={carYear} onChangeText={setCarYear} keyboardType="number-pad" />
                <InputField icon="car" placeholder="Make (e.g. Toyota)" value={carMake} onChangeText={setCarMake} />
                <InputField icon="speedometer" placeholder="Model (e.g. Supra)" value={carModel} onChangeText={setCarModel} />
              </>
            )}
          </View>

          {/* CTA */}
          <Pressable
            style={[s.continueBtn, !canContinue && s.continueBtnDisabled]}
            onPress={canContinue ? next : undefined}
          >
            <Text style={s.continueBtnText}>
              {loading ? 'CREATING...' : step === TOTAL_STEPS ? 'CREATE ACCOUNT' : 'CONTINUE'}
            </Text>
            {step < TOTAL_STEPS && <Ionicons name="arrow-forward" size={16} color="#000" style={{ marginLeft: 8 }} />}
          </Pressable>

          {step === 1 && (
            <Pressable style={s.link} onPress={() => router.back()}>
              <Text style={s.linkText}>Already have an account? <Text style={s.linkAccent}>Log In</Text></Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InputField({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType }: any) {
  return (
    <View style={s.inputWrapper}>
      <Ionicons name={icon} size={16} color={Colors.accent} />
      <TextInput
        style={s.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, paddingHorizontal: 28, paddingTop: 16, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  backBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, alignItems: 'center', justifyContent: 'center' },
  logo: { color: Colors.accent, fontSize: 24, fontWeight: '900', letterSpacing: 6, textShadowColor: Colors.accent, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4 },

  stepRow: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  stepDot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: Colors.cardBorder },
  stepDotActive: { backgroundColor: Colors.accent },

  stepTitle: { color: Colors.text, fontSize: 22, fontWeight: '800', letterSpacing: 0.3, marginBottom: 6 },
  stepSub: { color: Colors.textMuted, fontSize: 13, marginBottom: 28 },

  form: { gap: 14, flex: 1 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 },
  input: { flex: 1, color: Colors.text, fontSize: 15, fontWeight: '500' },

  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  placesWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, flex: 1 },
  gpsBtn: { width: 52, height: 52, borderRadius: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, alignItems: 'center', justifyContent: 'center' },

  suggestionList: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: 10, overflow: 'hidden' },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  suggestionText: { color: Colors.text, fontSize: 13, flex: 1 },

  cityConfirm: { color: Colors.accentCyan, fontSize: 12, fontWeight: '500' },

  continueBtn: { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 10 },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: { color: '#000', fontSize: 15, fontWeight: '900', letterSpacing: 3 },

  link: { alignItems: 'center', paddingTop: 20 },
  linkText: { color: Colors.textMuted, fontSize: 13 },
  linkAccent: { color: Colors.accent, fontWeight: '700' },
});
