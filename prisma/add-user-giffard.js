import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Checking/Adding user giffard@example.com in seato-mockup database...');

  const user = await prisma.user.upsert({
    where: { email: 'giffard@example.com' },
    update: {
      name: 'Giffard Alamsyah',
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
    },
    create: {
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

  console.log('✅ User successfully verified/created in database:', {
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password
  });

  // Link available badges if any exist
  const existingBadges = await prisma.badge.findMany();
  for (const b of existingBadges.slice(0, 3)) {
    await prisma.userBadge.upsert({
      where: {
        userId_badgeId: {
          userId: user.id,
          badgeId: b.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        badgeId: b.id
      }
    });
  }

  console.log('🎖️ Linked badges to Giffard');
}

main()
  .catch((e) => {
    console.error('❌ Error creating user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
