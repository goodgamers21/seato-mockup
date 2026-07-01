const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const user = await prisma.user.findFirst({
      include: { badges: true, xpLogs: true, favorites: true, reviews: true }
    });
    console.log(user);
  } catch (e) {
    console.error('Error with xpLogs:', e.message);
    try {
      const user2 = await prisma.user.findFirst({
        include: { badges: true, xPLogs: true, favorites: true, reviews: true }
      });
      console.log('Success with xPLogs', user2);
    } catch(e2) {
      console.error('Error with xPLogs:', e2.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

run();
