import { prisma } from '../../lib/prisma.js';

export class ReservationRepository {
  static async getReservationsSince(restaurantId, sinceDate) {
    return prisma.reservation.findMany({
      where: {
        restaurantId,
        createdAt: { gte: sinceDate }
      },
      include: {
        user: true,
        promo: true,
        area: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async findPendingLateReservations() {
    return prisma.reservation.findMany({
      where: {
        status: 'Confirmed'
      },
      include: {
        restaurant: true,
        area: true
      }
    });
  }

  static async updateStatus(id, { status, cancelReason, cancelledBy }) {
    return prisma.reservation.update({
      where: { id },
      data: {
        status,
        ...(cancelReason ? { cancelReason } : {}),
        ...(cancelledBy ? { cancelledBy } : {})
      }
    });
  }
}
