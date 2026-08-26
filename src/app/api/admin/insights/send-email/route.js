import { NextResponse } from 'next/server';
import { InsightService } from '../../../../../server/services/insightService';
import { SendReportEmailDto } from '../../../../../server/dtos/insight.dto';

export async function POST(request) {
  try {
    const body = await request.json();
    const dto = new SendReportEmailDto(body);

    const result = await InsightService.sendReportEmail({
      restaurantId: dto.restaurantId,
      recipientEmail: dto.recipientEmail
    });

    return NextResponse.json({
      success: true,
      message: `Laporan berhasil dikirim ke email: ${result.recipient}`,
      data: result
    });
  } catch (error) {
    console.error('Error sending report email:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
