import { prisma } from '../../lib/prisma.js';

export class RestaurantRepository {
  static async findById(id) {
    return prisma.restaurant.findUnique({
      where: { id },
      include: {
        areas: true,
        promos: true,
        notificationConfig: true
      }
    });
  }

  static async findAll() {
    return prisma.restaurant.findMany({
      include: {
        areas: true,
        notificationConfig: true
      }
    });
  }

  static async findByLoginEmail(email) {
    return prisma.restaurant.findUnique({
      where: { loginEmail: email }
    });
  }
}
