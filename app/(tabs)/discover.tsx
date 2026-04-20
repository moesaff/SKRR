import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { mockUsers } from '../../constants/mockData';

export default function Discover() {
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={mockUsers}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.sectionTitle}>SKRR NETWORK</Text>
            <Pressable
              style={styles.addBtn}
              onPress={() => Alert.alert('Add Friends', 'Coming soon — search by username to connect.')}
            >
              <Ionicons name="person-add" size={18} color={Colors.accentCyan} />
            </Pressable>
          </View>
        }
        renderItem={({ item }) => <UserCard user={item} />}
        ListFooterComponent={<View style={{ height: 20 }} />}
      />
    </SafeAreaView>
  );
}

function UserCard({ user }: { user: (typeof mockUsers)[0] }) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.avatarCircle}>
        <Ionicons name="person" size={26} color={Colors.textMuted} />
      </View>
      <Text style={styles.username} numberOfLines={1}>{user.username}</Text>
      <View style={styles.locationRow}>
        <Ionicons name="location" size={10} color={Colors.accent} />
        <Text style={styles.location} numberOfLines={1}>{user.location}</Text>
      </View>
      <Text style={styles.car} numberOfLines={1}>
        {user.car.year} {user.car.make} {user.car.model}
      </Text>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{user.rank.toUpperCase()}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { paddingHorizontal: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingVertical: 16 },
  sectionTitle: { color: Colors.text, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.cyanDim, borderWidth: 1, borderColor: Colors.accentCyan + '60',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.accentCyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  card: { width: '48%', backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.cardBorder, padding: 14, alignItems: 'center' },
  cardPressed: { borderColor: Colors.accent + '80', backgroundColor: '#151515' },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.inputBg,
    borderWidth: 2,
    borderColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  username: { color: Colors.text, fontSize: 13, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 5 },
  location: { color: Colors.textSecondary, fontSize: 10, fontWeight: '500' },
  car: { color: Colors.textMuted, fontSize: 10, fontWeight: '600', textAlign: 'center', marginBottom: 10 },
  rankBadge: { backgroundColor: Colors.accentDim, borderWidth: 1, borderColor: Colors.accent + '50', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  rankText: { color: Colors.accent, fontSize: 8, fontWeight: '800', letterSpacing: 1.5 },
});
