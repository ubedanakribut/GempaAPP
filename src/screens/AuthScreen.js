// src/screens/AuthScreen.js
// Halaman Login/Register — ditampilkan sebelum masuk ke aplikasi utama

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { loginUser, registerUser } from '../services/firebaseService';

export default function AuthScreen() {
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [showPass,   setShowPass]   = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Peringatan', 'Email dan password tidak boleh kosong.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Peringatan', 'Password minimal 6 karakter.');
      return;
    }
    try {
      setLoading(true);
      if (isRegister) {
        await registerUser(email.trim(), password);
        Alert.alert('Berhasil! 🎉', 'Akun berhasil dibuat. Selamat datang!');
      } else {
        await loginUser(email.trim(), password);
        // Navigator otomatis berpindah ke MainApp via onAuthChange di AppNavigator
      }
    } catch (err) {
      // Terjemahkan pesan error Firebase ke bahasa Indonesia
      let msg = err.message;
      if (msg.includes('user-not-found') || msg.includes('invalid-credential')) {
        msg = 'Email atau password salah. Periksa kembali.';
      } else if (msg.includes('email-already-in-use')) {
        msg = 'Email ini sudah terdaftar. Silakan login.';
      } else if (msg.includes('invalid-email')) {
        msg = 'Format email tidak valid.';
      } else if (msg.includes('network-request-failed')) {
        msg = 'Tidak ada koneksi internet.';
      }
      Alert.alert('Gagal', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / ilustrasi */}
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>🌊</Text>
          <Text style={styles.logoTitle}>GempaApp</Text>
          <Text style={styles.logoSub}>Monitoring Gempa Bumi Indonesia</Text>
        </View>

        {/* Card form */}
        <View style={styles.card}>
          <Text style={styles.formTitle}>
            {isRegister ? 'Buat Akun Baru' : 'Masuk ke Akun'}
          </Text>
          <Text style={styles.formSub}>
            {isRegister
              ? 'Daftar untuk menyimpan gempa favorit Anda'
              : 'Masuk untuk melanjutkan ke aplikasi'}
          </Text>

          {/* Input email */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="contoh@email.com"
              placeholderTextColor="#bbb"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Input password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Minimal 6 karakter"
                placeholderTextColor="#bbb"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPass(v => !v)}
                style={styles.eyeBtn}
              >
                <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tombol utama */}
          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.primaryBtnText}>
                  {isRegister ? 'Daftar Sekarang' : 'Masuk'}
                </Text>
            }
          </TouchableOpacity>

          {/* Switch login/register */}
          <TouchableOpacity
            onPress={() => { setIsRegister(v => !v); setPassword(''); }}
            style={styles.switchBtn}
          >
            <Text style={styles.switchText}>
              {isRegister
                ? 'Sudah punya akun? '
                : 'Belum punya akun? '}
              <Text style={styles.switchLink}>
                {isRegister ? 'Masuk' : 'Daftar'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Sumber data: BMKG · data.bmkg.go.id</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    padding: 24,
  },
  // Logo
  logoBox: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoIcon: {
    fontSize: 52,
    marginBottom: 8,
  },
  logoTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#185FA5',
    letterSpacing: 0.5,
  },
  logoSub: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  formSub: {
    fontSize: 13,
    color: '#888',
    marginBottom: 24,
  },
  // Input
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1A1A1A',
  },
  passRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyeBtn: {
    padding: 10,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
  },
  eyeIcon: {
    fontSize: 16,
  },
  // Tombol
  primaryBtn: {
    backgroundColor: '#185FA5',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnDisabled: {
    backgroundColor: '#7AAAD6',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  switchBtn: {
    marginTop: 18,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 13,
    color: '#888',
  },
  switchLink: {
    color: '#185FA5',
    fontWeight: '700',
  },
  // Footer
  footer: {
    marginTop: 24,
    fontSize: 11,
    color: '#bbb',
    textAlign: 'center',
  },
});
