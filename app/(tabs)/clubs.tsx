import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

export default function Clubs() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.iconWrap}>
        <Ionicons name="shield" size={54} color={Colors.accent} style={styles.icon} />
      </View>

      <Text style={styles.comingSoon}>COMING SOON...</Text>

      <Text style={styles.body}>
        Clubs take the Skrr experience to the next level.{'\n\n'}
        With Clubs, you won't just attend meets...you'll belong to something. Create your own club or join one that matches your style, your car, or your circle. Whether it's a tight group of Lambo owners or a broader crew that runs your city, Clubs give you a place to stay connected beyond a single meet.{'\n\n'}
        Build your network, organize exclusive meets, and grow your presence in the scene. The more active your club is, the stronger your reputation becomes, both individually and as a group.{'\n\n'}
        And it goes beyond cars. Clubs are a powerful way to stay connected in real life...opening doors to business opportunities, partnerships, and lifelong relationships.{'\n\n'}
        This is how you go from showing up… to being known.
      </Text>

      <View style={styles.glowLine} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 28, paddingTop: 48, paddingBottom: 60, alignItems: 'center' },
  iconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.accentDim, borderWidth: 1, borderColor: Colors.accent + '50',
    justifyContent: 'center', alignItems: 'center', marginBottom: 28,
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.18, shadowRadius: 10,
  },
  icon: {
    textShadowColor: Colors.accent, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4,
  },
  comingSoon: {
    color: Colors.accent, fontSize: 22, fontWeight: '900', letterSpacing: 4,
    textShadowColor: Colors.accent, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4,
    marginBottom: 32, textAlign: 'center',
  },
  body: {
    color: Colors.textSecondary, fontSize: 15, lineHeight: 26, fontWeight: '400',
    textAlign: 'center',
  },
  glowLine: {
    marginTop: 48, width: '60%', height: 2,
    backgroundColor: Colors.accentCyan,
    shadowColor: Colors.accentCyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
});
