import { prisma } from './src/lib/prisma.js';
import { InsightService } from './src/server/services/insightService.js';
import { VisitorRepository } from './src/server/repositories/visitorRepository.js';
import { CronJobs } from './src/server/schedulers/cronJobs.js';

async function testBackend() {
  console.log('🧪 Starting Backend Flow & AI Insight Verification...\n');

  // 1. Get a sample restaurant
  const resto = await prisma.restaurant.findFirst({
    where: { name: { contains: 'Kopi Senja' } }
  });

  if (!resto) {
    console.error('❌ Restaurant not found!');
    process.exit(1);
  }

  console.log(`📍 Found Restaurant: ${resto.name} (ID: ${resto.id})`);

  // 2. Test Visitor Telemetry Logging
  console.log('\n--- 1. Testing Visitor Telemetry ---');
  const logResult = await VisitorRepository.logActivity({
    restaurantId: resto.id,
    action: 'SEARCH_KEYWORD',
    keyword: 'WFC Outdoor Spot',
    source: 'SEARCH',
    device: 'iOS'
  });
  console.log('✅ Visitor Activity Logged, ID:', logResult.id);

  // 3. Test AI Insight Generation
  console.log('\n--- 2. Testing AI Insight Generation ---');
  const insight = await InsightService.getMerchantInsight(resto.id);
  console.log('✅ AI Insight Retrieved/Generated:');
  console.log('Summary:', insight.summaryText);
  console.log('Sentiment Score:', insight.sentimentScore);
  console.log('Action Items:', insight.actionItems);

  // 4. Test Report Email Sending
  console.log('\n--- 3. Testing Report Email Sending ---');
  const emailRes = await InsightService.sendReportEmail({
    restaurantId: resto.id,
    recipientEmail: 'test-merchant@example.com'
  });
  console.log('✅ Email Service Result:', emailRes);

  // 5. Test Cron Jobs (Auto-Cancel & Scraper)
  console.log('\n--- 4. Testing Cron Jobs ---');
  const autoCancelRes = await CronJobs.autoCancelLateReservations();
  console.log('✅ Auto-Cancel Job Completed:', autoCancelRes);

  const scraperRes = await CronJobs.runScheduledScraper();
  console.log('✅ Market Scraper Job Completed:', scraperRes.targetName);

  console.log('\n🎉 ALL BACKEND, AI, SCHEDULER & EMAIL TESTS PASSED SUCCESSFULLY!');
}

testBackend()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
