import axios from 'axios';

const BASE_URL = 'https://data.bmkg.go.id/DataMKG/TEWS';
const IMG_BASE  = 'https://data.bmkg.go.id/DataMKG/TEWS/';

// Axios instance dengan timeout & base URL
const bmkgAxios = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: log setiap request (berguna saat demo Fitur 2)
bmkgAxios.interceptors.request.use(
  (config) => {
    console.log(`[BMKG] REQUEST → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: tangani error response secara terpusat
bmkgAxios.interceptors.response.use(
  (response) => {
    console.log(`[BMKG] RESPONSE ← ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Periksa koneksi internet Anda.');
    }
    if (!error.response) {
      throw new Error('Tidak dapat terhubung ke server BMKG.');
    }
    throw new Error(`Server error: ${error.response.status}`);
  }
);

/**
 * FITUR 1 — Gempa terbaru (1 data)
 * Endpoint: /autogempa.json
 */
export const fetchGempaTerbaru = async () => {
  const response = await bmkgAxios.get('/autogempa.json');
  const gempa = response.data?.Infogempa?.gempa;
  if (!gempa) throw new Error('Format data BMKG tidak dikenali.');
  return {
    ...gempa,
    shakemapUrl: gempa.Shakemap ? IMG_BASE + gempa.Shakemap : null,
  };
};

/**
 * FITUR 2 — 15 gempa terakhir
 * Endpoint: /gempaterkini.json
 */
export const fetchGempaTerkini = async () => {
  const response = await bmkgAxios.get('/gempaterkini.json');
  const list = response.data?.Infogempa?.gempa;
  if (!Array.isArray(list)) throw new Error('Format data BMKG tidak dikenali.');
  return list.map((g) => ({
    ...g,
    shakemapUrl: g.Shakemap ? IMG_BASE + g.Shakemap : null,
  }));
};

// Helper: kategorisasi magnitudo
export const getMagnitudeInfo = (mag) => {
  const m = parseFloat(mag);
  if (m >= 7.0) return { label: 'Sangat Kuat', color: '#A32D2D', bg: '#FCEBEB' };
  if (m >= 6.0) return { label: 'Kuat',        color: '#854F0B', bg: '#FAEEDA' };
  if (m >= 5.0) return { label: 'Sedang',      color: '#185FA5', bg: '#E6F1FB' };
  if (m >= 4.0) return { label: 'Ringan',      color: '#3B6D11', bg: '#EAF3DE' };
  return         { label: 'Mikro',             color: '#5F5E5A', bg: '#F1EFE8' };
};
