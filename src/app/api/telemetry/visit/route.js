import { NextResponse } from 'next/server';
import { VisitorRepository } from '../../../../server/repositories/visitorRepository';
import { LogVisitorActivityDto } from '../../../../server/dtos/telemetry.dto';

export async function POST(request) {
  try {
    const body = await request.json();
    const dto = new LogVisitorActivityDto(body);

    const log = await VisitorRepository.logActivity(dto);

    return NextResponse.json({
      success: true,
      logId: log.id
    });
  } catch (error) {
    console.error('Error logging visitor activity:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
