import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';

export default function Settings() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [locationVisible, setLocationVisible] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);

  async function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive',
        onPress: async () => {
          await signOut(auth);
          await AsyncStorage.removeItem('skrr_keep_signed_in');
          router.replace('/welcome');
        },
      },
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Coming soon', 'Account deletion will be available in a future update.') },
      ]
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <Section title="ACCOUNT">
          <Row icon="mail" label="Change Email" onPress={() => Alert.alert('Coming soon')} />
          <Row icon="lock-closed" label="Change Password" onPress={() => Alert.alert('Coming soon')} />
        </Section>

        <Section title="PRIVACY">
          <ToggleRow icon="location" label="Show my location" value={locationVisible} onToggle={setLocationVisible} />
          <ToggleRow icon="person" label="Public profile" value={profileVisible} onToggle={setProfileVisible} />
        </Section>

        <Section title="NOTIFICATIONS">
          <ToggleRow icon="notifications" label="Push notifications" value={notifications} onToggle={setNotifications} />
        </Section>

        <Section title="LEGAL">
          <Row icon="document-text" label="Terms of Service" onPress={() => Alert.alert('Coming soon')} />
          <Row icon="shield-checkmark" label="Privacy Policy" onPress={() => Alert.alert('Coming soon')} />
        </Section>

        <Section title="SUPPORT">
          <Row icon="help-circle" label="Help & FAQ" onPress={() => Alert.alert('Coming soon')} />
          <Row icon="chatbubble-ellipses" label="Contact Us" onPress={() => Alert.alert('Coming soon')} />
        </Section>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={s.logoutText}>LOG OUT</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.deleteBtn} onPress={handleDeleteAccount}>
          <Text style={s.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={s.version}>SKRR v1.0.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.sectionCard}>{children}</View>
    </View>
  );
}

function Row({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress}>
      <Ionicons name={icon} size={18} color={Colors.accent} style={s.rowIcon} />
      <Text style={s.rowLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

function ToggleRow({ icon, label, value, onToggle }: { icon: any; label: string; value: boolean; onToggle: (v: boolean) => void }) {
  return (
    <View style={s.row}>
      <Ionicons name={icon} size={18} color={Colors.accent} style={s.rowIcon} />
      <Text style={[s.rowLabel, { flex: 1 }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.cardBorder, true: Colors.accent + '80' }}
        thumbColor={value ? Colors.accent : Colors.textMuted}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 },

  section: { marginBottom: 24 },
  sectionTitle: { color: Colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 8, paddingLeft: 4 },
  sectionCard: { backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.cardBorder, overflow: 'hidden' },

  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  rowIcon: { marginRight: 12 },
  rowLabel: { color: Colors.text, fontSize: 14, fontWeight: '500' },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FF3B3015', borderWidth: 1, borderColor: '#FF3B3040', borderRadius: 14, paddingVertical: 16, marginBottom: 12 },
  logoutText: { color: '#FF3B30', fontSize: 14, fontWeight: '900', letterSpacing: 2 },

  deleteBtn: { alignItems: 'center', paddingVertical: 12 },
  deleteText: { color: Colors.textMuted, fontSize: 12, fontWeight: '500' },

  version: { color: Colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 24, letterSpacing: 1 },
});
