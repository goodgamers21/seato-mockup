import { NextResponse } from 'next/server';
import { CronJobs } from '../../../../server/schedulers/cronJobs';

export async function GET(request) {
  return handleCron(request);
}

export async function POST(request) {
  return handleCron(request);
}

async function handleCron(request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = await CronJobs.generateWeeklyAiDigestAndEmail();
    return NextResponse.json({ success: true, processedCount: results.length, results });
  } catch (error) {
    console.error('Error in generate-ai-digest cron:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
