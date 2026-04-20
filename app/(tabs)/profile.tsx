import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import FlipCard from '../../components/FlipCard';
import { useUser } from '../../context/UserContext';

export default function Profile() {
  const { user } = useUser();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hintRow}>
          <Ionicons name="swap-horizontal" size={13} color={Colors.textMuted} />
          <Text style={styles.hintText}>Tap VEHICLE STATS to flip your card</Text>
        </View>

        <View style={styles.cardWrapper}>
          <FlipCard data={user} />
        </View>

        <Pressable style={styles.editBtn} onPress={() => router.push('/edit-card')}>
          <Ionicons name="pencil" size={14} color={Colors.accent} />
          <Text style={styles.editBtnText}>EDIT CARD</Text>
        </Pressable>

        <Pressable style={styles.shareBtn}>
          <Ionicons name="share-social-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.shareBtnText}>SHARE CARD</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 40 },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  hintText: { color: Colors.textMuted, fontSize: 11, fontWeight: '500' },
  cardWrapper: { marginBottom: 28 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 10,
    paddingHorizontal: 32,
    paddingVertical: 13,
    backgroundColor: Colors.accentDim,
    marginBottom: 12,
    width: '100%',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  editBtnText: { color: Colors.accent, fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 32,
    paddingVertical: 13,
    backgroundColor: Colors.card,
    width: '100%',
    justifyContent: 'center',
  },
  shareBtnText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700', letterSpacing: 2 },
});
