import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

export default function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.logoSection}>
            <Text style={styles.logo}>SKRR</Text>
            <Text style={styles.tagline}>Join The Scene</Text>
          </View>

          <View style={styles.form}>
            <InputField icon="at" placeholder="Username" value={username} onChangeText={setUsername} />
            <InputField icon="mail" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <InputField icon="lock-closed" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <InputField icon="location" placeholder="City (e.g. Los Angeles, CA)" value={location} onChangeText={setLocation} />

            <Pressable style={styles.createBtn} onPress={() => router.replace('/(tabs)')}>
              <Text style={styles.createBtnText}>CREATE ACCOUNT</Text>
            </Pressable>

            <Pressable style={styles.link} onPress={() => router.back()}>
              <Text style={styles.linkText}>Already have an account? <Text style={styles.linkAccent}>Log In</Text></Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InputField({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType }: any) {
  return (
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={16} color={Colors.accent} />
      <TextInput style={styles.input} placeholder={placeholder} placeholderTextColor={Colors.textMuted} value={value} onChangeText={onChangeText} secureTextEntry={secureTextEntry} keyboardType={keyboardType} autoCapitalize="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { paddingHorizontal: 28, paddingVertical: 40 },
  logoSection: { alignItems: 'center', marginBottom: 44 },
  logo: { color: Colors.accent, fontSize: 56, fontWeight: '900', letterSpacing: 10, textShadowColor: Colors.accent, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4 },
  tagline: { color: Colors.textMuted, fontSize: 12, letterSpacing: 3, fontWeight: '600', marginTop: 6 },
  form: { gap: 14 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 },
  input: { flex: 1, color: Colors.text, fontSize: 15, fontWeight: '500' },
  createBtn: { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 18, elevation: 10 },
  createBtnText: { color: '#000', fontSize: 15, fontWeight: '900', letterSpacing: 3 },
  link: { alignItems: 'center', paddingVertical: 4 },
  linkText: { color: Colors.textMuted, fontSize: 13 },
  linkAccent: { color: Colors.accent, fontWeight: '700' },
});
