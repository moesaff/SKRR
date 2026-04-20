import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';

interface Meet {
  id: string;
  title: string;
  location: string;
  date: string;
  carTypes: string[];
  rsvps: number;
  hostedBy: string;
}

export default function MeetCard({ meet }: { meet: Meet }) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(`/meet/${meet.id}` as any)}
    >
      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={1}>{meet.title}</Text>
        <View style={styles.rsvpBadge}>
          <Ionicons name="people" size={11} color={Colors.accent} />
          <Text style={styles.rsvpText}>{meet.rsvps}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="location" size={12} color={Colors.accent} />
        <Text style={styles.infoText} numberOfLines={1}>{meet.location}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="calendar" size={12} color={Colors.accent} />
        <Text style={styles.infoText}>{meet.date}</Text>
      </View>

      <View style={styles.tagsRow}>
        {meet.carTypes.map((type) => (
          <View key={type} style={styles.tag}>
            <Text style={styles.tagText}>{type}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.hostedBy}>
          Hosted by <Text style={styles.hostedByName}>{meet.hostedBy}</Text>
        </Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    marginBottom: 12,
  },
  cardPressed: { borderColor: Colors.accent + '70', backgroundColor: '#141414' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  title: { color: Colors.text, fontSize: 17, fontWeight: '800', flex: 1, letterSpacing: 0.3 },
  rsvpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accentDim,
    borderWidth: 1,
    borderColor: Colors.accent + '50',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  rsvpText: { color: Colors.accent, fontSize: 12, fontWeight: '800' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  infoText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '500', flex: 1 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10, marginBottom: 12 },
  tag: {
    backgroundColor: Colors.accentDim,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: { color: Colors.accent, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.divider },
  hostedBy: { color: Colors.textMuted, fontSize: 11 },
  hostedByName: { color: Colors.textSecondary, fontWeight: '700' },
});
