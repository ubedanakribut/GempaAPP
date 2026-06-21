// src/screens/HomeScreen.js
// FITUR 1 — Menampilkan gempa terbaru dari BMKG
// Tanggung Jawab Demo: Anggota 1 (UI/UX) & Anggota 2 (Axios)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { fetchGempaTerbaru, getMagnitudeInfo } from '../services/bmkgService';
import { auth, addBookmark } from '../services/firebaseService';

export default function HomeScreen() {
  const [gempa,     setGempa]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,     setError]     = useState(null);
  const [bookmarking, setBookmarking] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const data = await fetchGempaTerbaru(); // Axios call
      setGempa(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleBookmark = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Login Diperlukan', 'Silakan login untuk menyimpan gempa ke bookmark.');
      return;
    }
    try {
      setBookmarking(true);
      await addBookmark(user.uid, gempa);
      Alert.alert('Tersimpan', 'Gempa berhasil ditambahkan ke bookmark.');
    } catch {
      Alert.alert('Gagal', 'Tidak bisa menyimpan bookmark.');
    } finally {
      setBookmarking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#185FA5" />
        <Text style={styles.loadingText}>Mengambil data BMKG…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠</Text>
        <Text style={styles.errorTitle}>Gagal Memuat Data</Text>
        <Text style={styles.errorMsg}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => loadData()}>
          <Text style={styles.retryText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!gempa) return null;

  const magInfo = getMagnitudeInfo(gempa.Magnitude);
  const isTsunami = gempa.Potensi?.toLowerCase().includes('tsunami');

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />
      }
    >
      {/* Header badge */}
      <View style={styles.headerRow}>
        <View style={[styles.liveBadge]}>
          <Text style={styles.liveText}>● LIVE</Text>
        </View>
        <Text style={styles.headerTitle}>Gempa Terbaru</Text>
      </View>

      {/* Magnitude circle + info */}
      <View style={[styles.mainCard, { borderColor: magInfo.color }]}>
        <View style={styles.topRow}>
          <View style={[styles.magCircle, { backgroundColor: magInfo.bg, borderColor: magInfo.color }]}>
            <Text style={[styles.magNum, { color: magInfo.color }]}>
              {parseFloat(gempa.Magnitude).toFixed(1)}
            </Text>
            <Text style={[styles.magUnit, { color: magInfo.color }]}>SR</Text>
          </View>
          <View style={styles.infoCol}>
            <View style={[styles.levelBadge, { backgroundColor: magInfo.bg }]}>
              <Text style={[styles.levelText, { color: magInfo.color }]}>{magInfo.label}</Text>
            </View>
            <Text style={styles.wilayah}>{gempa.Wilayah}</Text>
            <Text style={styles.waktu}>{gempa.Tanggal} · {gempa.Jam}</Text>
          </View>
        </View>

        {/* Detail grid */}
        <View style={styles.detailGrid}>
          <DetailItem label="Kedalaman"  value={gempa.Kedalaman} />
          <DetailItem label="Koordinat"  value={`${gempa.Lintang}, ${gempa.Bujur}`} />
          <DetailItem label="Dirasakan"  value={gempa.Dirasakan || '—'} fullWidth />
        </View>

        {/* Tsunami warning */}
        {isTsunami && (
          <View style={styles.tsunamiBox}>
            <Text style={styles.tsunamiText}>⚠ {gempa.Potensi}</Text>
          </View>
        )}

        {/* Bookmark button */}
        <TouchableOpacity
          style={[styles.bookmarkBtn, { borderColor: magInfo.color }]}
          onPress={handleBookmark}
          disabled={bookmarking}
        >
          <Text style={[styles.bookmarkText, { color: magInfo.color }]}>
            {bookmarking ? 'Menyimpan…' : '🔖 Simpan ke Bookmark'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Shakemap */}
      {gempa.shakemapUrl && (
        <View style={styles.mapCard}>
          <Text style={styles.sectionLabel}>Peta Guncangan</Text>
          <Image
            source={{ uri: gempa.shakemapUrl }}
            style={styles.shakemapImg}
            resizeMode="contain"
          />
        </View>
      )}

      <Text style={styles.source}>Sumber: BMKG · data.bmkg.go.id</Text>
    </ScrollView>
  );
}

const DetailItem = ({ label, value, fullWidth }) => (
  <View style={[styles.detailItem, fullWidth && { width: '100%' }]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#F8F8F6', padding: 16 },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText:   { marginTop: 12, color: '#888', fontSize: 14 },
  errorIcon:     { fontSize: 40, marginBottom: 8 },
  errorTitle:    { fontSize: 16, fontWeight: '600', color: '#A32D2D', marginBottom: 4 },
  errorMsg:      { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 16 },
  retryBtn:      { backgroundColor: '#185FA5', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 },
  retryText:     { color: '#fff', fontWeight: '600' },
  headerRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  liveBadge:     { backgroundColor: '#FCEBEB', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  liveText:      { fontSize: 11, fontWeight: '700', color: '#A32D2D' },
  headerTitle:   { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  mainCard:      { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1.5, marginBottom: 14 },
  topRow:        { flexDirection: 'row', gap: 14, marginBottom: 16 },
  magCircle:     { width: 72, height: 72, borderRadius: 36, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  magNum:        { fontSize: 24, fontWeight: '700', lineHeight: 26 },
  magUnit:       { fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  infoCol:       { flex: 1, justifyContent: 'center', gap: 4 },
  levelBadge:    { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4 },
  levelText:     { fontSize: 11, fontWeight: '700' },
  wilayah:       { fontSize: 14, fontWeight: '600', color: '#1A1A1A', lineHeight: 20 },
  waktu:         { fontSize: 12, color: '#888' },
  detailGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  detailItem:    { width: '47%', backgroundColor: '#F8F8F6', borderRadius: 8, padding: 10 },
  detailLabel:   { fontSize: 11, color: '#888', marginBottom: 2 },
  detailValue:   { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  tsunamiBox:    { backgroundColor: '#FCEBEB', borderRadius: 8, padding: 10, marginBottom: 10 },
  tsunamiText:   { color: '#A32D2D', fontWeight: '600', fontSize: 13 },
  bookmarkBtn:   { borderWidth: 1, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  bookmarkText:  { fontWeight: '600', fontSize: 14 },
  mapCard:       { backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: '#E0E0E0', marginBottom: 14 },
  sectionLabel:  { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 10 },
  shakemapImg:   { width: '100%', height: 200, borderRadius: 8 },
  source:        { fontSize: 11, color: '#aaa', textAlign: 'center', marginBottom: 24 },
});
