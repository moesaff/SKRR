import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <View style={styles.logoSection}>
          <Text style={styles.logo}>SKRR</Text>
          <Text style={styles.tagline}>The Car Meet Community</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail" size={16} color={Colors.accent} />
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor={Colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed" size={16} color={Colors.accent} />
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor={Colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={16} color={Colors.textMuted} />
            </Pressable>
          </View>

          <Pressable style={styles.loginBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.loginBtnText}>LOG IN</Text>
          </Pressable>

          <Pressable style={styles.link} onPress={() => router.push('/auth/signup')}>
            <Text style={styles.linkText}>New to SKRR? <Text style={styles.linkAccent}>Create Account</Text></Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, paddingHorizontal: 28, justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 52 },
  logo: { color: Colors.accent, fontSize: 56, fontWeight: '900', letterSpacing: 10, textShadowColor: Colors.accent, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4 },
  tagline: { color: Colors.textMuted, fontSize: 12, letterSpacing: 3, fontWeight: '600', marginTop: 6 },
  form: { gap: 14 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 },
  input: { flex: 1, color: Colors.text, fontSize: 15, fontWeight: '500' },
  loginBtn: { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 18, elevation: 10 },
  loginBtnText: { color: '#000', fontSize: 15, fontWeight: '900', letterSpacing: 3 },
  link: { alignItems: 'center', paddingVertical: 4 },
  linkText: { color: Colors.textMuted, fontSize: 13 },
  linkAccent: { color: Colors.accent, fontWeight: '700' },
});
