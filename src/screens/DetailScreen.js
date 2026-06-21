// src/screens/DetailScreen.js
// Halaman detail gempa (navigasi dari ListScreen)

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Alert,
} from 'react-native';
import { getMagnitudeInfo } from '../services/bmkgService';
import { auth, addBookmark } from '../services/firebaseService';

export default function DetailScreen({ route }) {
  const { gempa } = route.params;
  const magInfo = getMagnitudeInfo(gempa.Magnitude);
  const [bookmarking, setBookmarking] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const handleBookmark = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Login Diperlukan', 'Silakan login di tab Bookmark terlebih dahulu.');
      return;
    }
    try {
      setBookmarking(true);
      await addBookmark(user.uid, gempa);
      Alert.alert('Tersimpan', 'Berhasil disimpan ke bookmark.');
    } catch {
      Alert.alert('Gagal', 'Tidak bisa menyimpan bookmark saat ini.');
    } finally {
      setBookmarking(false);
    }
  };

  const isTsunami = gempa.Potensi?.toLowerCase().includes('tsunami');

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.headerCard, { borderColor: magInfo.color }]}>
        <View style={[styles.magCircle, { backgroundColor: magInfo.bg, borderColor: magInfo.color }]}>
          <Text style={[styles.magNum, { color: magInfo.color }]}>
            {parseFloat(gempa.Magnitude).toFixed(1)}
          </Text>
          <Text style={[styles.magUnit, { color: magInfo.color }]}>SR</Text>
        </View>
        <Text style={styles.wilayah}>{gempa.Wilayah}</Text>
        <Text style={styles.waktu}>{gempa.Tanggal} · {gempa.Jam}</Text>
        <View style={[styles.levelBadge, { backgroundColor: magInfo.bg }]}>
          <Text style={[styles.levelText, { color: magInfo.color }]}>{magInfo.label}</Text>
        </View>
      </View>

      {isTsunami && (
        <View style={styles.tsunamiBox}>
          <Text style={styles.tsunamiText}>⚠ {gempa.Potensi}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Row label="Kedalaman"   value={gempa.Kedalaman} />
        <Row label="Lintang"     value={gempa.Lintang} />
        <Row label="Bujur"       value={gempa.Bujur} />
        {gempa.Dirasakan && <Row label="Dirasakan" value={gempa.Dirasakan} />}
      </View>

      {gempa.shakemapUrl && (
        <View style={styles.section}>
          <TouchableOpacity onPress={() => setShowMap(v => !v)} style={styles.mapToggle}>
            <Text style={styles.mapToggleText}>
              {showMap ? '▲ Sembunyikan Peta' : '▼ Tampilkan Peta Guncangan'}
            </Text>
          </TouchableOpacity>
          {showMap && (
            <Image
              source={{ uri: gempa.shakemapUrl }}
              style={styles.mapImg}
              resizeMode="contain"
            />
          )}
        </View>
      )}

      <TouchableOpacity
        style={[styles.bookmarkBtn, { borderColor: magInfo.color }]}
        onPress={handleBookmark}
        disabled={bookmarking}
      >
        <Text style={[styles.bookmarkText, { color: magInfo.color }]}>
          {bookmarking ? 'Menyimpan…' : '🔖 Simpan ke Bookmark'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.source}>Sumber: BMKG · data.bmkg.go.id</Text>
    </ScrollView>
  );
}

const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#F8F8F6', padding: 16 },
  headerCard:    { backgroundColor: '#fff', borderRadius: 14, padding: 20,
                   borderWidth: 1.5, alignItems: 'center', marginBottom: 12 },
  magCircle:     { width: 80, height: 80, borderRadius: 40, borderWidth: 2,
                   alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  magNum:        { fontSize: 28, fontWeight: '700', lineHeight: 30 },
  magUnit:       { fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  wilayah:       { fontSize: 15, fontWeight: '700', color: '#1A1A1A',
                   textAlign: 'center', lineHeight: 22, marginBottom: 4 },
  waktu:         { fontSize: 12, color: '#888', marginBottom: 10 },
  levelBadge:    { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4 },
  levelText:     { fontSize: 12, fontWeight: '700' },
  tsunamiBox:    { backgroundColor: '#FCEBEB', borderRadius: 10, padding: 12,
                   marginBottom: 12, borderWidth: 0.5, borderColor: '#F09595' },
  tsunamiText:   { color: '#A32D2D', fontWeight: '700', fontSize: 13, textAlign: 'center' },
  section:       { backgroundColor: '#fff', borderRadius: 12, padding: 14,
                   marginBottom: 12, borderWidth: 0.5, borderColor: '#E5E5E5' },
  row:           { flexDirection: 'row', justifyContent: 'space-between',
                   paddingVertical: 8, borderBottomWidth: 0.5, borderColor: '#F0F0F0' },
  rowLabel:      { fontSize: 13, color: '#888' },
  rowValue:      { fontSize: 13, fontWeight: '600', color: '#1A1A1A', flex: 1, textAlign: 'right' },
  mapToggle:     { paddingVertical: 6, alignItems: 'center' },
  mapToggleText: { fontSize: 13, color: '#185FA5', fontWeight: '600' },
  mapImg:        { width: '100%', height: 200, borderRadius: 8, marginTop: 10 },
  bookmarkBtn:   { borderWidth: 1.5, borderRadius: 10, paddingVertical: 14,
                   alignItems: 'center', marginBottom: 12 },
  bookmarkText:  { fontWeight: '700', fontSize: 15 },
  source:        { fontSize: 11, color: '#aaa', textAlign: 'center', marginBottom: 30 },
});
