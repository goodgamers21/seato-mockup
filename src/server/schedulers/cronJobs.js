/**
 * Centralized Cron Jobs & Background Tasks
 * Used for both local running and Vercel Cron API endpoints.
 */

import { prisma } from '../../lib/prisma.js';
import { InsightService } from '../services/insightService.js';
import { MarketScraper } from '../ai/scraper.js';

export class CronJobs {
  /**
   * Job 1: Auto-cancel late confirmed reservations (> 15 mins late)
   */
  static async autoCancelLateReservations() {
    console.log('⏰ [CronJobs] Running auto-cancel check for late reservations...');
    const now = new Date();
    const confirmedReservations = await prisma.reservation.findMany({
      where: { status: 'Confirmed' },
      include: { restaurant: true }
    });

    const cancelledList = [];

    for (const res of confirmedReservations) {
      try {
        let timeStr = res.time;
        if (timeStr.includes('WIB')) timeStr = timeStr.replace('WIB', '').trim();
        const resDate = new Date(`${res.date}T${timeStr}:00+07:00`);

        if (!isNaN(resDate.getTime())) {
          const diffMins = (now.getTime() - resDate.getTime()) / (1000 * 60);

          if (diffMins > 15) {
            const updated = await prisma.reservation.update({
              where: { id: res.id },
              data: {
                status: 'Dibatalkan',
                cancelReason: 'Terlambat / No Show (Otomatis oleh Sistem)',
                cancelledBy: 'system'
              }
            });

            // Free up seatoOccupied on restaurant area
            if (res.areaId) {
              const area = await prisma.restaurantArea.findUnique({ where: { id: res.areaId } });
              if (area && area.seatoOccupied > 0) {
                await prisma.restaurantArea.update({
                  where: { id: area.id },
                  data: { seatoOccupied: area.seatoOccupied - 1 }
                });
              }
            }

            cancelledList.push(updated.id);
          }
        }
      } catch (err) {
        console.error('Error processing reservation auto-cancel:', err);
      }
    }

    console.log(`✅ [CronJobs] Auto-cancel done. Cancelled ${cancelledList.length} late reservations.`);
    return { cancelledCount: cancelledList.length, cancelledIds: cancelledList };
  }

  /**
   * Job 2: Run Market Scraper
   */
  static async runScheduledScraper() {
    console.log('⏰ [CronJobs] Running scheduled market & competitor scraper...');
    return MarketScraper.runScraper({
      targetQuery: 'Coffee Shop Jakarta Selatan WFC',
      platform: 'GOOGLE_MAPS'
    });
  }

  /**
   * Job 3: Generate Weekly AI Digest & Email for all active restaurants
   */
  static async generateWeeklyAiDigestAndEmail() {
    console.log('⏰ [CronJobs] Generating weekly AI digests and sending emails...');
    const restaurants = await prisma.restaurant.findMany({
      include: { notificationConfig: true }
    });

    const results = [];

    for (const resto of restaurants) {
      try {
        const insight = await InsightService.generateInsightForRestaurant(resto.id, 'WEEKLY');

        if (resto.notificationConfig?.enableEmail) {
          const emailRes = await InsightService.sendReportEmail({
            restaurantId: resto.id,
            recipientEmail: resto.notificationConfig.emailRecipient
          });
          results.push({ restaurantId: resto.id, insightId: insight.id, email: emailRes });
        } else {
          results.push({ restaurantId: resto.id, insightId: insight.id, email: 'disabled' });
        }
      } catch (err) {
        console.error(`Failed to process weekly digest for ${resto.name}:`, err);
      }
    }

    console.log(`✅ [CronJobs] Weekly digest completed for ${results.length} restaurants.`);
    return results;
  }
}
