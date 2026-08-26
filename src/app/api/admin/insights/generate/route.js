import { NextResponse } from 'next/server';
import { InsightService } from '../../../../../server/services/insightService';
import { InsightResponseDto, GenerateInsightRequestDto } from '../../../../../server/dtos/insight.dto';

export async function POST(request) {
  try {
    const body = await request.json();
    const dto = new GenerateInsightRequestDto(body);

    const insight = await InsightService.generateInsightForRestaurant(dto.restaurantId, dto.period);

    return NextResponse.json({
      success: true,
      message: 'AI Insight generated successfully',
      data: InsightResponseDto.format(insight)
    });
  } catch (error) {
    console.error('Error generating AI insight:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
