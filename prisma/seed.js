import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Delete all existing restaurants (and cascaded data if any)
  await prisma.reservation.deleteMany();
  await prisma.promo.deleteMany();
  await prisma.restaurantArea.deleteMany();
  await prisma.restaurant.deleteMany();

  // 0. Delete Users
  await prisma.user.deleteMany();

  console.log('Seeding Users...');
  
  // Create Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Bagus Aji',
      email: 'bagus@example.com',
      password: 'password123',
      initials: 'BA',
      location: 'Jakarta',
      statsReservasi: 12,
      statsUlasan: 5,
      statsFavorit: 8
    }
  });
 
  const user2 = await prisma.user.create({
    data: {
      name: 'Sarah Rahman',
      email: 'sarah@example.com',
      password: 'password123',
      initials: 'SR',
      location: 'Bandung',
      statsReservasi: 3,
      statsUlasan: 1,
      statsFavorit: 4
    }
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Giffard',
      email: 'giffard@example.com',
      password: 'password123',
      initials: 'GF',
      location: 'Bandung',
      statsReservasi: 5,
      statsUlasan: 2,
      statsFavorit: 3
    }
  });

  const user4 = await prisma.user.create({
    data: {
      name: 'Dandy',
      email: 'dandy@example.com',
      password: 'password123',
      initials: 'DN',
      location: 'Jakarta',
      statsReservasi: 8,
      statsUlasan: 4,
      statsFavorit: 6
    }
  });

  const user5 = await prisma.user.create({
    data: {
      name: 'Arif',
      email: 'arif@example.com',
      password: 'password123',
      initials: 'AR',
      location: 'Jakarta',
      statsReservasi: 15,
      statsUlasan: 10,
      statsFavorit: 12
    }
  });

  console.log('Seeding bulk restaurants...');

  const restaurantsData = [
    // --- BANDUNG ---
    {
      name: 'Soto Kudus Menara', address: 'Jl. Merdeka No. 12', city: 'Bandung',
      latitude: -6.9147, longitude: 107.6098, type: 'Indonesian', rating: 4.8, reviewsCount: 120,
      distance: '1.2 km', status: 'SUBSCRIBED',
      imageUrl: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      tags: ['Indonesian', 'Soto', 'Halal', 'Family Friendly'], loginEmail: 'admin@sotomenara.com'
    },
    {
      name: 'Union Coffee Dago', address: 'Jl. Ir. H. Juanda No. 123', city: 'Bandung',
      latitude: -6.8920, longitude: 107.6150, type: 'Specialty Coffee', rating: 4.9, reviewsCount: 312,
      distance: '1.2km', status: 'VERIFIED_FREE',
      imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      tags: ['WFC Friendly', 'Smoking Indoor', 'Outdoor Area', 'Family Friendly'], loginEmail: 'admin@uniondago.com'
    },
    {
      name: 'Kopi Senja', address: 'Jl. Riau No. 45', city: 'Bandung',
      latitude: -6.9083, longitude: 107.6253, type: 'Coffee Shop', rating: 4.6, reviewsCount: 342,
      distance: '0.8 km', status: 'UNCLAIMED',
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      tags: ['WFC Friendly', 'Smoking Indoor', 'Outdoor Area'], loginEmail: 'admin@kopisenja.com'
    },
    {
      name: 'Braga Art Cafe', address: 'Jl. Braga No. 68', city: 'Bandung',
      latitude: -6.9175, longitude: 107.6090, type: 'Cafe & Resto', rating: 4.7, reviewsCount: 450,
      distance: '2.1 km', status: 'SUBSCRIBED',
      imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
      tags: ['Aesthetic', 'Vintage', 'Western'], loginEmail: 'admin@bragaart.com'
    },
    {
      name: 'Ciumbuleuit Dine', address: 'Jl. Ciumbuleuit No. 100', city: 'Bandung',
      latitude: -6.8774, longitude: 107.6053, type: 'Fine Dining', rating: 4.9, reviewsCount: 210,
      distance: '5.2 km', status: 'PENDING',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      tags: ['Romantic', 'Fine Dining', 'City View'], loginEmail: 'admin@ciumbuleuitdine.com'
    },

    // --- JAKARTA (PRIOK & AROUND BAGUS/ARIF/DANDY) ---
    {
      name: 'Warung 24 Jam Priok', address: 'Jl. Enggano Raya', city: 'Jakarta Utara',
      latitude: -6.1154, longitude: 106.8837, type: 'Warung', rating: 4.5, reviewsCount: 300,
      distance: '0.5 km', status: 'PENDING',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
      tags: ['24 hours', 'late night', 'Smoking Indoor'], loginEmail: 'admin@warung24priok.com'
    },
    {
      name: 'Midnight Vibes Cafe', address: 'Jl. Danau Sunter', city: 'Jakarta Utara',
      latitude: -6.1300, longitude: 106.8900, type: 'Cafe', rating: 4.8, reviewsCount: 210,
      distance: '1.5 km', status: 'SUBSCRIBED',
      imageUrl: 'https://images.unsplash.com/photo-1572116469696-ed1f49fa5eb9?auto=format&fit=crop&q=80&w=800',
      tags: ['late night', 'Smoking Indoor'], loginEmail: 'admin@midnightvibes.com'
    },
    {
      name: 'Seafood Ayu Kelapa Gading', address: 'Jl. Boulevard Raya', city: 'Jakarta Utara',
      latitude: -6.1550, longitude: 106.9000, type: 'Seafood', rating: 4.6, reviewsCount: 500,
      distance: '4.0 km', status: 'VERIFIED_FREE',
      imageUrl: 'https://images.unsplash.com/photo-1615822396181-a7b6cfbd5db8?auto=format&fit=crop&w=800&q=80',
      tags: ['Seafood', 'Family Friendly', 'Street Food'], loginEmail: 'admin@seafoodayu.com'
    },
    {
      name: 'PIK Dimsum House', address: 'Pantai Indah Kapuk', city: 'Jakarta Utara',
      latitude: -6.1100, longitude: 106.7400, type: 'Chinese', rating: 4.9, reviewsCount: 890,
      distance: '12.0 km', status: 'SUBSCRIBED',
      imageUrl: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&q=80',
      tags: ['Dimsum', 'Halal', 'Family Friendly'], loginEmail: 'admin@pikdimsum.com'
    },
    {
      name: 'Kemang Coffee Space', address: 'Jl. Kemang Raya No. 10', city: 'Jakarta Selatan',
      latitude: -6.2550, longitude: 106.8140, type: 'Coffee Shop', rating: 4.7, reviewsCount: 420,
      distance: '15.0 km', status: 'SUBSCRIBED',
      imageUrl: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=800&q=80',
      tags: ['WFC Friendly', 'Aesthetic', 'Pastry'], loginEmail: 'admin@kemangcoffee.com'
    }
  ];

  let sotoMenara = null;

  for (const resto of restaurantsData) {
    const createdResto = await prisma.restaurant.create({
      data: {
        name: resto.name,
        address: resto.address,
        city: resto.city,
        latitude: resto.latitude,
        longitude: resto.longitude,
        type: resto.type,
        rating: resto.rating,
        reviewsCount: resto.reviewsCount,
        distance: resto.distance,
        status: resto.status,
        imageUrl: resto.imageUrl,
        tags: JSON.stringify(resto.tags),
        loginEmail: resto.loginEmail,
        loginPassword: 'password123',
        areas: {
          create: [
            { name: 'Indoor Area', total: 15, seatoAllocated: 5, seatoOccupied: 0, walkInOccupied: 0 },
            { name: 'Outdoor Area', total: 10, seatoAllocated: 3, seatoOccupied: 0, walkInOccupied: 0 }
          ]
        }
      }
    });
    
    if (resto.name === 'Soto Kudus Menara') {
      sotoMenara = createdResto;
    }
  }

  // Get restaurants for relation (handled above)
  // 5. Create Global Promo
  await prisma.promo.create({
    data: {
      title: 'Diskon Akhir Pekan',
      subtitle: 'Nikmati diskon s.d 50% untuk reservasi akhir pekan ini!',
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      color: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
      type: 'GLOBAL'
    }
  });

  // 6. Create Collab Promo for Soto Kudus Menara
  if (sotoMenara) {
    await prisma.promo.create({
      data: {
        title: 'Gratis Es Teh Manis',
        subtitle: 'Khusus reservasi via Seato. Tunjukkan kode promo saat kedatangan.',
        imageUrl: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        type: 'COLLAB',
        code: 'SEATO-SOTO',
        restaurantId: sotoMenara.id
      }
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
