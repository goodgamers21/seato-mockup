/**
 * Prompt Templates for Restaurant Analytics & Merchant Advisor
 */

export const RESTAURANT_ANALYSIS_SYSTEM_PROMPT = `
Anda adalah SEATO AI Business Advisor kelas dunia khusus industri F&B (Cafe, Coffee Shop, dan Restoran).
Tugas Anda adalah menganalisis data performa mingguan resto (telemetri pengunjung, kata kunci pencarian, ulasan pelanggan, reservasi, dan jam ramai) lalu menghasilkan analisis naratif yang tajam, skor sentimen, dan 3 rekomendasi bisnis taktis yang langsung bisa dieksekusi oleh merchant.

Output WAJIB berupa JSON dengan struktur persis berikut:
{
  "summary": "Ringkasan performa naratif 2-3 kalimat...",
  "sentiment_score": 4.7,
  "peak_hours": {
    "busiestDay": "Hari tersibuk (cth: Jumat & Sabtu)",
    "peakTime": "Rentang jam sibuk (cth: 18:30 - 21:30)",
    "quietDay": "Hari paling sepi (cth: Selasa)",
    "quietTime": "Rentang jam sepi (cth: 13:00 - 16:00)"
  },
  "top_keywords": ["Kata kunci 1 (XX%)", "Kata kunci 2 (XX%)", "Kata kunci 3 (XX%)"],
  "action_items": [
    "🚀 Saran promo/diskon taktis untuk jam sepi...",
    "⚡ Saran operasional/fasilitas berdasarkan ulasan user...",
    "🎯 Saran retensi pelanggan..."
  ],
  "churn_risk_estimate": 5
}
`;

export function buildMerchantAnalysisPrompt({ restaurant, stats, reviews, visitorLogs, reservations }) {
  const topKeywordsList = visitorLogs
    .filter(l => l.keyword)
    .map(l => l.keyword)
    .slice(0, 15)
    .join(', ');

  const reviewsSummary = reviews
    .slice(0, 10)
    .map(r => `[Rating ${r.rating}/5]: "${r.comment}"`)
    .join('\n');

  return `
Berikut adalah data aktivitas performa untuk restoran:
Nama Restoran: ${restaurant.name}
Kota / Lokasi: ${restaurant.city} (${restaurant.address})
Tipe: ${restaurant.type}

--- DATA AKTIVITAS 7 HARI TERAKHIR ---
- Total Halaman Resto Dilihat (Views): ${stats.totalViews}
- Profil Dibuka: ${stats.profileVisits}
- Total Reservasi: ${reservations.length}
- Reservasi Selesai: ${reservations.filter(r => r.status === 'Selesai').length}
- Reservasi Dibatalkan: ${reservations.filter(r => r.status === 'Dibatalkan').length}
- Kata Kunci Pencarian Pengunjung: ${topKeywordsList || 'WFC Friendly, Colokan, Live Music'}

--- ULASAN PELANGGAN TERBARU ---
${reviewsSummary || 'Belum ada ulasan baru.'}

Silakan buatkan analisis dan rekomendasi dalam format JSON sesuai instruksi.
`;
}
