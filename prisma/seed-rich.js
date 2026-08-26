import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Rich Database Seeding for SEATO AI...');

  // 1. Clear existing relations to prevent foreign key errors
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

  console.log('🧹 Cleaned existing tables.');

  // 2. Master Badges
  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        name: 'First Check-in',
        description: 'Melakukan reservasi dan check-in pertama di SEATO',
        iconUrl: '🎉',
        category: 'ACHIEVEMENT',
        requirement: JSON.stringify({ visits: 1 })
      }
    }),
    prisma.badge.create({
      data: {
        name: 'Coffee Snob',
        description: 'Mengunjungi lebih dari 5 coffee shop spesialis',
        iconUrl: '☕',
        category: 'SPECIALIST',
        requirement: JSON.stringify({ cafeVisits: 5 })
      }
    }),
    prisma.badge.create({
      data: {
        name: 'WFC Master',
        description: 'Nongkrong & WFC di 10+ cafe berbeda',
        iconUrl: '💻',
        category: 'LEVEL',
        requirement: JSON.stringify({ wfcVisits: 10 })
      }
    }),
    prisma.badge.create({
      data: {
        name: 'Top Reviewer',
        description: 'Menulis ulasan detail yang membantu pengunjung lain',
        iconUrl: '⭐',
        category: 'ACHIEVEMENT',
        requirement: JSON.stringify({ reviews: 5 })
      }
    })
  ]);

  // 3. Rich Users
  const userBagus = await prisma.user.create({
    data: {
      name: 'Bagus Pratama',
      email: 'bagus@example.com',
      password: 'password123',
      initials: 'BP',
      location: 'Jakarta Selatan',
      latitude: -6.2297,
      longitude: 106.8094,
      level: 4,
      xpPoints: 1250,
      cafesVisited: 14,
      bio: 'Coffee enthusiast & remote software engineer. Always looking for good WFC spots with fast WiFi.',
      specialization: 'Coffee & WFC Specialist',
      statsReservasi: 12,
      statsUlasan: 8,
      statsFavorit: 5
    }
  });

  const userGiffard = await prisma.user.create({
    data: {
      name: 'Giffard Alamsyah',
      email: 'giffard@example.com',
      password: 'password123',
      initials: 'GA',
      location: 'Jakarta Pusat',
      latitude: -6.1823,
      longitude: 106.8286,
      level: 3,
      xpPoints: 850,
      cafesVisited: 9,
      bio: 'Foodie explorer. Suka hunting cafe aesthetic dan live music.',
      specialization: 'Food & Ambience Reviewer',
      statsReservasi: 9,
      statsUlasan: 6,
      statsFavorit: 4
    }
  });

  const userDandy = await prisma.user.create({
    data: {
      name: 'Dandy Putra',
      email: 'dandy@example.com',
      password: 'password123',
      initials: 'DP',
      location: 'Jakarta Utara',
      latitude: -6.1554,
      longitude: 106.8837,
      level: 2,
      xpPoints: 420,
      cafesVisited: 5,
      bio: 'Ngopi sore & weekend hangout enthusiast.',
      specialization: 'Casual Explorer',
      statsReservasi: 5,
      statsUlasan: 3,
      statsFavorit: 2
    }
  });

  const userArif = await prisma.user.create({
    data: {
      name: 'Arif Maulana',
      email: 'arif@example.com',
      password: 'password123',
      initials: 'AM',
      location: 'Tangerang Selatan',
      latitude: -6.2800,
      longitude: 106.7100,
      level: 5,
      xpPoints: 2100,
      cafesVisited: 22,
      bio: 'Founder of Jakarta Coffee Community. Taste tester & bean connoisseur.',
      specialization: 'Master Coffee Taster',
      statsReservasi: 18,
      statsUlasan: 15,
      statsFavorit: 9
    }
  });

  // Assign Badges
  await prisma.userBadge.create({ data: { userId: userBagus.id, badgeId: badges[0].id } });
  await prisma.userBadge.create({ data: { userId: userBagus.id, badgeId: badges[1].id } });
  await prisma.userBadge.create({ data: { userId: userBagus.id, badgeId: badges[2].id } });
  await prisma.userBadge.create({ data: { userId: userArif.id, badgeId: badges[0].id } });
  await prisma.userBadge.create({ data: { userId: userArif.id, badgeId: badges[3].id } });

  console.log('👤 Users & Badges created.');

  // 4. Rich Restaurants with Areas & Accounts
  const restoKopiSenja = await prisma.restaurant.create({
    data: {
      name: 'Kopi Senja Swasembada',
      address: 'Jl. Swasembada Timur No. 10, Tanjung Priok',
      city: 'Jakarta Utara',
      type: 'Cafe & Roastery',
      status: 'Tersedia',
      rating: 4.8,
      reviewsCount: 128,
      latitude: -6.1140,
      longitude: 106.8840,
      tags: JSON.stringify(['WFC Friendly', 'Smoking Indoor', 'Specialty Coffee', 'Live Music']),
      isTrending: true,
      isRecommended: true,
      mentionsCount: 340,
      loginEmail: 'admin@kopisenja.com',
      loginPassword: 'password123',
      imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800'
    }
  });

  const restoTitikTemu = await prisma.restaurant.create({
    data: {
      name: 'Titik Temu SCBD',
      address: 'Senopati Suites Ground Floor, SCBD Lot 8',
      city: 'Jakarta Selatan',
      type: 'Artisan Cafe',
      status: 'Ramai',
      rating: 4.9,
      reviewsCount: 215,
      latitude: -6.2270,
      longitude: 106.8080,
      tags: JSON.stringify(['WFC Friendly', 'Outdoor Garden', 'Pastry & Brunch', 'VIP Meeting']),
      isTrending: true,
      isRecommended: true,
      mentionsCount: 520,
      loginEmail: 'admin@titiktemu.com',
      loginPassword: 'password123',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'
    }
  });

  const restoTheHarbor = await prisma.restaurant.create({
    data: {
      name: 'The Harbor Fine Dining',
      address: 'Jl. R.E. Martadinata No. 5, Ancol',
      city: 'Jakarta Utara',
      type: 'Fine Dining & Lounge',
      status: 'Tersedia',
      rating: 4.7,
      reviewsCount: 89,
      latitude: -6.1200,
      longitude: 106.8750,
      tags: JSON.stringify(['Fine Dining', 'Rooftop View', 'Romantic Dinner', 'Cocktails']),
      isTrending: false,
      isRecommended: true,
      mentionsCount: 190,
      loginEmail: 'admin@theharbor.com',
      loginPassword: 'password123',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800'
    }
  });

  const restoPaws = await prisma.restaurant.create({
    data: {
      name: 'Paws & Coffee Kelapa Gading',
      address: 'Boulevard Raya Blok QA No. 12',
      city: 'Jakarta Utara',
      type: 'Pet Cafe',
      status: 'Tersedia',
      rating: 4.6,
      reviewsCount: 74,
      latitude: -6.1580,
      longitude: 106.9050,
      tags: JSON.stringify(['Pet Friendly', 'Outdoor', 'Kids Friendly', 'Dessert']),
      isTrending: false,
      isRecommended: false,
      mentionsCount: 110,
      loginEmail: 'admin@paws.com',
      loginPassword: 'password123',
      imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800'
    }
  });

  console.log('🏪 Restaurants created.');

  // 5. Restaurant Areas
  const areaIndoorSenja = await prisma.restaurantArea.create({
    data: {
      restaurantId: restoKopiSenja.id,
      name: 'Indoor WFC Area (AC & Colokan)',
      total: 15,
      seatoAllocated: 8,
      seatoOccupied: 3,
      walkInOccupied: 5,
      tableAssignments: JSON.stringify(['T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06', 'T-07', 'T-08'])
    }
  });

  const areaOutdoorSenja = await prisma.restaurantArea.create({
    data: {
      restaurantId: restoKopiSenja.id,
      name: 'Outdoor Smoking & Live Music Area',
      total: 12,
      seatoAllocated: 6,
      seatoOccupied: 2,
      walkInOccupied: 4,
      tableAssignments: JSON.stringify(['OUT-01', 'OUT-02', 'OUT-03', 'OUT-04', 'OUT-05', 'OUT-06'])
    }
  });

  const areaIndoorTitik = await prisma.restaurantArea.create({
    data: {
      restaurantId: restoTitikTemu.id,
      name: 'Main Lounge & Coffee Bar',
      total: 20,
      seatoAllocated: 10,
      seatoOccupied: 6,
      walkInOccupied: 4
    }
  });

  const areaVIPTitik = await prisma.restaurantArea.create({
    data: {
      restaurantId: restoTitikTemu.id,
      name: 'Private Meeting Room (Glass House)',
      total: 3,
      seatoAllocated: 2,
      seatoOccupied: 1,
      walkInOccupied: 0
    }
  });

  // 6. Notification Configs
  await prisma.merchantNotificationConfig.create({
    data: {
      restaurantId: restoKopiSenja.id,
      emailRecipient: 'owner@kopisenjaswasembada.id',
      waRecipient: '+6281234567890',
      enableEmail: true,
      enableWA: true,
      frequency: 'WEEKLY'
    }
  });

  await prisma.merchantNotificationConfig.create({
    data: {
      restaurantId: restoTitikTemu.id,
      emailRecipient: 'management@titiktemuscbd.com',
      waRecipient: '+6281987654321',
      enableEmail: true,
      enableWA: false,
      frequency: 'WEEKLY'
    }
  });

  // 7. Promos
  const promoSenja = await prisma.promo.create({
    data: {
      restaurantId: restoKopiSenja.id,
      title: 'Diskon 20% WFC Siang Hari',
      subtitle: 'Berlaku Senin - Kamis jam 13:00 - 17:00',
      imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800',
      color: '#10B981',
      type: 'COLLAB',
      code: 'SENJAWFC20'
    }
  });

  const promoGlobal = await prisma.promo.create({
    data: {
      title: 'SEATO Welcome Treat: Flat Diskon 30k',
      subtitle: 'Untuk reservasi meja pertama di semua resto rekanan',
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800',
      color: '#3B82F6',
      type: 'GLOBAL',
      code: 'SEATONEW'
    }
  });

  // 8. Historical & Active Reservations
  const reservationsData = [
    {
      userId: userBagus.id,
      restaurantId: restoKopiSenja.id,
      areaId: areaIndoorSenja.id,
      status: 'Selesai',
      date: '2026-08-20',
      time: '14:00',
      guests: 2,
      tableType: 'Indoor WFC Area (AC & Colokan)',
      assignedTable: 'T-03',
      invoiceId: 'INV-20260820-001',
      totalAmount: 95000,
      paymentStatus: 'Paid',
      promoId: promoSenja.id
    },
    {
      userId: userGiffard.id,
      restaurantId: restoKopiSenja.id,
      areaId: areaOutdoorSenja.id,
      status: 'Selesai',
      date: '2026-08-22',
      time: '19:30',
      guests: 4,
      tableType: 'Outdoor Smoking & Live Music Area',
      assignedTable: 'OUT-02',
      invoiceId: 'INV-20260822-004',
      totalAmount: 240000,
      paymentStatus: 'Paid'
    },
    {
      userId: userArif.id,
      restaurantId: restoKopiSenja.id,
      areaId: areaIndoorSenja.id,
      status: 'Selesai',
      date: '2026-08-23',
      time: '10:00',
      guests: 1,
      tableType: 'Indoor WFC Area (AC & Colokan)',
      assignedTable: 'T-01',
      invoiceId: 'INV-20260823-007',
      totalAmount: 65000,
      paymentStatus: 'Paid'
    },
    {
      userId: userDandy.id,
      restaurantId: restoKopiSenja.id,
      areaId: areaOutdoorSenja.id,
      status: 'Dibatalkan',
      date: '2026-08-24',
      time: '15:00',
      guests: 3,
      tableType: 'Outdoor Smoking & Live Music Area',
      cancelReason: 'Ada urusan mendadak',
      cancelledBy: 'user',
      invoiceId: 'INV-20260824-009',
      totalAmount: 110000,
      paymentStatus: 'Unpaid'
    },
    {
      userId: userBagus.id,
      restaurantId: restoKopiSenja.id,
      areaId: areaIndoorSenja.id,
      status: 'Confirmed',
      date: '2026-08-26',
      time: '18:00',
      guests: 2,
      tableType: 'Indoor WFC Area (AC & Colokan)',
      assignedTable: 'T-04',
      invoiceId: 'INV-20260826-015',
      totalAmount: 120000,
      paymentStatus: 'Paid'
    },
    {
      userId: userArif.id,
      restaurantId: restoTitikTemu.id,
      areaId: areaVIPTitik.id,
      status: 'Selesai',
      date: '2026-08-21',
      time: '16:00',
      guests: 6,
      tableType: 'Private Meeting Room (Glass House)',
      assignedTable: 'VIP-01',
      invoiceId: 'INV-20260821-002',
      totalAmount: 750000,
      paymentStatus: 'Paid'
    },
    {
      userId: userGiffard.id,
      restaurantId: restoTitikTemu.id,
      areaId: areaIndoorTitik.id,
      status: 'Confirmed',
      date: '2026-08-26',
      time: '19:00',
      guests: 2,
      tableType: 'Main Lounge & Coffee Bar',
      invoiceId: 'INV-20260826-018',
      totalAmount: 180000,
      paymentStatus: 'Paid'
    }
  ];

  const createdReservations = [];
  for (const r of reservationsData) {
    const res = await prisma.reservation.create({ data: r });
    createdReservations.push(res);
  }

  console.log(`📅 Created ${createdReservations.length} Reservations.`);

  // 9. Realistic Reviews (Rich context for AI Sentiment & NLP)
  await prisma.review.create({
    data: {
      userId: userBagus.id,
      restaurantId: restoKopiSenja.id,
      reservationId: createdReservations[0].id,
      rating: 5,
      comment: 'Tempat WFC paling juara di Jakut! WiFi kencang 85 Mbps, colokan di tiap meja ada, dan Americano blend Flores-nya clean banget. AC-nya dingin dan suasananya tenang banget pas siang hari.'
    }
  });

  await prisma.review.create({
    data: {
      userId: userGiffard.id,
      restaurantId: restoKopiSenja.id,
      reservationId: createdReservations[1].id,
      rating: 4,
      comment: 'Live music-nya asik banget pas Jumat malam! Tapi kalau bawa mobil parkirannya agak sempit ya, harus valet atau cari parkir di pinggir jalan. Mocktail dan cemilan tahu cabai garamnya enak.'
    }
  });

  await prisma.review.create({
    data: {
      userId: userArif.id,
      restaurantId: restoKopiSenja.id,
      reservationId: createdReservations[2].id,
      rating: 5,
      comment: 'Barista ramah dan paham kalibrasi espresso. Suhu susu pas untuk Flat White. Area outdoor nyaman untuk smoking tapi tidak mengganggu area indoor AC. Recommended!'
    }
  });

  await prisma.review.create({
    data: {
      userId: userArif.id,
      restaurantId: restoTitikTemu.id,
      reservationId: createdReservations[5].id,
      rating: 5,
      comment: 'VIP Glass House-nya sangat prestisius untuk meeting klien. Soundproofing bagus dan screen presentasi berfungsi lancar. Makanan pasta truffle-nya top tier.'
    }
  });

  console.log('💬 Created Realistic Customer Reviews.');

  // 10. Visitor Telemetry Logs (200+ logs for AI Traffic & Peak Hours analysis)
  const keywords = ['WFC Friendly', 'Smoking Indoor', 'Live Music', 'Colokan Banyak', 'Manual Brew', 'Meeting Spot', 'Kopi Susu Gula Aren', 'Croissant Enak'];
  const sources = ['SEARCH', 'HOME_TRENDING', 'NEARBY', 'DIRECT'];
  const devices = ['iOS', 'Android', 'Web'];
  const actions = ['VIEW_PAGE', 'VIEW_PAGE', 'CLICK_MENU', 'CLICK_RESERVE', 'VIEW_PROMO'];

  const logs = [];
  const now = new Date();

  for (let i = 0; i < 250; i++) {
    // Spread across the last 10 days and different peak hours (10:00 - 21:00)
    const dayOffset = Math.floor(Math.random() * 10);
    const hour = Math.floor(10 + Math.random() * 12);
    const logDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    logDate.setHours(hour, Math.floor(Math.random() * 60));

    logs.push({
      restaurantId: i % 3 === 0 ? restoTitikTemu.id : restoKopiSenja.id,
      userId: i % 4 === 0 ? userBagus.id : (i % 4 === 1 ? userGiffard.id : null),
      action: actions[Math.floor(Math.random() * actions.length)],
      keyword: keywords[Math.floor(Math.random() * keywords.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      createdAt: logDate
    });
  }

  await prisma.merchantVisitorLog.createMany({ data: logs });
  console.log(`📊 Generated ${logs.length} Visitor Telemetry Logs.`);

  // 11. Initial AI Business Insight (Pre-computed sample for immediate UI preview)
  await prisma.merchantAiInsight.create({
    data: {
      restaurantId: restoKopiSenja.id,
      period: 'WEEKLY',
      sentimentScore: 4.7,
      summaryText: 'Minggu ini performa toko sangat positif dengan lonjakan kunjungan 24% didorong oleh pencarian kata kunci "WFC Friendly" dan "Smoking Indoor". Kepuasan rasa kopi dan kecepatan WiFi dinilai sangat tinggi oleh pelanggan (sentimen 4.7/5.0). Namun, terdapat 3 komplain terkait ketersediaan lahan parkir saat live music Jumat malam dan okupansi di hari Selasa siang masih relatif rendah.',
      peakHoursJson: {
        busiestDay: 'Sabtu & Jumat',
        peakTime: '18:30 - 21:30',
        quietDay: 'Selasa',
        quietTime: '13:00 - 16:00'
      },
      topKeywords: ['WFC Friendly (42%)', 'Smoking Indoor (28%)', 'Live Music (18%)', 'Colokan Banyak (12%)'],
      actionItems: [
        '🚀 Luncurkan Promo "Happy Tuesday WFC": Berikan diskon pastry 20% setiap pembelian kopi di hari Selasa jam 13:00-16:00 untuk mendongkrak jam sepi.',
        '🚗 Fasilitasi Valet / Penunjuk Parkir: Sediakan kerjasama dengan juru parkir gedung sebelah khusus di Jumat & Sabtu malam.',
        '⚡ Perbanyak Stopkontak di Meja Pojok: 12% user mencari kata kunci "Colokan Banyak", pastikan area indoor terpenuhi.'
      ],
      churnRiskCount: 8,
      rawMetrics: {
        totalViews: 2450,
        profileVisits: 420,
        reservationsCount: 128,
        actualArrivals: 98,
        conversionRate: '3.9%',
        estGMV: 18450000
      }
    }
  });

  // 12. Scraped Market Data (Sample competitor insights for your AI friend)
  await prisma.scrapedMarketData.create({
    data: {
      restaurantId: restoKopiSenja.id,
      targetName: 'Kopi Kenangan Sunter & Fore Coffee Danau',
      platform: 'GOOGLE_MAPS',
      rating: 4.4,
      reviewCount: 450,
      scrapedData: {
        averageDrinkPrice: 28000,
        busiestHoursCompetitor: '12:00 - 14:00 (Makan siang kantor)',
        commonComplaints: ['Tempat duduk sedikit', 'Kurang cocok untuk laptopan lama'],
        competitiveAdvantage: 'Kopi Senja memiliki keunggulan area duduk luas dan smoking area indoor yang tidak dimiliki kompetitor sekitar.'
      }
    }
  });

  // 13. Community Streams
  await prisma.stream.create({
    data: {
      authorName: userBagus.name,
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      type: 'USER_REVIEW',
      restaurantId: restoKopiSenja.id,
      rating: 5,
      content: 'Baru kelar ngerjain project sambil ngopi di Kopi Senja Swasembada. Tempatnya adem, colokan banyak, dan kopinya mantap! Highly recommended buat yang mau WFC. ☕💻',
      likes: 14
    }
  });

  await prisma.stream.create({
    data: {
      authorName: restoKopiSenja.name,
      authorAvatar: restoKopiSenja.imageUrl,
      type: 'RESTO_PROMO',
      restaurantId: restoKopiSenja.id,
      content: 'Happy Friday! Malam ini ada Acoustic Live Music mulai jam 19:30. Jangan lupa booking meja via SEATO biar dapet tempat terbaik! 🎸✨',
      likes: 28
    }
  });

  console.log('✅ Rich Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
