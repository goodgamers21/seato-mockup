/**
 * DTOs for Merchant AI Insight and Performance Reports
 */

export class GenerateInsightRequestDto {
  constructor({ restaurantId, period = 'WEEKLY' }) {
    if (!restaurantId) throw new Error('restaurantId is required');
    this.restaurantId = restaurantId;
    this.period = period; // 'DAILY' | 'WEEKLY' | 'MANUAL'
  }
}

export class SendReportEmailDto {
  constructor({ restaurantId, recipientEmail, insightId }) {
    if (!restaurantId) throw new Error('restaurantId is required');
    this.restaurantId = restaurantId;
    this.recipientEmail = recipientEmail || null;
    this.insightId = insightId || null;
  }
}

export class InsightResponseDto {
  static format(insight) {
    if (!insight) return null;
    return {
      id: insight.id,
      restaurantId: insight.restaurantId,
      period: insight.period,
      summaryText: insight.summaryText,
      sentimentScore: insight.sentimentScore,
      peakHours: typeof insight.peakHoursJson === 'string' ? JSON.parse(insight.peakHoursJson) : insight.peakHoursJson,
      topKeywords: typeof insight.topKeywords === 'string' ? JSON.parse(insight.topKeywords) : insight.topKeywords,
      actionItems: typeof insight.actionItems === 'string' ? JSON.parse(insight.actionItems) : insight.actionItems,
      churnRiskCount: insight.churnRiskCount,
      rawMetrics: typeof insight.rawMetrics === 'string' ? JSON.parse(insight.rawMetrics) : insight.rawMetrics,
      createdAt: insight.createdAt
    };
  }
}
