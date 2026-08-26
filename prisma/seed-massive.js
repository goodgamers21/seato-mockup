import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper generators
const firstNames = [
  'Bagus', 'Giffard', 'Dandy', 'Arif', 'Rian', 'Dimas', 'Aditya', 'Farhan', 'Kevin', 'Budi',
  'Reza', 'Fajar', 'Satria', 'Bayu', 'Gilang', 'Ilham', 'Fikri', 'Hendra', 'Naufal', 'Yoga',
  'Putra', 'Andi', 'Wahyu', 'Rizky', 'Aldo', 'Bryan', 'David', 'Rio', 'Surya', 'Taufik',
  'Siti', 'Annisa', 'Putri', 'Dewi', 'Nabila', 'Rani', 'Fitri', 'Ayu', 'Sarah', 'Jessica',
  'Maya', 'Dinda', 'Indah', 'Clara', 'Mega', 'Tania', 'Sheila', 'Zahra', 'Laras', 'Nadya',
  'Fathia', 'Mutia', 'Tasya', 'Vania', 'Cynthia', 'Alya', 'Salsabila', 'Karin', 'Melisa', 'Ghea'
];

const lastNames = [
  'Pratama', 'Alamsyah', 'Putra', 'Maulana', 'Wijaya', 'Kusuma', 'Santoso', 'Hidayat', 'Saputra', 'Siregar',
  'Nasution', 'Lubis', 'Simanjuntak', 'Pasaribu', 'Sitompul', 'Hutapea', 'Gultom', 'Manurung', 'Sitorus', 'Pardede',
  'Setiawan', 'Gunawan', 'Sutanto', 'Hartono', 'Halim', 'Tanjung', 'Kurniawan', 'Wibowo', 'Nugroho', 'Prasetyo',
  'Firmansyah', 'Hakim', 'Anwar', 'Ramadhan', 'Syahputra', 'Permana', 'Hermawan', 'Subagyo', 'Utomo', 'Budiman'
];

const cafeAdjectives = ['Artisan', 'Specialty', 'Roastery', 'House', 'Lounge', 'Corner', 'Space', 'Social', 'Lab', 'Yard', 'Collective', 'Haven', 'Studio', 'Pavilion'];
const cafeLocations = [
  { city: 'Jakarta Selatan', areas: ['Senopati', 'SCBD', 'Kemang', 'Panglima Polim', 'Cilandak', 'Tebet', 'Gunawarman'] },
  { city: 'Jakarta Pusat', areas: ['Menteng', 'Thamrin', 'Cikini', 'Sabang', 'Tanah Abang'] },
  { city: 'Jakarta Utara', areas: ['Kelapa Gading', 'Pantai Indah Kapuk (PIK)', 'Sunter', 'Tanjung Priok', 'Pluit'] },
  { city: 'Jakarta Barat', areas: ['Tanjung Duren', 'Puri Indah', 'Green Ville', 'Tomang', 'Kebon Jeruk'] },
  { city: 'Jakarta Timur', areas: ['Rawamangun', 'Cibubur', 'Duren Sawit', 'Matraman'] },
  { city: 'Tangerang Selatan', areas: ['BSD City', 'Bintaro Sektor 9', 'Alam Sutera', 'Gading Serpong'] },
  { city: 'Bandung', areas: ['Dago Atas', 'Riau', 'Braga', 'Ciumbuleuit', 'Progo'] },
  { city: 'Surabaya', areas: ['Gubeng', 'Tunjungan', 'Pakuwon City', 'Kertajaya'] }
];

