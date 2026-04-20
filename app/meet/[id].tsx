import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { mockMeets } from '../../constants/mockData';

export default function MeetDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const meet = mockMeets.find((m) => m.id === id) ?? mockMeets[0];
  const [rsvped, setRsvped] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{meet.title}</Text>
        <View style={styles.hostedByRow}>
          <Text style={styles.hostedByLabel}>Hosted by </Text>
          <Text style={styles.hostedByName}>{meet.hostedBy}</Text>
        </View>

        <InfoBox icon="location" label="LOCATION" value={meet.location} />
        <InfoBox icon="calendar" label="DATE & TIME" value={meet.date} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ABOUT THIS MEET</Text>
          <Text style={styles.description}>{meet.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CAR TYPES WELCOME</Text>
          <View style={styles.tagsRow}>
            {meet.carTypes.map((type) => (
              <View key={type} style={styles.tag}>
                <Text style={styles.tagText}>{type}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.rsvpBar}>
          <View style={styles.rsvpCountRow}>
            <Ionicons name="people" size={20} color={Colors.accent} />
            <Text style={styles.rsvpNumber}>{rsvped ? meet.rsvps + 1 : meet.rsvps}</Text>
            <Text style={styles.rsvpLabel}>going</Text>
          </View>
          <Pressable style={[styles.rsvpBtn, rsvped && styles.rsvpBtnActive]} onPress={() => setRsvped(!rsvped)}>
            <Ionicons name={rsvped ? 'checkmark-circle' : 'add-circle-outline'} size={17} color={rsvped ? '#000' : Colors.accent} />
            <Text style={[styles.rsvpBtnText, rsvped && styles.rsvpBtnTextActive]}>{rsvped ? "YOU'RE IN" : 'RSVP'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoBox({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoBox}>
      <Ionicons name={icon as any} size={15} color={Colors.accent} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoBoxLabel}>{label}</Text>
        <Text style={styles.infoBoxValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  title: { color: Colors.text, fontSize: 26, fontWeight: '900', letterSpacing: 0.3, marginBottom: 8 },
  hostedByRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  hostedByLabel: { color: Colors.textMuted, fontSize: 13 },
  hostedByName: { color: Colors.accent, fontSize: 13, fontWeight: '700' },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: 12, padding: 14, marginBottom: 10 },
  infoBoxLabel: { color: Colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 2, marginBottom: 3 },
  infoBoxValue: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  section: { marginTop: 14, marginBottom: 8 },
  sectionLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 10 },
  description: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: Colors.accentDim, borderWidth: 1, borderColor: Colors.accent + '40', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { color: Colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  rsvpBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: 14, padding: 16, marginTop: 20 },
  rsvpCountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rsvpNumber: { color: Colors.text, fontSize: 24, fontWeight: '900' },
  rsvpLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  rsvpBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: Colors.accent, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.accentDim },
  rsvpBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  rsvpBtnText: { color: Colors.accent, fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  rsvpBtnTextActive: { color: '#000' },
});
