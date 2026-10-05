import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function showDb() {
  console.log('=== USERS ===');
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, password: true }
  });
  console.log(JSON.stringify(users, null, 2));

  console.log('=== RESTAURANTS ===');
  const restos = await prisma.restaurant.findMany({
    select: { id: true, name: true, loginEmail: true, loginPassword: true }
  });
  console.log(JSON.stringify(restos, null, 2));

  console.log('=== COMMUNITIES ===');
  const comms = await prisma.community.findMany({
    include: { pic: { select: { id: true, name: true, email: true } } }
  });
  console.log(JSON.stringify(comms, null, 2));
}

showDb().finally(() => prisma.$disconnect());
