# GempaApp — Aplikasi Monitoring Gempa Bumi Indonesia

> Ujian Praktikum Mobile Computing · Semester Genap 2025-2026

Aplikasi mobile berbasis React Native (Expo) yang menampilkan informasi gempa bumi real-time dari BMKG (Badan Meteorologi, Klimatologi, dan Geofisika Indonesia), dilengkapi fitur bookmark berbasis Firebase Authentication dan Cloud Firestore.

---

## Anggota Tim & Pembagian Tugas (Skenario B — 2 Orang)

| No | Nama | NIM | Peran | Tanggung Jawab Demo |
|----|------|-----|-------|---------------------|
| 1 | [Ubaidillah Hakim] | [0923040102] | Frontend & Axios Specialist | Desain seluruh UI/UX aplikasi + integrasi Axios ke API BMKG (Fitur 1 & Fitur 2) |
| 2 | [Nama Anggota 2] | [NIM] | Backend, State & Firebase Specialist | Manajemen state lokal aplikasi + seluruh integrasi Firebase Auth & Firestore (Fitur 3 + setup Firebase) |

> Bukti kontribusi masing-masing anggota dapat dilihat pada **history commit** di repositori GitHub.

---

## Deskripsi Aplikasi

**GempaApp** adalah aplikasi mobile portal informasi gempa bumi yang mengonsumsi API publik resmi BMKG secara real-time menggunakan **Axios** untuk HTTP request. Pengguna dapat memantau gempa terbaru, melihat riwayat 15 gempa terakhir, serta menyimpan gempa favorit ke dalam daftar bookmark yang tersimpan di **Firebase Cloud Firestore** setelah melakukan autentikasi melalui **Firebase Authentication**.

### API yang Digunakan

| No | Endpoint | Keterangan |
|----|----------|------------|
| 1 | `https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json` | Gempa bumi terbaru (1 data terkini) |
| 2 | `https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json` | 15 gempa terakhir |

- ✅ Gratis, tanpa API key
- ✅ Format JSON, CORS-friendly
- ✅ Disediakan resmi oleh BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)

---

## 3 Fitur Utama yang Didemokan

### Fitur 1 — Gempa Terbaru
**File:** `src/screens/HomeScreen.js`
**Dikerjakan oleh:** Anggota 1 (Frontend & Axios Specialist)

- Mengambil data gempa terbaru dari endpoint `/autogempa.json` menggunakan **Axios**
- Menampilkan magnitudo, wilayah, waktu, kedalaman, koordinat, dan potensi tsunami
- Menampilkan peta guncangan (shakemap) dari server BMKG
- Tombol simpan ke Bookmark (terintegrasi Firebase Firestore)
- Fitur pull-to-refresh untuk memperbarui data
- Error handling: timeout, koneksi gagal, format data tidak dikenali

**Alur demo Anggota 1:** Menjelaskan desain UI (layout kartu magnitudo, badge level, shakemap) dan mekanisme penarikan data dari API BMKG menggunakan Axios beserta penanganan error-nya.

---

### Fitur 2 — Riwayat 15 Gempa Terakhir
**File:** `src/screens/ListScreen.js`, `src/screens/DetailScreen.js`
**Dikerjakan oleh:** Anggota 1 (Frontend & Axios Specialist)

- Mengambil 15 gempa terakhir dari endpoint `/gempaterkini.json` menggunakan **Axios**
- Axios interceptors untuk logging request/response dan error handling terpusat
- Filter berdasarkan magnitudo (Semua / M≥4 / M≥5 / M≥6)
- Pencarian gempa berdasarkan nama wilayah (real-time filter)
- Navigasi ke halaman Detail Gempa dengan informasi lengkap

**Alur demo Anggota 1:** Menjelaskan penggunaan Axios instance dengan interceptors, mekanisme parsing JSON response dari BMKG, serta implementasi filter dan search secara lokal.

---

### Fitur 3 — Login, Register & Bookmark Gempa (Firebase)
**File:** `src/screens/AuthScreen.js`, `src/screens/BookmarkScreen.js`, `src/services/firebaseService.js`
**Dikerjakan oleh:** Anggota 2 (Backend, State & Firebase Specialist)

- **Firebase Authentication:** Register & Login dengan email/password
- Auth gate: seluruh halaman aplikasi hanya bisa diakses setelah login
- Persistent session via `onAuthStateChanged` listener (tidak perlu login ulang)
- **Cloud Firestore:** Simpan gempa favorit ke collection `bookmarks`
- Baca daftar bookmark milik user yang sedang login (query `where userId == uid`)
- Hapus bookmark berdasarkan document ID (Firestore delete)
- Tombol Keluar (logout) dengan Firebase `signOut`