const cafeConcepts = [
  { name: 'Kopi Senja', type: 'Cafe & Roastery', tags: ['WFC Friendly', 'Smoking Indoor', 'Specialty Coffee', 'Live Music'] },
  { name: 'Titik Temu', type: 'Artisan Cafe', tags: ['WFC Friendly', 'Outdoor Garden', 'Pastry & Brunch', 'VIP Meeting'] },
  { name: 'Tanamera Coffee', type: 'Specialty Roastery', tags: ['Single Origin', 'Award Winning', 'WFC Friendly'] },
  { name: 'Union Brasserie', type: 'Brasserie & Bakery', tags: ['Fine Dining', 'Red Velvet Cake', 'Cocktails', 'Romantic Dinner'] },
  { name: 'Giyanti Coffee Roastery', type: 'Artisan Roastery', tags: ['Artisan Coffee', 'Outdoor Courtyard', 'Pastry'] },
  { name: 'Common Grounds', type: 'Specialty Cafe', tags: ['All Day Breakfast', 'Espresso Bar', 'WFC Friendly'] },
  { name: 'Anomali Coffee', type: 'Indonesian Specialty', tags: ['Kopi Asli Indonesia', 'WFC Friendly', 'Meeting Spot'] },
  { name: 'Bacha Coffee Lounge', type: 'Luxury Coffee Lounge', tags: ['Luxury Coffee', 'Gourmet Pastry', 'Heritage Ambience'] },
  { name: 'Monks Cafe', type: 'Modern Japanese Cafe', tags: ['Japanese Fusion', 'Matcha Specialty', 'Minimalist Interior'] },
  { name: 'Ombe Kofie', type: 'Neighborhood Cafe', tags: ['Comfort Food', 'Specialty Coffee', 'Pet Friendly'] },
  { name: 'Bakehouse & Co', type: 'Artisan Bakery', tags: ['Croissant', 'Sourdough', 'Brunch', 'WFC Friendly'] },
  { name: 'The Daily Grind', type: 'Co-working Cafe', tags: ['WFC Champion', 'High Speed WiFi', 'Quiet Zone', 'Colokan Banyak'] },
  { name: 'Filosofi Kopi', type: 'Culture Cafe', tags: ['Signature Blend', 'Live Music', 'Community Space'] },
  { name: 'Seven Speed Coffee', type: 'Bicycle & Cafe', tags: ['Cyclist Friendly', 'Good Vibes', 'Specialty Coffee'] },
  { name: 'Work coffee Indonesia', type: 'Eco Co-working Cafe', tags: ['Eco Friendly', 'Zero Waste', 'WFC Friendly'] },
  { name: 'Kroma', type: 'Creative Space & Cafe', tags: ['Creative Hub', 'Graphic Design Spot', 'Cozy Ambience'] },
  { name: 'Ruang Seduh', type: 'Manual Brew Bar', tags: ['Slow Bar', 'Filter Coffee Specialist', 'Quiet'] },
  { name: 'Koultoura Coffee', type: 'Family & Pet Cafe', tags: ['Pet Friendly', 'Kids Area', 'Brunch Spot'] },
  { name: 'Woodpecker Coffee', type: 'Espresso Bar', tags: ['Quick Coffee', 'Waffles', 'Compact Aesthetic'] },
  { name: 'First Crack Coffee', type: 'Coffee Academy & Cafe', tags: ['Coffee Class', 'Specialty Brews', 'Meeting Rooms'] }
];

const sampleReviews = [
  { rating: 5, comment: 'Tempat WFC paling ternyaman! Kecepatan WiFi tembus 100 Mbps, colokan di tiap meja, dan Flat White-nya luar biasa balance.' },
  { rating: 5, comment: 'Suasana outdoor sangat adem banyak pepohonan. Sangat cocok buat santai sore sambil nikmatin kopi susu gula aren dan pastry hangat.' },
  { rating: 4, comment: 'Kopinya enak banget dan pastry-nya fresh. Cuma kalau pas weekend malam parkir mobil agak susah, untung dibantu juru parkir.' },
  { rating: 5, comment: 'Barista sangat ramah dan knowledgeable waktu saya tanya soal tasting notes beans Ethiopia Guji. Pasti bakal balik lagi!' },
  { rating: 4, comment: 'Live music di hari Jumat asik banget, sound system-nya pas gak bikin bising kalau mau ngobrol santai.' },
  { rating: 5, comment: 'VIP Room-nya sangat cocok buat meeting kantor. Proyektor dan sound system bekerja sangat lancar. Makanan pasta truffle-nya juara.' },
  { rating: 3, comment: 'Kopinya enak tapi pas jam makan siang agak ramai dan berisik, AC di area tengah kurang dingin saat cuaca panas terik.' },
  { rating: 5, comment: 'Croissant almond-nya flaky dan buttery banget! Tempat duduk sofa empuk, betah berjam-jam ngerjain tugas kuliah di sini.' },
  { rating: 4, comment: 'Tempatnya aesthetic banget buat foto OOTD. Pelayanan cepat dan reservasi lewat SEATO lancar tanpa antre.' },
  { rating: 5, comment: 'Salah satu hidden gem terbaik di area ini! Suasana tenang, playlist lagu jazz santai, dan cold brew concentrate-nya mantap.' },
  { rating: 2, comment: 'Kemarin nunggu pesanan makanan agak lama hampir 35 menit karena kitchen lagi overload pas weekend. Tolong ditingkatkan ya.' },
  { rating: 5, comment: 'Smoking area indoor-nya ber-AC dan exhaust-nya kencang jadi tidak pengap sama sekali. Solusi banget buat yang mau ngopi sambil ngerokok.' }
];

