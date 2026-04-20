import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

// ── Screen ────────────────────────────────────────────────────────────────────

export default function RevZone() {
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.iconWrap}>
        <Ionicons name="speedometer-outline" size={54} color={Colors.accent} />
      </View>

      <Text style={s.comingSoon}>COMING SOON...</Text>

      <Text style={s.title}>REV-ZONE</Text>

      <Text style={s.body}>
        This is where SKRR comes alive.{'\n\n'}
        The REV-ZONE is a dedicated space for raw, unfiltered car content. Built for people who actually live the scene. No random filler. No off-topic noise. Just cars.{'\n\n'}
        Scroll through real builds, late-night pulls, meet highlights, exhaust clips, POV drives, and everything in between. Whether it's clean, loud, rare, or just different...if it's part of the culture, it belongs here.{'\n\n'}
        Discover local cars. Get inspired by builds worldwide. Stay tapped into what's happening in the scene...all in one place.{'\n\n'}
        Built for the community. Powered by the culture.
      </Text>

      <View style={s.glowLine} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.background },
  content:    { paddingHorizontal: 28, paddingTop: 48, paddingBottom: 60, alignItems: 'center' },
  iconWrap:   {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.accentDim, borderWidth: 1, borderColor: Colors.accent + '50',
    justifyContent: 'center', alignItems: 'center', marginBottom: 28,
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 24,
  },
  comingSoon: {
    color: Colors.accent, fontSize: 22, fontWeight: '900', letterSpacing: 4,
    textShadowColor: Colors.accent, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4,
    marginBottom: 10, textAlign: 'center',
  },
  title:      {
    color: Colors.text, fontSize: 28, fontWeight: '900', letterSpacing: 6,
    textShadowColor: Colors.accent, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4,
    marginBottom: 32, textAlign: 'center',
  },
  body:       { color: Colors.textSecondary, fontSize: 15, lineHeight: 26, fontWeight: '400', textAlign: 'center' },
  glowLine:   {
    marginTop: 48, width: '60%', height: 2,
    backgroundColor: Colors.accent,
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 12,
  },
});
