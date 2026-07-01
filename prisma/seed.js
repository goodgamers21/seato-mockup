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

  console.log('Seeding restaurants...');

  // 2. Create Soto Kudus Menara
  const sotoMenara = await prisma.restaurant.create({
    data: {
      name: 'Soto Kudus Menara',
      address: 'Jl. Merdeka No. 12',
      city: 'Bandung',
      type: 'Indonesian',
      rating: 4.8,
      reviewsCount: 120,
      distance: '1.2 km',
      status: 'SUBSCRIBED',
      imageUrl: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      tags: JSON.stringify(['Indonesian', 'Soto', 'Halal', 'Family Friendly']),
      loginEmail: 'admin@sotomenara.com',
      loginPassword: 'password123',
      areas: {
        create: [
          { name: 'Indoor Area', total: 10, seatoAllocated: 4, seatoOccupied: 0, walkInOccupied: 0 },
          { name: 'Outdoor Area', total: 5, seatoAllocated: 2, seatoOccupied: 0, walkInOccupied: 0 }
        ]
      }
    }
  });

  // 3. Create Union Coffee Dago
  await prisma.restaurant.create({
    data: {
      name: 'Union Coffee Dago',
      address: 'Jl. Ir. H. Juanda No. 123',
      city: 'Bandung',
      type: 'Specialty Coffee',
      rating: 4.9,
      reviewsCount: 312,
      distance: '1.2km',
      status: 'VERIFIED_FREE',
      imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      tags: JSON.stringify(['WFC Friendly', 'Smoking Indoor', 'Outdoor Area', 'Family Friendly']),
      loginEmail: 'admin@uniondago.com',
      loginPassword: 'password123',
      areas: {
        create: [
          { name: 'Lantai 1 (Indoor)', total: 15, seatoAllocated: 5, seatoOccupied: 0, walkInOccupied: 0 },
          { name: 'Rooftop (Outdoor)', total: 10, seatoAllocated: 5, seatoOccupied: 0, walkInOccupied: 0 }
        ]
      }
    }
  });

  // 4. Create Kopi Senja
  await prisma.restaurant.create({
    data: {
      name: 'Kopi Senja',
      address: 'Jl. Riau No. 45',
      city: 'Bandung',
      type: 'Coffee Shop',
      rating: 4.6,
      reviewsCount: 342,
      distance: '0.8 km',
      status: 'UNCLAIMED',
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      tags: JSON.stringify(['WFC Friendly', 'Smoking Indoor', 'Outdoor Area', 'Family Friendly']),
      loginEmail: 'admin@kopisenja.com',
      loginPassword: 'password123',
      areas: {
        create: [
          { name: 'Main Room', total: 8, seatoAllocated: 2, seatoOccupied: 0, walkInOccupied: 0 },
          { name: 'Backyard', total: 12, seatoAllocated: 4, seatoOccupied: 0, walkInOccupied: 0 }
        ]
      }
    }
  });

  // 5. Create Warung 24 Jam
  await prisma.restaurant.create({
    data: {
      name: 'Warung 24 Jam Priok',
      address: 'Jl. Enggano Raya',
      city: 'Jakarta Utara',
      type: 'Warung',
      rating: 4.5,
      reviewsCount: 300,
      distance: '2.5 km',
      status: 'PENDING',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
      tags: JSON.stringify(['24 hours', 'late night', 'Smoking Indoor']),
      loginEmail: 'admin@warung24priok.com',
      loginPassword: 'password123',
      areas: {
        create: [
          { name: 'Lantai 1', total: 20, seatoAllocated: 10, seatoOccupied: 0, walkInOccupied: 0 }
        ]
      }
    }
  });

  // 6. Create Midnight Vibes Cafe
  await prisma.restaurant.create({
    data: {
      name: 'Midnight Vibes Cafe',
      address: 'Jl. Danau Sunter',
      city: 'Jakarta Utara',
      type: 'Cafe',
      rating: 4.8,
      reviewsCount: 210,
      distance: '3.1 km',
      status: 'SUBSCRIBED',
      imageUrl: 'https://images.unsplash.com/photo-1572116469696-ed1f49fa5eb9?auto=format&fit=crop&q=80&w=800',
      tags: JSON.stringify(['late night', 'Smoking Indoor']),
      loginEmail: 'admin@midnightvibes.com',
      loginPassword: 'password123',
      areas: {
        create: [
          { name: 'Indoor Area', total: 15, seatoAllocated: 5, seatoOccupied: 0, walkInOccupied: 0 },
          { name: 'Smoking Area', total: 10, seatoAllocated: 5, seatoOccupied: 0, walkInOccupied: 0 }
        ]
      }
    }
  });

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
