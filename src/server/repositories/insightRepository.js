import { prisma } from '../../lib/prisma.js';

export class InsightRepository {
  static async getLatestByRestaurantId(restaurantId) {
    return prisma.merchantAiInsight.findFirst({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getById(id) {
    return prisma.merchantAiInsight.findUnique({
      where: { id },
      include: { restaurant: true }
    });
  }

  static async createInsight(data) {
    return prisma.merchantAiInsight.create({
      data: {
        restaurantId: data.restaurantId,
        period: data.period || 'WEEKLY',
        summaryText: data.summaryText,
        sentimentScore: data.sentimentScore ?? null,
        peakHoursJson: data.peakHoursJson ?? {},
        topKeywords: data.topKeywords ?? [],
        actionItems: data.actionItems ?? [],
        churnRiskCount: data.churnRiskCount ?? 0,
        rawMetrics: data.rawMetrics ?? {}
      }
    });
  }

  static async getNotificationConfig(restaurantId) {
    return prisma.merchantNotificationConfig.findUnique({
      where: { restaurantId }
    });
  }
}
