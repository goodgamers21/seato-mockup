import { prisma } from '../../lib/prisma.js';

export class VisitorRepository {
  static async logActivity(data) {
    return prisma.merchantVisitorLog.create({
      data: {
        restaurantId: data.restaurantId,
        userId: data.userId || null,
        action: data.action || 'VIEW_PAGE',
        keyword: data.keyword || null,
        source: data.source || 'DIRECT',
        device: data.device || 'Web'
      }
    });
  }

  static async getVisitorLogsSince(restaurantId, sinceDate) {
    return prisma.merchantVisitorLog.findMany({
      where: {
        restaurantId,
        createdAt: { gte: sinceDate }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async countVisitorsByRestaurant(restaurantId, sinceDate) {
    return prisma.merchantVisitorLog.count({
      where: {
        restaurantId,
        createdAt: { gte: sinceDate }
      }
    });
  }
}
