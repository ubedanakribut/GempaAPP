// src/screens/BookmarkScreen.js
// FITUR 3 — Login/Register Firebase Auth + Bookmark Gempa via Firestore
// Tanggung Jawab Demo: Anggota 3 (Firebase Integrator)

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import {
  auth, loginUser, registerUser, logoutUser,
  getBookmarks, removeBookmark, onAuthChange,
} from '../services/firebaseService';
import { getMagnitudeInfo } from '../services/bmkgService';

// ─── Sub-komponen: Form Login/Register ───────────────────────────────────────
function AuthForm() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email dan password tidak boleh kosong.');
      return;
    }
    try {
      setLoading(true);
      if (isRegister) {
        await registerUser(email, password);
        Alert.alert('Berhasil', 'Akun berhasil dibuat!');
      } else {
        await loginUser(email, password);
      }
    } catch (err) {
      Alert.alert('Gagal', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.authContainer}>
      <Text style={styles.authTitle}>{isRegister ? 'Buat Akun Baru' : 'Masuk ke Akun'}</Text>
      <Text style={styles.authSub}>untuk menyimpan gempa favorit Anda</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password (min. 6 karakter)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.primaryBtnText}>{isRegister ? 'Daftar' : 'Masuk'}</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsRegister(v => !v)} style={styles.switchBtn}>
        <Text style={styles.switchText}>
          {isRegister ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

// ─── Sub-komponen: Daftar Bookmark ───────────────────────────────────────────
function BookmarkList({ user }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const data = await getBookmarks(user.uid); // Firestore read
      setBookmarks(data);
    } catch {
      Alert.alert('Error', 'Gagal memuat bookmark.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookmarks(); }, []);

  const handleDelete = (id) => {
    Alert.alert('Hapus Bookmark', 'Yakin ingin menghapus bookmark ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive',
        onPress: async () => {
          await removeBookmark(id); // Firestore delete
          loadBookmarks();
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const magInfo = getMagnitudeInfo(item.magnitude);
    return (
      <View style={styles.bmkCard}>
        <View style={[styles.bmkMagBadge, { backgroundColor: magInfo.bg }]}>
          <Text style={[styles.bmkMagText, { color: magInfo.color }]}>
            {parseFloat(item.magnitude).toFixed(1)} SR
          </Text>
        </View>
        <View style={styles.bmkInfo}>
          <Text style={styles.bmkWilayah} numberOfLines={2}>{item.wilayah}</Text>
          <Text style={styles.bmkWaktu}>{item.tanggal} · {item.jam}</Text>
          <Text style={styles.bmkDepth}>Kedalaman: {item.kedalaman}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>🗑</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header user */}
      <View style={styles.userBar}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{user.email[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
          <Text style={styles.userSub}>{bookmarks.length} bookmark tersimpan</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => logoutUser()}>
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#185FA5" />
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🔖</Text>
              <Text style={styles.emptyTitle}>Belum ada bookmark</Text>
              <Text style={styles.emptySub}>
                Buka tab Gempa Terbaru dan simpan gempa yang ingin Anda pantau.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function BookmarkScreen() {
  const [user, setUser] = useState(undefined); // undefined = belum cek, null = tidak login

  useEffect(() => {
    // onAuthChange listener Firebase Auth
    const unsubscribe = onAuthChange((u) => setUser(u));
    return unsubscribe; // cleanup saat unmount
  }, []);

  if (user === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#185FA5" />
      </View>
    );
  }

  return user ? <BookmarkList user={user} /> : <AuthForm />;
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F8F8F6' },
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // Auth form
  authContainer:   { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#F8F8F6' },
  authTitle:       { fontSize: 22, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  authSub:         { fontSize: 13, color: '#888', marginBottom: 28 },
  input:           { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14,
                     paddingVertical: 12, fontSize: 14, borderWidth: 0.5,
                     borderColor: '#D0D0D0', marginBottom: 12 },
  primaryBtn:      { backgroundColor: '#185FA5', borderRadius: 10, paddingVertical: 14,
                     alignItems: 'center', marginTop: 4 },
  primaryBtnText:  { color: '#fff', fontWeight: '700', fontSize: 15 },
  switchBtn:       { marginTop: 16, alignItems: 'center' },
  switchText:      { color: '#185FA5', fontSize: 13 },
  // User bar
  userBar:         { flexDirection: 'row', alignItems: 'center', gap: 10,
                     padding: 14, backgroundColor: '#fff',
                     borderBottomWidth: 0.5, borderColor: '#E5E5E5' },
  avatarCircle:    { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E6F1FB',
                     alignItems: 'center', justifyContent: 'center' },
  avatarText:      { fontSize: 16, fontWeight: '700', color: '#185FA5' },
  userEmail:       { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  userSub:         { fontSize: 11, color: '#888' },
  logoutBtn:       { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
                     borderWidth: 0.5, borderColor: '#D0D0D0' },
  logoutText:      { fontSize: 12, color: '#666' },
  // Bookmark card
  bmkCard:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
                     marginHorizontal: 12, marginTop: 10, borderRadius: 12,
                     padding: 12, borderWidth: 0.5, borderColor: '#E5E5E5', gap: 10 },
  bmkMagBadge:     { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center' },
  bmkMagText:      { fontSize: 14, fontWeight: '700' },
  bmkInfo:         { flex: 1 },
  bmkWilayah:      { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  bmkWaktu:        { fontSize: 11, color: '#999', marginTop: 2 },
  bmkDepth:        { fontSize: 11, color: '#666', marginTop: 1 },
  deleteBtn:       { padding: 6 },
  deleteText:      { fontSize: 18 },
  // Empty state
  emptyBox:        { padding: 40, alignItems: 'center' },
  emptyIcon:       { fontSize: 40, marginBottom: 10 },
  emptyTitle:      { fontSize: 15, fontWeight: '600', color: '#444', marginBottom: 6 },
  emptySub:        { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 18 },
});
