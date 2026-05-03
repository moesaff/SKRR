import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Alert, Linking, Modal, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  signOut, sendPasswordResetEmail, deleteUser,
  reauthenticateWithCredential, EmailAuthProvider,
  verifyBeforeUpdateEmail,
} from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../lib/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';

const URLS = {
  tos:     'https://moesaff.github.io/OOF/tos.html',
  privacy: 'https://moesaff.github.io/OOF/privacy.html',
  faq:     'https://moesaff.github.io/OOF/faq.html',
};

function openURL(url: string) {
  Linking.openURL(url);
}

export default function Settings() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);

  // Change Email modal
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Delete Account modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  async function handleChangePassword() {
    const user = auth.currentUser;
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert('Email Sent', `A password reset link has been sent to ${user.email}`);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  }

  async function handleChangeEmail() {
    const user = auth.currentUser;
    if (!user?.email) return;
    if (!newEmail.trim() || !emailPassword) {
      Alert.alert('Missing info', 'Enter your new email and current password.');
      return;
    }
    setEmailLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, emailPassword);
      await reauthenticateWithCredential(user, credential);
      await verifyBeforeUpdateEmail(user, newEmail.trim());
      setEmailModalVisible(false);
      setNewEmail('');
      setEmailPassword('');
      Alert.alert('Verify your new email', `A verification link was sent to ${newEmail.trim()}. Click it to confirm the change.`);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleDeleteAccount() {
    const user = auth.currentUser;
    if (!user?.email) return;
    if (!deletePassword) {
      Alert.alert('Enter your password to confirm.');
      return;
    }
    setDeleteLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, deletePassword);
      await reauthenticateWithCredential(user, credential);

      // Delete Firestore user doc
      await deleteDoc(doc(db, 'users', user.uid));

      // Delete Storage photos (ignore errors if files don't exist)
      try { await deleteObject(ref(storage, `users/${user.uid}/profile.jpg`)); } catch {}
      try { await deleteObject(ref(storage, `users/${user.uid}/car.jpg`)); } catch {}

      // Delete Firebase Auth account
      await deleteUser(user);

      await AsyncStorage.removeItem('skrr_keep_signed_in');
      setDeleteModalVisible(false);
      router.replace('/welcome');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <Section title="ACCOUNT">
          <Row icon="mail" label="Change Email" onPress={() => setEmailModalVisible(true)} />
          <Row icon="lock-closed" label="Change Password" onPress={handleChangePassword} />
        </Section>

        <Section title="NOTIFICATIONS">
          <ToggleRow icon="notifications" label="Push notifications" value={notifications} onToggle={setNotifications} />
        </Section>

        <Section title="LEGAL">
          <Row icon="document-text" label="Terms of Service" onPress={() => openURL(URLS.tos)} />
          <Row icon="shield-checkmark" label="Privacy Policy" onPress={() => openURL(URLS.privacy)} />
        </Section>

        <Section title="SUPPORT">
          <Row icon="help-circle" label="Help & FAQ" onPress={() => openURL(URLS.faq)} />
          <Row icon="chatbubble-ellipses" label="Contact Us" onPress={() => Linking.openURL('mailto:oof.support@gmail.com')} />
        </Section>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={s.logoutText}>LOG OUT</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.deleteBtn} onPress={() => setDeleteModalVisible(true)}>
          <Text style={s.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={s.version}>OOF v1.0.0</Text>

      </ScrollView>

      {/* Change Email Modal */}
      <Modal visible={emailModalVisible} transparent animationType="slide" onRequestClose={() => setEmailModalVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <Text style={s.modalTitle}>CHANGE EMAIL</Text>
            <Text style={s.modalSub}>Enter your new email and current password to confirm.</Text>
            <TextInput
              style={s.modalInput}
              placeholder="New email address"
              placeholderTextColor={Colors.textMuted}
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={s.modalInput}
              placeholder="Current password"
              placeholderTextColor={Colors.textMuted}
              value={emailPassword}
              onChangeText={setEmailPassword}
              secureTextEntry
            />
            <TouchableOpacity style={[s.modalBtn, emailLoading && { opacity: 0.6 }]} onPress={handleChangeEmail} disabled={emailLoading}>
              {emailLoading ? <ActivityIndicator color="#000" /> : <Text style={s.modalBtnText}>SEND VERIFICATION</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={s.modalCancel} onPress={() => { setEmailModalVisible(false); setNewEmail(''); setEmailPassword(''); }}>
              <Text style={s.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="slide" onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <Text style={[s.modalTitle, { color: '#FF3B30' }]}>DELETE ACCOUNT</Text>
            <Text style={s.modalSub}>This permanently deletes your account and all your data. This cannot be undone.</Text>
            <TextInput
              style={s.modalInput}
              placeholder="Enter your password to confirm"
              placeholderTextColor={Colors.textMuted}
              value={deletePassword}
              onChangeText={setDeletePassword}
              secureTextEntry
            />
            <TouchableOpacity style={[s.modalBtn, { backgroundColor: '#FF3B30' }, deleteLoading && { opacity: 0.6 }]} onPress={handleDeleteAccount} disabled={deleteLoading}>
              {deleteLoading ? <ActivityIndicator color="#fff" /> : <Text style={[s.modalBtnText, { color: '#fff' }]}>DELETE MY ACCOUNT</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={s.modalCancel} onPress={() => { setDeleteModalVisible(false); setDeletePassword(''); }}>
              <Text style={s.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  rowLabel: { color: Colors.text, fontSize: 14, fontWeight: '500', flex: 1 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FF3B3015', borderWidth: 1, borderColor: '#FF3B3040', borderRadius: 14, paddingVertical: 16, marginBottom: 12 },
  logoutText: { color: '#FF3B30', fontSize: 14, fontWeight: '900', letterSpacing: 2 },

  deleteBtn: { alignItems: 'center', paddingVertical: 12 },
  deleteText: { color: Colors.textMuted, fontSize: 12, fontWeight: '500' },

  version: { color: Colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 24, letterSpacing: 1 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#0D0D1F', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: Colors.cardBorder, padding: 24, paddingBottom: 44 },
  modalTitle: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 3, textAlign: 'center', marginBottom: 8 },
  modalSub: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  modalInput: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, color: Colors.text, fontSize: 14, marginBottom: 12 },
  modalBtn: { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginBottom: 12 },
  modalBtnText: { color: '#000', fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  modalCancel: { alignItems: 'center', paddingVertical: 10 },
  modalCancelText: { color: Colors.textMuted, fontSize: 14 },
});
