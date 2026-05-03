import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Conversation {
  id: string;
  username: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

// ── Mock data (replace with real data when backend is ready) ──────────────────

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: '1', username: 'DRIFTKNG_',   lastMessage: 'You going to the meet Friday?',   time: '2m',  unread: 2, online: true  },
  { id: '2', username: 'CARSXLIFE',   lastMessage: 'Bro that build is 🔥',             time: '14m', unread: 0, online: true  },
  { id: '3', username: 'TURBO_MIKEY', lastMessage: 'What exhaust did you go with?',    time: '1h',  unread: 1, online: false },
  { id: '4', username: 'LOWRDR_SZN',  lastMessage: 'Saw your card, respect the rank',  time: '3h',  unread: 0, online: false },
  { id: '5', username: 'LAMBO_AMIR',  lastMessage: 'Club is live, join up',            time: '1d',  unread: 0, online: false },
];

// ── Conversation list item ────────────────────────────────────────────────────

function ConvoItem({ item, onPress }: { item: Conversation; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={s.convoItem}>
      <View style={s.avatarWrap}>
        <View style={s.avatar}>
          <Ionicons name="person" size={22} color={Colors.textMuted} />
        </View>
        {item.online && <View style={s.onlineDot} />}
      </View>

      <View style={s.convoMeta}>
        <View style={s.convoTopRow}>
          <Text style={s.convoUsername}>{item.username}</Text>
          <Text style={s.convoTime}>{item.time}</Text>
        </View>
        <View style={s.convoBottomRow}>
          <Text style={[s.convoLastMsg, item.unread > 0 && s.convoLastMsgUnread]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={s.unreadBadge}>
              <Text style={s.unreadCount}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Chat view ─────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  text: string;
  mine: boolean;
  time: string;
}

const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  '1': [
    { id: 'a', text: 'Yo sick build man',           mine: false, time: '10:22' },
    { id: 'b', text: 'Thanks bro appreciate it 🤙', mine: true,  time: '10:23' },
    { id: 'c', text: 'You going to the meet Friday?', mine: false, time: '10:25' },
  ],
  '2': [
    { id: 'a', text: 'Check out my new wrap',      mine: false, time: '9:00' },
    { id: 'b', text: 'Bro that build is 🔥',        mine: false, time: '9:01' },
  ],
};

function ChatView({ convo, onBack }: { convo: Conversation; onBack: () => void }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES[convo.id] ?? []);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), text, mine: true, time: 'now' }]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={88}
    >
      {/* header */}
      <View style={s.chatHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={24} color={Colors.accent} />
        </TouchableOpacity>
        <View style={s.chatHeaderCenter}>
          <Text style={s.chatHeaderName}>{convo.username}</Text>
          {convo.online && <Text style={s.chatOnline}>● online</Text>}
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* messages */}
      <FlatList
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={s.msgList}
        renderItem={({ item: m }) => (
          <View style={[s.bubble, m.mine ? s.bubbleMine : s.bubbleTheirs]}>
            <Text style={[s.bubbleText, m.mine ? s.bubbleTextMine : s.bubbleTextTheirs]}>
              {m.text}
            </Text>
            <Text style={s.bubbleTime}>{m.time}</Text>
          </View>
        )}
      />

      {/* input bar */}
      <View style={s.inputBar}>
        <TextInput
          style={s.textInput}
          placeholder="Message..."
          placeholderTextColor={Colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          returnKeyType="send"
          onSubmitEditing={send}
        />
        <TouchableOpacity
          onPress={send}
          activeOpacity={0.7}
          style={[s.sendBtn, { opacity: input.trim() ? 1 : 0.4 }]}
        >
          <Ionicons name="send" size={18} color={Colors.background} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function Messages() {
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [search, setSearch] = useState('');

  if (activeConvo) {
    return (
      <View style={s.container}>
        <ChatView convo={activeConvo} onBack={() => setActiveConvo(null)} />
      </View>
    );
  }

  const filtered = MOCK_CONVERSATIONS.filter(c =>
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = MOCK_CONVERSATIONS.reduce((n, c) => n + c.unread, 0);

  return (
    <View style={s.container}>
      {/* search bar */}
      <View style={s.searchWrap}>
        <Ionicons name="search" size={16} color={Colors.textMuted} style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          placeholder="Search messages..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {filtered.length === 0 ? (
        <View style={s.emptyState}>
          <Ionicons name="chatbubbles-outline" size={52} color={Colors.accent} style={s.emptyIcon} />
          <Text style={s.emptyTitle}>NO MESSAGES YET</Text>
          <Text style={s.emptyBody}>
            Connect with other OOF members{'\n'}and start a conversation.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {totalUnread > 0 && (
            <Text style={s.sectionLabel}>UNREAD · {totalUnread}</Text>
          )}
          {filtered.map(c => (
            <ConvoItem key={c.id} item={c} onPress={() => setActiveConvo(c)} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:        { flex: 1, backgroundColor: Colors.background },

  // search
  searchWrap:       { flexDirection: 'row', alignItems: 'center', margin: 16, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: Colors.inputBg ?? '#0D0D1F', borderRadius: 12, borderWidth: 1, borderColor: Colors.divider },
  searchIcon:       { marginRight: 8 },
  searchInput:      { flex: 1, color: Colors.text, fontSize: 14 },

  // convo list
  sectionLabel:     { color: Colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 2, paddingHorizontal: 20, paddingVertical: 6 },
  convoItem:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  avatarWrap:       { position: 'relative', marginRight: 14 },
  avatar:           { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.inputBg ?? '#0D0D1F', borderWidth: 1, borderColor: Colors.divider, justifyContent: 'center', alignItems: 'center' },
  onlineDot:        { position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: 6, backgroundColor: '#00FF88', borderWidth: 2, borderColor: Colors.background },
  convoMeta:        { flex: 1 },
  convoTopRow:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  convoUsername:    { color: Colors.text, fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  convoTime:        { color: Colors.textMuted, fontSize: 11 },
  convoBottomRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  convoLastMsg:     { color: Colors.textMuted, fontSize: 13, flex: 1 },
  convoLastMsgUnread: { color: Colors.text, fontWeight: '600' },
  unreadBadge:      { backgroundColor: Colors.accent, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5, marginLeft: 8 },
  unreadCount:      { color: Colors.background, fontSize: 10, fontWeight: '900' },

  // empty state
  emptyState:       { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingBottom: 80 },
  emptyIcon:        { marginBottom: 20, opacity: 0.7 },
  emptyTitle:       { color: Colors.accent, fontSize: 16, fontWeight: '900', letterSpacing: 3, marginBottom: 12, textShadowColor: Colors.accent, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4 },
  emptyBody:        { color: Colors.textMuted, fontSize: 14, lineHeight: 22, textAlign: 'center' },

  // chat header
  chatHeader:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  chatHeaderCenter: { alignItems: 'center' },
  chatHeaderName:   { color: Colors.text, fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  chatOnline:       { color: '#00FF88', fontSize: 10, fontWeight: '600', marginTop: 2 },

  // chat messages
  msgList:          { paddingHorizontal: 16, paddingVertical: 20, gap: 10 },
  bubble:           { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine:       { alignSelf: 'flex-end', backgroundColor: Colors.accent, borderBottomRightRadius: 4 },
  bubbleTheirs:     { alignSelf: 'flex-start', backgroundColor: Colors.inputBg ?? '#0D0D1F', borderWidth: 1, borderColor: Colors.divider, borderBottomLeftRadius: 4 },
  bubbleText:       { fontSize: 14, lineHeight: 20 },
  bubbleTextMine:   { color: Colors.background },
  bubbleTextTheirs: { color: Colors.text },
  bubbleTime:       { fontSize: 9, color: 'rgba(128,128,128,0.7)', marginTop: 4, textAlign: 'right' },

  // input bar
  inputBar:         { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.divider, gap: 10 },
  textInput:        { flex: 1, backgroundColor: Colors.inputBg ?? '#0D0D1F', borderRadius: 22, borderWidth: 1, borderColor: Colors.divider, paddingHorizontal: 16, paddingVertical: 10, color: Colors.text, fontSize: 14, maxHeight: 100 },
  sendBtn:          { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center' },
});
