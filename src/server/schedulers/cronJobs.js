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

  /**
   * Job 4: Auto-expire pending community event requests (> 48h OR <= H-2)
   */
  static async autoExpireCommunityRequests() {
    console.log('⏰ [CronJobs] Checking pending community events to auto-expire...');
    const now = new Date();
    const pendingEvents = await prisma.communityEvent.findMany({
      where: { status: 'PENDING' }
    });

    const expiredIds = [];

    for (const evt of pendingEvents) {
      try {
        const createdTime = new Date(evt.createdAt).getTime();
        const diffHours = (now.getTime() - createdTime) / (1000 * 60 * 60);

        // Check if event date is <= H-2
        const eventDateObj = new Date(`${evt.date}T00:00:00+07:00`);
        const daysUntilEvent = (eventDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

        if (diffHours >= 48 || daysUntilEvent <= 2) {
          await prisma.communityEvent.update({
            where: { id: evt.id },
            data: { status: 'EXPIRED' }
          });
          expiredIds.push(evt.id);
        }
      } catch (err) {
        console.error(`Error auto-expiring event ${evt.id}:`, err);
      }
    }

    console.log(`✅ [CronJobs] Auto-expire done. Expired ${expiredIds.length} events.`);
    return { expiredCount: expiredIds.length, expiredIds };
  }

  /**
   * Job 5: Update event lifecycle (APPROVED -> LIVE -> COMPLETED)
   */
  static async updateEventLifecycle() {
    console.log('⏰ [CronJobs] Updating community events lifecycle...');
    const now = new Date();
    const activeEvents = await prisma.communityEvent.findMany({
      where: {
        status: { in: ['APPROVED', 'LIVE'] }
      }
    });

    const results = { transitionedToLive: 0, transitionedToCompleted: 0 };

    for (const evt of activeEvents) {
      try {
        // time format: "06:00 - 08:30" or "06:00"
        const parts = evt.time.split('-').map(s => s.trim());
        const startTimeStr = parts[0] || '00:00';
        const endTimeStr = parts[1] || '23:59';

        const startDateTime = new Date(`${evt.date}T${startTimeStr}:00+07:00`);
        const endDateTime = new Date(`${evt.date}T${endTimeStr}:00+07:00`);

        if (evt.status === 'APPROVED' && now >= startDateTime && now < endDateTime) {
          await prisma.communityEvent.update({
            where: { id: evt.id },
            data: { status: 'LIVE' }
          });
          results.transitionedToLive++;
        } else if ((evt.status === 'LIVE' || evt.status === 'APPROVED') && now >= endDateTime) {
          await prisma.communityEvent.update({
            where: { id: evt.id },
            data: { status: 'COMPLETED' }
          });
          results.transitionedToCompleted++;
        }
      } catch (err) {
        console.error(`Error updating event lifecycle for ${evt.id}:`, err);
      }
    }

    console.log(`✅ [CronJobs] Event lifecycle updated:`, results);
    return results;
  }
}

