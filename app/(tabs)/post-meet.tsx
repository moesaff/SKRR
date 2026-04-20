import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Meet {
  id: string;
  title: string;
  location: string;
  time: string;
  carTypes: string[];
  attendees: number;
  hostedBy: string;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const TODAY_MEETS: Meet[] = [
  {
    id: 't1',
    title: 'SoCal JDM Night',
    location: 'Santa Monica Pier, CA',
    time: 'Tonight · 8:00 PM',
    carTypes: ['JDM', 'Stance'],
    attendees: 47,
    hostedBy: 'DRIFTKNG_',
  },
  {
    id: 't2',
    title: 'Street Kings Sunday',
    location: 'Pomona Fairplex, CA',
    time: 'Tonight · 7:30 PM',
    carTypes: ['Domestic', 'Muscle'],
    attendees: 31,
    hostedBy: 'LAMBO_AMIR',
  },
];

const WEEK_MEETS: Meet[] = [
  {
    id: 'w1',
    title: 'Euro Night Vol. 4',
    location: 'Beverly Hills, CA',
    time: 'Wednesday · 9:00 PM',
    carTypes: ['Euro'],
    attendees: 62,
    hostedBy: 'CARSXLIFE',
  },
  {
    id: 'w2',
    title: 'Lowrider Sunday Cruise',
    location: 'East LA · Whittier Blvd',
    time: 'Thursday · 6:00 PM',
    carTypes: ['Lowrider'],
    attendees: 28,
    hostedBy: 'LOWRDR_SZN',
  },
  {
    id: 'w3',
    title: 'Track Day Open Laps',
    location: 'Willow Springs Raceway',
    time: 'Saturday · 7:00 AM',
    carTypes: ['Track', 'All Makes'],
    attendees: 19,
    hostedBy: 'TURBO_MIKEY',
  },
  {
    id: 'w4',
    title: 'Drift Practice Session',
    location: 'Irwindale Speedway, CA',
    time: 'Sunday · 3:00 PM',
    carTypes: ['Drift', 'JDM'],
    attendees: 34,
    hostedBy: 'DRIFTKNG_',
  },
];

const CAR_TYPES = ['JDM', 'Domestic', 'Euro', 'Stance', 'Drift', 'Track', 'Lowrider', 'Muscle', 'Electric', 'All Makes'];

// ── Meet card ─────────────────────────────────────────────────────────────────

function MeetCard({ meet }: { meet: Meet }) {
  return (
    <TouchableOpacity activeOpacity={0.75} style={s.meetCard}>
      <View style={s.meetCardTop}>
        <Text style={s.meetTitle} numberOfLines={1}>{meet.title}</Text>
        <View style={s.attendeesBadge}>
          <Ionicons name="people" size={11} color={Colors.accent} />
          <Text style={s.attendeesText}>{meet.attendees}</Text>
        </View>
      </View>

      <View style={s.meetRow}>
        <Ionicons name="location" size={12} color={Colors.accent} />
        <Text style={s.meetMeta} numberOfLines={1}>{meet.location}</Text>
      </View>
      <View style={s.meetRow}>
        <Ionicons name="time" size={12} color={Colors.textMuted} />
        <Text style={[s.meetMeta, { color: Colors.textMuted }]}>{meet.time}</Text>
      </View>

      <View style={s.meetFooter}>
        <View style={s.carTypesRow}>
          {meet.carTypes.map(t => (
            <View key={t} style={s.typePill}>
              <Text style={s.typePillText}>{t}</Text>
            </View>
          ))}
        </View>
        <Text style={s.hostedBy}>by {meet.hostedBy}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Post meet modal ───────────────────────────────────────────────────────────

function PostMeetModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handlePost = () => {
    if (!title.trim() || !location.trim() || !date.trim()) {
      Alert.alert('Missing Info', 'Title, location, and date are required.');
      return;
    }
    Alert.alert('Meet Posted!', 'Firebase connection coming next!');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={s.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={s.modalSheet}
        >
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>POST A MEET</Text>
            <TouchableOpacity onPress={onClose} style={s.modalClose}>
              <Text style={s.modalCloseTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={s.modalScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Field label="MEET TITLE" value={title} onChangeText={setTitle} placeholder="e.g. SoCal JDM Night" />
            <Field label="LOCATION" value={location} onChangeText={setLocation} placeholder="e.g. Santa Monica Pier" icon="location" />
            <Field label="DATE & TIME" value={date} onChangeText={setDate} placeholder="e.g. Friday, Apr 25 · 8:00 PM" icon="calendar" />
            <Field label="DESCRIPTION" value={description} onChangeText={setDescription} placeholder="Tell people what to expect..." multiline />

            <Text style={s.fieldLabel}>CAR TYPES WELCOME</Text>
            <View style={s.tagsGrid}>
              {CAR_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  activeOpacity={0.7}
                  style={[s.tag, selectedTypes.includes(type) && s.tagActive]}
                  onPress={() => toggleType(type)}
                >
                  <Text style={[s.tagText, selectedTypes.includes(type) && s.tagTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={s.postBtn} activeOpacity={0.8} onPress={handlePost}>
              <Ionicons name="add-circle" size={18} color="#000" />
              <Text style={s.postBtnText}>POST MEET</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function Field({ label, value, onChangeText, placeholder, multiline, icon }: any) {
  return (
    <View style={s.fieldWrapper}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={[s.inputWrapper, multiline && s.inputWrapperMultiline]}>
        {icon && <Ionicons name={icon} size={14} color={Colors.accent} style={{ marginRight: 8 }} />}
        <TextInput
          style={[s.input, multiline && s.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
        />
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function Meets() {
  const [showPostModal, setShowPostModal] = useState(false);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* post a meet CTA */}
        <TouchableOpacity style={s.postCta} activeOpacity={0.8} onPress={() => setShowPostModal(true)}>
          <View style={s.postCtaLeft}>
            <Ionicons name="add-circle" size={22} color="#000" />
            <Text style={s.postCtaText}>POST A MEET</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#000" />
        </TouchableOpacity>

        {/* today */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionDot} />
            <Text style={s.sectionTitle}>MEETS HAPPENING TODAY</Text>
          </View>
          {TODAY_MEETS.map(m => <MeetCard key={m.id} meet={m} />)}
        </View>

        {/* this week */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionDot, { backgroundColor: Colors.accentCyan }]} />
            <Text style={s.sectionTitle}>MEETS HAPPENING THIS WEEK</Text>
          </View>
          {WEEK_MEETS.map(m => <MeetCard key={m.id} meet={m} />)}
        </View>

      </ScrollView>

      <PostMeetModal visible={showPostModal} onClose={() => setShowPostModal(false)} />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:            { flex: 1, backgroundColor: Colors.background },
  scroll:               { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },

  // post CTA
  postCta:              { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.accent, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 16, marginBottom: 28, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 16 },
  postCtaLeft:          { flexDirection: 'row', alignItems: 'center', gap: 10 },
  postCtaText:          { color: '#000', fontSize: 15, fontWeight: '900', letterSpacing: 2 },

  // sections
  section:              { marginBottom: 28 },
  sectionHeader:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionDot:           { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.accent },
  sectionTitle:         { color: Colors.text, fontSize: 10, fontWeight: '900', letterSpacing: 2.5 },

  // meet card
  meetCard:             { backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.cardBorder, padding: 16, marginBottom: 10 },
  meetCardTop:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  meetTitle:            { color: Colors.text, fontSize: 16, fontWeight: '900', flex: 1, marginRight: 10 },
  attendeesBadge:       { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.accentDim, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: Colors.accent + '40' },
  attendeesText:        { color: Colors.accent, fontSize: 11, fontWeight: '800' },
  meetRow:              { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  meetMeta:             { color: Colors.textSecondary, fontSize: 12, fontWeight: '500', flex: 1 },
  meetFooter:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  carTypesRow:          { flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 },
  typePill:             { backgroundColor: Colors.inputBg, borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: Colors.cardBorder },
  typePillText:         { color: Colors.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  hostedBy:             { color: Colors.textMuted, fontSize: 10, fontWeight: '600', marginLeft: 8 },

  // modal
  modalOverlay:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  modalSheet:           { backgroundColor: '#080810', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: '#1A1A2E', maxHeight: '92%' },
  modalHeader:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#111122' },
  modalTitle:           { color: Colors.accent, fontSize: 14, fontWeight: '900', letterSpacing: 3, textShadowColor: Colors.accent, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4 },
  modalClose:           { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1A1A2E', justifyContent: 'center', alignItems: 'center' },
  modalCloseTxt:        { color: '#888', fontSize: 14, fontWeight: '700' },
  modalScroll:          { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  // form
  fieldWrapper:         { marginBottom: 16 },
  fieldLabel:           { color: Colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  inputWrapper:         { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13 },
  inputWrapperMultiline:{ alignItems: 'flex-start', paddingTop: 12 },
  input:                { flex: 1, color: Colors.text, fontSize: 14, fontWeight: '500' },
  inputMultiline:       { height: 90, textAlignVertical: 'top' },
  tagsGrid:             { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 },
  tag:                  { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 8 },
  tagActive:            { backgroundColor: Colors.accentDim, borderColor: Colors.accent },
  tagText:              { color: Colors.textMuted, fontSize: 12, fontWeight: '700' },
  tagTextActive:        { color: Colors.accent },
  postBtn:              { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 16 },
  postBtnText:          { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
});
