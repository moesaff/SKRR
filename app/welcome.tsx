import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Easing, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

export default function Welcome() {
  const router = useRouter();

  // Animations
  const logoScale   = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOp   = useRef(new Animated.Value(0)).current;
  const btnsOp      = useRef(new Animated.Value(0)).current;
  const btnsY       = useRef(new Animated.Value(30)).current;
  const glowPulse   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale,   { toValue: 1,    duration: 800, easing: Easing.out(Easing.exp),  useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1,    duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
      // Tagline fades in
      Animated.timing(taglineOp, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      // Buttons slide up
      Animated.parallel([
        Animated.timing(btnsOp, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(btnsY,  { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    ]).start();

    // Continuous glow pulse on logo
    Animated.loop(Animated.sequence([
      Animated.timing(glowPulse, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(glowPulse, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <View style={s.container}>
      {/* Background glow orbs */}
      <View style={[s.orb, s.orb1]} />
      <View style={[s.orb, s.orb2]} />

      {/* Logo */}
      <Animated.View style={[s.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Animated.Text style={[s.logo, {
          opacity: glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }),
        }]}>
          SKRR
        </Animated.Text>
        <Animated.Text style={[s.subtitle, { opacity: taglineOp }]}>
          Built for the community, powered by culture.
        </Animated.Text>
      </Animated.View>

      {/* Buttons */}
      <Animated.View style={[s.btns, { opacity: btnsOp, transform: [{ translateY: btnsY }] }]}>
        <TouchableOpacity
          style={s.primaryBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/auth/signup')}
        >
          <Text style={s.primaryBtnText}>GET STARTED</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.secondaryBtn}
          activeOpacity={0.7}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={s.secondaryBtnText}>LOG IN</Text>
        </TouchableOpacity>

        <Text style={s.legalText}>
          By continuing you agree to our{' '}
          <Text style={s.legalLink}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={s.legalLink}>Privacy Policy</Text>
        </Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 56,
    paddingTop: height * 0.18,
  },

  // Background glow orbs
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: Colors.accent + '12',
    top: -width * 0.2,
    left: -width * 0.1,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 80,
  },
  orb2: {
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: Colors.accentCyan + '08',
    bottom: height * 0.15,
    right: -width * 0.2,
    shadowColor: Colors.accentCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 60,
  },

  // Logo
  logoWrap: { alignItems: 'center' },
  logo: {
    color: Colors.accent,
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: 16,
    textShadowColor: Colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  tagline: {
    color: Colors.textMuted,
    fontSize: 11,
    letterSpacing: 4,
    fontWeight: '600',
    marginTop: 12,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '400',
    marginTop: 16,
    letterSpacing: 0.3,
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  // Buttons
  btns: { width: '100%', paddingHorizontal: 28, gap: 14 },
  primaryBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  primaryBtnText: { color: '#000', fontSize: 15, fontWeight: '900', letterSpacing: 3 },
  secondaryBtn: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent + '60',
    backgroundColor: Colors.accent + '10',
  },
  secondaryBtnText: { color: Colors.accent, fontSize: 15, fontWeight: '800', letterSpacing: 3 },
  legalText: {
    color: Colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  legalLink: { color: Colors.accent + 'CC', fontWeight: '600' },
});
