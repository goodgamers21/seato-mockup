import { NextResponse } from 'next/server';
import { InsightService } from '../../../../server/services/insightService';
import { InsightResponseDto } from '../../../../server/dtos/insight.dto';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json({ error: 'restaurantId is required' }, { status: 400 });
    }

    const insight = await InsightService.getMerchantInsight(restaurantId);
    return NextResponse.json({
      success: true,
      data: InsightResponseDto.format(insight)
    });
  } catch (error) {
    console.error('Error fetching merchant insight:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