**Alur demo Anggota 2:** Menjelaskan konfigurasi Firebase SDK, implementasi Auth (register/login/logout/session), arsitektur Firestore (collection, document, field), security rules database, dan manajemen state sesi pengguna via `onAuthStateChanged`.

---

## Arsitektur Proyek

```
GempaApp/
├── App.js                              # Entry point
├── package.json                        # Dependencies
├── README.md                           # Dokumentasi ini
└── src/
    ├── services/
    │   ├── bmkgService.js              # Axios instance + BMKG API calls (Anggota 1)
    │   └── firebaseService.js          # Firebase Auth + Firestore CRUD (Anggota 2)
    ├── screens/
    │   ├── AuthScreen.js               # Halaman Login/Register (Anggota 2)
    │   ├── HomeScreen.js               # Fitur 1 — Gempa Terbaru (Anggota 1)
    │   ├── ListScreen.js               # Fitur 2 — Riwayat Gempa (Anggota 1)
    │   ├── DetailScreen.js             # Detail Gempa (Anggota 1)
    │   └── BookmarkScreen.js           # Fitur 3 — Bookmark (Anggota 2)
    └── navigation/
        └── AppNavigator.js             # Auth gate + Tab & Stack navigator (Anggota 2)
```

---

## Library & Dependency

| Library | Versi | Fungsi | Dikerjakan |
|---------|-------|--------|------------|
| `axios` | ^1.7.2 | HTTP request ke BMKG API **(wajib)** | Anggota 1 |
| `firebase` | ^10.12.2 | Authentication + Firestore **(wajib)** | Anggota 2 |
| `expo` | ~51.0.0 | React Native framework | Keduanya |
| `@react-navigation/native` | ^6.1.17 | Navigasi utama | Anggota 2 |
| `@react-navigation/bottom-tabs` | ^6.5.20 | Tab bar navigasi | Anggota 2 |
| `@react-navigation/native-stack` | ^6.9.26 | Stack navigasi | Anggota 2 |

---

## Setup & Cara Menjalankan

```bash
# 1. Clone repositori
git clone https://github.com/[username]/GempaApp.git
cd GempaApp

# 2. Install semua dependency
npm install

# 3. Install dependency web (opsional)
npx expo install react-native-web react-dom @expo/metro-runtime

# 4. Konfigurasi Firebase (lihat bagian di bawah)

# 5. Jalankan aplikasi
npx expo start

# Tekan 'a' untuk Android Emulator
# Tekan 'w' untuk Web Browser
# Scan QR dengan Expo Go untuk HP fisik
```

### Konfigurasi Firebase

1. Buka [Firebase Console](https://console.firebase.google.com) → buat project baru
2. Aktifkan **Authentication** → **Sign-in method** → aktifkan **Email/Password**
3. Buat **Firestore Database** → pilih mode **Production**
4. Buka **Project Settings** → salin konfigurasi SDK
5. Tempelkan ke file `src/services/firebaseService.js`:

```javascript
const firebaseConfig = {
  apiKey:            'ISI_API_KEY_ANDA',
  authDomain:        'NAMA_PROJECT.firebaseapp.com',
  projectId:         'NAMA_PROJECT_ID',
  storageBucket:     'NAMA_PROJECT.appspot.com',
  messagingSenderId: 'SENDER_ID_ANDA',
  appId:             'APP_ID_ANDA',
};
```

### Firestore Security Rules

Buka Firebase Console → Firestore → tab **Rules** → paste kode berikut → klik **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bookmarks/{docId} {
      // Hanya user yang login dan memiliki dokumen tersebut yang bisa baca/hapus
      allow read, delete: if request.auth != null
                          && resource.data.userId == request.auth.uid;
      // Hanya user yang login dan membuat dokumen atas namanya sendiri yang bisa tulis
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## Komponen Penilaian

| Komponen | Bobot | Implementasi dalam Proyek |
|----------|-------|--------------------------|
| Implementasi Axios | 25% | `bmkgService.js` — Axios instance, interceptors request/response, timeout, error handling terpusat |
| Implementasi Firebase | 25% | `firebaseService.js` — Auth (register/login/logout/session) + Firestore (create/read/delete) + security rules |
| UI/UX & Kerapian Kode | 15% | StyleSheet terpisah per screen, komponen reusable, navigasi Auth gate |
| Kerja sama & Git Log | 15% | Commit dipisah per anggota sesuai pembagian tugas di atas |
| Penguasaan Materi / Demo | 20% | Anggota 1 demo Fitur 1 & 2, Anggota 2 demo Fitur 3 + setup Firebase |

---

## Link Repositori

🔗 **GitHub:** `https://github.com/[username]/GempaApp` *(ganti dengan link repo asli)*
