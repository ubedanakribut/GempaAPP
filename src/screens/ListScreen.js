// src/screens/ListScreen.js
// FITUR 2 — Daftar 15 gempa terakhir + filter magnitudo
// Tanggung Jawab Demo: Anggota 2 (Axios — request/response/error handling)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput,
} from 'react-native';
import { fetchGempaTerkini, getMagnitudeInfo } from '../services/bmkgService';

const FILTER_OPTIONS = [
  { label: 'Semua', minMag: 0 },
  { label: 'M ≥ 4', minMag: 4 },
  { label: 'M ≥ 5', minMag: 5 },
  { label: 'M ≥ 6', minMag: 6 },
];

export default function ListScreen({ navigation }) {
  const [allData,    setAllData]    = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState('');
  const [activeFilter, setActiveFilter] = useState(0);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchGempaTerkini(); // ← Axios call
      setAllData(data);
      setFiltered(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Filter + search setiap kali query atau filter berubah
  useEffect(() => {
    const minMag = FILTER_OPTIONS[activeFilter].minMag;
    const result = allData.filter((g) => {
      const magOk     = parseFloat(g.Magnitude) >= minMag;
      const searchOk  = g.Wilayah?.toLowerCase().includes(search.toLowerCase());
      return magOk && searchOk;
    });
    setFiltered(result);
  }, [allData, activeFilter, search]);

  const renderItem = ({ item, index }) => {
    const magInfo = getMagnitudeInfo(item.Magnitude);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Detail', { gempa: item })}
        activeOpacity={0.75}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.rankNum}>{index + 1}</Text>
          <View style={[styles.magBadge, { backgroundColor: magInfo.bg, borderColor: magInfo.color }]}>
            <Text style={[styles.magText, { color: magInfo.color }]}>
              {parseFloat(item.Magnitude).toFixed(1)}
            </Text>
            <Text style={[styles.magSr, { color: magInfo.color }]}>SR</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.wilayah} numberOfLines={2}>{item.Wilayah}</Text>
            <Text style={styles.waktu}>{item.Tanggal} · {item.Jam}</Text>
            <Text style={[styles.levelPill, { color: magInfo.color }]}>{magInfo.label}</Text>
          </View>
        </View>
        <View style={styles.depthCol}>
          <Text style={styles.depthLabel}>Kedalaman</Text>
          <Text style={styles.depthVal}>{item.Kedalaman}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#185FA5" />
        <Text style={styles.loadingText}>Mengambil 15 gempa terakhir…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>⚠ Gagal memuat data</Text>
        <Text style={styles.errorMsg}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
          <Text style={styles.retryText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Cari wilayah…"
        value={search}
        onChangeText={setSearch}
        clearButtonMode="always"
      />

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((opt, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.filterChip, activeFilter === i && styles.filterChipActive]}
            onPress={() => setActiveFilter(i)}
          >
            <Text style={[styles.filterText, activeFilter === i && styles.filterTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.countText}>{filtered.length} gempa</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Tidak ada gempa sesuai filter.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F8F8F6' },
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText:     { marginTop: 12, color: '#888', fontSize: 14 },
  errorTitle:      { fontSize: 15, fontWeight: '700', color: '#A32D2D', marginBottom: 6 },
  errorMsg:        { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 16 },
  retryBtn:        { backgroundColor: '#185FA5', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 },
  retryText:       { color: '#fff', fontWeight: '600' },
  searchInput:     { margin: 12, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14,
                     paddingVertical: 10, fontSize: 14, borderWidth: 0.5, borderColor: '#D0D0D0' },
  filterRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8, marginBottom: 8 },
  filterChip:      { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
                     backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#C0C0C0' },
  filterChipActive:{ backgroundColor: '#185FA5', borderColor: '#185FA5' },
  filterText:      { fontSize: 12, color: '#555' },
  filterTextActive:{ color: '#fff', fontWeight: '600' },
  countText:       { marginLeft: 'auto', fontSize: 12, color: '#888' },
  card:            { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 8,
                     borderRadius: 12, padding: 12, borderWidth: 0.5, borderColor: '#E5E5E5',
                     alignItems: 'center' },
  cardLeft:        { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rankNum:         { fontSize: 12, color: '#bbb', width: 18, textAlign: 'right' },
  magBadge:        { width: 52, height: 52, borderRadius: 26, borderWidth: 1.5,
                     alignItems: 'center', justifyContent: 'center' },
  magText:         { fontSize: 18, fontWeight: '700', lineHeight: 20 },
  magSr:           { fontSize: 9, fontWeight: '600', letterSpacing: 0.5 },
  cardInfo:        { flex: 1 },
  wilayah:         { fontSize: 13, fontWeight: '600', color: '#1A1A1A', lineHeight: 18 },
  waktu:           { fontSize: 11, color: '#999', marginTop: 2 },
  levelPill:       { fontSize: 11, fontWeight: '600', marginTop: 3 },
  depthCol:        { alignItems: 'flex-end' },
  depthLabel:      { fontSize: 10, color: '#aaa' },
  depthVal:        { fontSize: 12, fontWeight: '600', color: '#444' },
  emptyText:       { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 14 },
});