const sampleKeywords = [
  'WFC Friendly', 'Smoking Indoor', 'Live Music', 'Colokan Banyak', 'Manual Brew',
  'Meeting Room', 'Kopi Susu Gula Aren', 'Croissant Almond', 'Pet Friendly', '24 Jam',
  'Single Origin', 'Rooftop Cafe', 'Matcha Latte', 'Aesthetic Spot', 'Cold Brew'
];

async function main() {
  console.log('🚀 Starting Massive Database Seeding (50 Merchants & 100 Users)...');

  // 1. Clean previous data
  console.log('🧹 Clearing old tables...');
  await prisma.merchantVisitorLog.deleteMany({});
  await prisma.merchantAiInsight.deleteMany({});
  await prisma.scrapedMarketData.deleteMany({});
  await prisma.merchantNotificationConfig.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.stream.deleteMany({});
  await prisma.promo.deleteMany({});
  await prisma.userFavorite.deleteMany({});
  await prisma.xPLog.deleteMany({});
  await prisma.userBadge.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.restaurantArea.deleteMany({});
  await prisma.restaurant.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Master Badges
  console.log('🎖️ Creating Master Badges...');
  const badges = await Promise.all([
    prisma.badge.create({ data: { name: 'First Check-in', description: 'Reservasi & check-in pertama di SEATO', iconUrl: '🎉', category: 'ACHIEVEMENT', requirement: '{"visits": 1}' } }),
    prisma.badge.create({ data: { name: 'Coffee Snob', description: 'Kunjungi 10+ artisan coffee shop', iconUrl: '☕', category: 'SPECIALIST', requirement: '{"cafeVisits": 10}' } }),
    prisma.badge.create({ data: { name: 'WFC Champion', description: 'Bekerja & WFC di 20+ cafe partner', iconUrl: '💻', category: 'LEVEL', requirement: '{"wfcVisits": 20}' } }),
    prisma.badge.create({ data: { name: 'Top Reviewer', description: 'Tulis 10+ ulasan detail & terpercaya', iconUrl: '⭐', category: 'ACHIEVEMENT', requirement: '{"reviews": 10}' } }),
    prisma.badge.create({ data: { name: 'VIP Explorer', description: 'Reservasi VIP / Meeting Room 5 kali', iconUrl: '👑', category: 'LEVEL', requirement: '{"vipBookings": 5}' } }),
    prisma.badge.create({ data: { name: 'Night Owl', description: 'Nongkrong di atas jam 22:00 sebanyak 8 kali', iconUrl: '🦉', category: 'SPECIALIST', requirement: '{"lateVisits": 8}' } })
  ]);

  // 3. Generate 100 Realistic Users with Long-Term History
  console.log('👥 Generating 100 Users with Historical Stats...');
  const users = [];
  const avatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  ];

  const specializations = [
    'Coffee Specialist', 'WFC & Remote Nomad', 'Pastry & Dessert Connoisseur', 
    'Food & Ambience Reviewer', 'Casual Explorer', 'VIP Meeting Booker', 'Matcha Enthusiast'
  ];

  for (let i = 1; i <= 100; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${fn} ${ln}`;
    const cleanEmail = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`;
    const initials = `${fn[0]}${ln[0]}`;
    
    // Simulate long-term usage (joined 3-12 months ago)
    const monthsAgo = Math.floor(Math.random() * 10) + 2;
    const createdAt = new Date();
    createdAt.setMonth(createdAt.getMonth() - monthsAgo);

    const level = Math.floor(Math.random() * 8) + 1; // Level 1 to 8
    const statsReservasi = Math.floor(Math.random() * 35) + 3;
    const statsUlasan = Math.floor(statsReservasi * (0.4 + Math.random() * 0.4));
    const statsFavorit = Math.floor(Math.random() * 15) + 2;
    const xpPoints = (statsReservasi * 100) + (statsUlasan * 50) + (level * 250);

    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        password: 'password123',
        initials,
        location: 'Jakarta',
        level,
        xpPoints,
        cafesVisited: Math.floor(statsReservasi * 0.8) + 2,
        bio: `Member aktif SEATO sejak ${createdAt.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}. ${specializations[i % specializations.length]}.`,
        avatarUrl: avatars[i % avatars.length],
        specialization: specializations[i % specializations.length],
        statsReservasi,
        statsUlasan,
        statsFavorit,
        createdAt
      }
    });
    users.push(user);

    // Assign badges based on activity
    if (statsReservasi >= 1) await prisma.userBadge.create({ data: { userId: user.id, badgeId: badges[0].id } });
    if (statsReservasi >= 10) await prisma.userBadge.create({ data: { userId: user.id, badgeId: badges[1].id } });
    if (statsReservasi >= 20) await prisma.userBadge.create({ data: { userId: user.id, badgeId: badges[2].id } });
    if (statsUlasan >= 5) await prisma.userBadge.create({ data: { userId: user.id, badgeId: badges[3].id } });
  }

  console.log(`✅ 100 Users & Badges Created.`);

  // 4. Generate 50 Rich Merchants & Restaurants
  console.log('🏪 Generating 50 Merchants & Restaurant Areas...');
  const restaurants = [];
  const restoImages = [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&q=80&w=800'
  ];

  for (let i = 1; i <= 50; i++) {
    const locGroup = cafeLocations[i % cafeLocations.length];
    const subArea = locGroup.areas[i % locGroup.areas.length];
    const concept = cafeConcepts[i % cafeConcepts.length];
    const adj = cafeAdjectives[i % cafeAdjectives.length];
    const restoName = i <= cafeConcepts.length ? `${concept.name} ${subArea}` : `${concept.name} ${adj} ${subArea}`;
    const slug = restoName.toLowerCase().replace(/[^a-z0-9]/g, '');

    const rating = parseFloat((4.2 + (Math.random() * 0.7)).toFixed(1)); // 4.2 - 4.9
    const reviewsCount = Math.floor(Math.random() * 450) + 45;
    const mentionsCount = Math.floor(reviewsCount * (1.8 + Math.random() * 1.5));

    // Simulate joined 6-18 months ago
    const restoCreatedAt = new Date();
    restoCreatedAt.setMonth(restoCreatedAt.getMonth() - (Math.floor(Math.random() * 12) + 6));

    const resto = await prisma.restaurant.create({
      data: {
        name: restoName,
        address: `Jl. ${subArea} Raya No. ${Math.floor(Math.random() * 88) + 1}`,
        city: locGroup.city,
        type: concept.type,
        status: Math.random() > 0.3 ? 'Tersedia' : 'Ramai',
        rating,
        reviewsCount,
        latitude: -6.2000 + (Math.random() * 0.1 - 0.05),
        longitude: 106.8166 + (Math.random() * 0.1 - 0.05),
        tags: JSON.stringify(concept.tags),
        isTrending: Math.random() > 0.6,
        isRecommended: Math.random() > 0.5,
        mentionsCount,
        loginEmail: `admin@${slug || 'resto' + i}.com`,
        loginPassword: 'password123',
        imageUrl: restoImages[i % restoImages.length],
        createdAt: restoCreatedAt
      }
    });
    restaurants.push(resto);

    // Create 2-4 Restaurant Areas per merchant
    await prisma.restaurantArea.create({
      data: {
        restaurantId: resto.id,
        name: 'Indoor AC & WFC Zone',
        total: 16,
        seatoAllocated: 8,
        seatoOccupied: Math.floor(Math.random() * 4) + 1,
        walkInOccupied: Math.floor(Math.random() * 6) + 2,
        tableAssignments: JSON.stringify(['T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06', 'T-07', 'T-08'])
      }
    });

    await prisma.restaurantArea.create({
      data: {
        restaurantId: resto.id,
        name: 'Outdoor Garden & Smoking Area',
        total: 12,
        seatoAllocated: 6,
        seatoOccupied: Math.floor(Math.random() * 3) + 1,
        walkInOccupied: Math.floor(Math.random() * 5) + 1,
        tableAssignments: JSON.stringify(['OUT-01', 'OUT-02', 'OUT-03', 'OUT-04', 'OUT-05', 'OUT-06'])
      }
    });

    if (i % 2 === 0) {
      await prisma.restaurantArea.create({
        data: {
          restaurantId: resto.id,
          name: 'Private VIP Meeting Room',
          total: 2,
          seatoAllocated: 2,
          seatoOccupied: Math.random() > 0.5 ? 1 : 0,
          walkInOccupied: 0,
          tableAssignments: JSON.stringify(['VIP-01', 'VIP-02'])
        }
      });
    }

    // Create Merchant Notification Config
    await prisma.merchantNotificationConfig.create({
      data: {
        restaurantId: resto.id,
        emailRecipient: `owner@${slug || 'merchant' + i}.com`,
        waRecipient: `+6281${Math.floor(100000000 + Math.random() * 900000000)}`,
        enableEmail: true,
        enableWA: Math.random() > 0.5,
        frequency: 'WEEKLY'
      }
    });

    // Create 1-2 Promos per merchant
    await prisma.promo.create({
      data: {
        restaurantId: resto.id,
        title: `Special Treat ${resto.name.split(' ')[0]} - Diskon 20%`,
        subtitle: 'Berlaku reservasi Senin - Kamis jam 13:00 - 17:00',
        imageUrl: restoImages[(i + 1) % restoImages.length],
        color: '#10B981',
        type: 'COLLAB',
        code: `PROMO${i}OFF`
      }
    });
  }

  console.log(`✅ 50 Merchants & Areas Created.`);

  // 5. Generate 600+ Historical Reservations & Reviews
  console.log('📅 Generating 600+ Historical & Active Reservations with Realistic Reviews...');
  const reservationStatuses = ['Selesai', 'Selesai', 'Selesai', 'Selesai', 'Confirmed', 'Dibatalkan'];
  const allReservations = [];
  const allReviews = [];

  const now = new Date();

  for (let i = 0; i < 650; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const resto = restaurants[Math.floor(Math.random() * restaurants.length)];
    const status = reservationStatuses[Math.floor(Math.random() * reservationStatuses.length)];

    // Spread across past 90 days
    const dayOffset = Math.floor(Math.random() * 90);
    const resDateObj = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    const dateStr = resDateObj.toISOString().split('T')[0];
    const timeStr = `${Math.floor(Math.random() * 11 + 10)}:00`; // 10:00 - 21:00
    const guests = Math.floor(Math.random() * 5) + 1;
    const amount = guests * (45000 + Math.floor(Math.random() * 60000));

    const res = await prisma.reservation.create({
      data: {
        userId: user.id,
        restaurantId: resto.id,
        status,
        date: dateStr,
        time: timeStr,
        guests,
        tableType: 'Indoor AC & WFC Zone',
        assignedTable: `T-0${(i % 8) + 1}`,
        invoiceId: `INV-${dateStr.replace(/-/g, '')}-${String(i).padStart(4, '0')}`,
        totalAmount: amount,
        paymentStatus: status === 'Dibatalkan' ? 'Unpaid' : 'Paid',
        cancelReason: status === 'Dibatalkan' ? 'Urusan mendadak / ganti jadwal' : null,
        cancelledBy: status === 'Dibatalkan' ? 'user' : null,
        createdAt: resDateObj
      }
    });
    allReservations.push(res);

    // If reservation is 'Selesai', create a realistic customer review (70% chance)
    if (status === 'Selesai' && Math.random() > 0.3) {
      const template = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
      await prisma.review.create({
        data: {
          userId: user.id,
          restaurantId: resto.id,
          reservationId: res.id,
          rating: template.rating,
          comment: template.comment,
          createdAt: new Date(resDateObj.getTime() + 2 * 60 * 60 * 1000) // reviewed 2 hours after
        }
      });
    }
  }

  console.log(`✅ 650 Reservations & 300+ Reviews Generated.`);

  // 6. Generate 2,500+ Visitor Telemetry Logs
  console.log('📊 Generating 2,500+ Visitor Telemetry & Search Logs...');
  const logs = [];
  const sources = ['SEARCH', 'HOME_TRENDING', 'NEARBY', 'DIRECT', 'PROMO_BANNER'];
  const devices = ['iOS', 'Android', 'Web'];
  const actions = ['VIEW_PAGE', 'VIEW_PAGE', 'CLICK_MENU', 'CLICK_RESERVE', 'VIEW_PROMO', 'SEARCH_KEYWORD'];

  for (let i = 0; i < 2500; i++) {
    const dayOffset = Math.floor(Math.random() * 60);
    const hour = Math.floor(9 + Math.random() * 14); // 09:00 - 23:00
    const logDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    logDate.setHours(hour, Math.floor(Math.random() * 60));

    logs.push({
      restaurantId: restaurants[Math.floor(Math.random() * restaurants.length)].id,
      userId: Math.random() > 0.4 ? users[Math.floor(Math.random() * users.length)].id : null,
      action: actions[Math.floor(Math.random() * actions.length)],
      keyword: sampleKeywords[Math.floor(Math.random() * sampleKeywords.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      createdAt: logDate
    });
  }

  // Batch insert logs
  await prisma.merchantVisitorLog.createMany({ data: logs });
  console.log(`✅ 2,500+ Visitor Telemetry Logs Created.`);

  // 7. Generate Pre-computed AI Business Insights for Top Merchants
  console.log('🧠 Generating AI Insights for Top 10 Merchants...');
  for (let i = 0; i < 10; i++) {
    const r = restaurants[i];
    await prisma.merchantAiInsight.create({
      data: {
        restaurantId: r.id,
        period: 'WEEKLY',
        sentimentScore: parseFloat((4.5 + Math.random() * 0.4).toFixed(1)),
        summaryText: `Performa ${r.name} bulan ini menunjukkan tren pertumbuhan yang solid dengan peningkatan traffic 32% dari pencarian "WFC Friendly" dan "Specialty Coffee". Rating kepuasan pelanggan stabil di atas 4.6/5.0 dengan feedback positif terkait kecepatan koneksi internet dan kualitas rasa minuman.`,
        peakHoursJson: {
          busiestDay: 'Jumat & Sabtu',
          peakTime: '18:30 - 21:30',
          quietDay: 'Selasa & Rabu',
          quietTime: '13:00 - 15:30'
        },
        topKeywords: ['WFC Friendly (44%)', 'Colokan Banyak (26%)', 'Smoking Indoor (18%)', 'Live Music (12%)'],
        actionItems: [
          '🚀 Promo Happy Hour Selasa: Luncurkan paket bundle Coffee + Pastry diskon 20% jam 13:00 - 16:00.',
          '⚡ Optimalisasi Fasilitas WFC: Sediakan kabel ekstensi tambahan di area indoor untuk mengakomodasi lonjakan pekerja remote.',
          '🚗 Manajemen Parkir Weekend: Sediakan kerjasama valet atau koordinasi juru parkir di jam padat Jumat malam.'
        ],
        churnRiskCount: Math.floor(Math.random() * 12) + 4,
        rawMetrics: {
          totalViews: Math.floor(Math.random() * 3000) + 1200,
          profileVisits: Math.floor(Math.random() * 800) + 350,
          reservationsCount: Math.floor(Math.random() * 180) + 65,
          actualArrivals: Math.floor(Math.random() * 150) + 50,
          conversionRate: '4.8%',
          estGMV: (Math.floor(Math.random() * 25) + 15) * 1000000
        }
      }
    });
  }

  // 8. Generate Community Streams (Social Feed)
  console.log('📱 Generating Community Streams & Feeds...');
  for (let i = 0; i < 30; i++) {
    const u = users[Math.floor(Math.random() * users.length)];
    const r = restaurants[Math.floor(Math.random() * restaurants.length)];
    await prisma.stream.create({
      data: {
        authorName: u.name,
        authorAvatar: u.avatarUrl,
        type: 'USER_REVIEW',
        restaurantId: r.id,
        rating: 5,
        content: `Nongkrong & WFC seharian di ${r.name}. Tempatnya cozy parah, WiFi stabil banget buat Zoom call tanpa buffering, dan kopinya mantep pol! 🔥☕💻`,
        likes: Math.floor(Math.random() * 45) + 5
      }
    });
  }

  console.log('🎉 MASSIVE DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log(`Summary:
  - 100 Real Users with Level & XP
  - 50 Partner Restaurants with Areas & Logins
  - 650 Historical Reservations
  - 300+ Realistic Customer Reviews
  - 2,500+ Visitor Telemetry Logs
  - AI Insights & Community Streams
  `);
}

main()
  .catch((e) => {
    console.error('❌ Massive seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
