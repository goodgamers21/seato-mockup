import { PrismaClient } from '@prisma/client';
import { CronJobs } from '../src/server/schedulers/cronJobs.js';

const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Starting Verification Tests for Community Events...');

  // 1. Check communities in DB
  const communities = await prisma.community.findMany({
    include: { pic: true, members: true, events: true }
  });
  console.log(`✅ Found ${communities.length} communities in database.`);
  communities.forEach(c => {
    console.log(`   - [${c.verificationStatus}] ${c.name} (PIC: ${c.pic.name}, Members: ${c.members.length}, Events: ${c.events.length})`);
  });

  // 2. Check events in DB
  const events = await prisma.communityEvent.findMany({
    include: { community: true, restaurant: true, rsvps: true }
  });
  console.log(`✅ Found ${events.length} community events in database.`);
  events.forEach(e => {
    console.log(`   - [${e.status}] "${e.title}" at ${e.restaurant.name} (${e.date} ${e.time}) | RSVP: ${e.currentRsvp}/${e.targetCapacity}`);
  });

  // 3. Test Cron: autoExpireCommunityRequests
  console.log('\n⏰ Testing autoExpireCommunityRequests cron...');
  const expireResult = await CronJobs.autoExpireCommunityRequests();
  console.log('   Result:', expireResult);

  // 4. Test Cron: updateEventLifecycle
  console.log('\n⏰ Testing updateEventLifecycle cron...');
  const lifecycleResult = await CronJobs.updateEventLifecycle();
  console.log('   Result:', lifecycleResult);

  console.log('\n🎉 Verification completed successfully!');
}

runTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
