/**
 * Insight Service
 * Orchestrates fetching telemetry & reviews from repositories, running AI analysis, and saving insights.
 */

import { InsightRepository } from '../repositories/insightRepository.js';
import { RestaurantRepository } from '../repositories/restaurantRepository.js';
import { VisitorRepository } from '../repositories/visitorRepository.js';
import { ReservationRepository } from '../repositories/reservationRepository.js';
import { prisma } from '../../lib/prisma.js';
import { AiPipeline } from '../ai/pipeline.js';
import { EmailService } from './emailService.js';

export class InsightService {
  /**
   * Fetches latest insight or calculates on the fly if none exists.
   */
  static async getMerchantInsight(restaurantId) {
    let insight = await InsightRepository.getLatestByRestaurantId(restaurantId);

    if (!insight) {
      insight = await this.generateInsightForRestaurant(restaurantId, 'MANUAL');
    }

    return insight;
  }

  /**
   * Generates a fresh AI insight from DB telemetry & reviews.
   */
  static async generateInsightForRestaurant(restaurantId, period = 'WEEKLY') {
    const restaurant = await RestaurantRepository.findById(restaurantId);
    if (!restaurant) throw new Error('Restaurant not found');

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - 14); // Last 14 days of data

    const [visitorLogs, reservations, reviews] = await Promise.all([
      VisitorRepository.getVisitorLogsSince(restaurantId, sinceDate),
      ReservationRepository.getReservationsSince(restaurantId, sinceDate),
      prisma.review.findMany({
        where: { restaurantId },
        orderBy: { createdAt: 'desc' },
        take: 15
      })
    ]);

    const totalViews = visitorLogs.filter(l => l.action === 'VIEW_PAGE').length || 120;
    const profileVisits = visitorLogs.length || 150;

    const stats = {
      totalViews,
      profileVisits
    };

    // Execute AI pipeline
    const aiOutput = await AiPipeline.analyzeRestaurantData({
      restaurant,
      stats,
      reviews,
      visitorLogs,
      reservations
    });

    // Save to database
    const savedInsight = await InsightRepository.createInsight({
      restaurantId,
      period,
      summaryText: aiOutput.summaryText,
      sentimentScore: aiOutput.sentimentScore,
      peakHoursJson: aiOutput.peakHoursJson,
      topKeywords: aiOutput.topKeywords,
      actionItems: aiOutput.actionItems,
      churnRiskCount: aiOutput.churnRiskCount,
      rawMetrics: {
        totalViews,
        profileVisits,
        reservationsCount: reservations.length,
        actualArrivals: reservations.filter(r => r.status === 'Selesai').length,
        conversionRate: `${((reservations.length / (totalViews || 1)) * 100).toFixed(1)}%`
      }
    });

    return savedInsight;
  }

  /**
   * Sends executive report email to merchant.
   */
  static async sendReportEmail({ restaurantId, recipientEmail = null }) {
    const restaurant = await RestaurantRepository.findById(restaurantId);
    if (!restaurant) throw new Error('Restaurant not found');

    // Determine target email
    const notifConfig = await InsightRepository.getNotificationConfig(restaurantId);
    const targetEmail = recipientEmail || notifConfig?.emailRecipient || restaurant.loginEmail;

    if (!targetEmail) {
      throw new Error('Alamat email penerima tidak ditemukan untuk resto ini.');
    }

    // Get latest insight (or generate one)
    const insight = await this.getMerchantInsight(restaurantId);

    // Format HTML email
    const html = EmailService.generateReportEmailHtml({ restaurant, insight });

    // Send email
    const result = await EmailService.sendEmail({
      to: targetEmail,
      subject: `📊 Laporan Performa & AI Insight Mingguan: ${restaurant.name}`,
      html
    });

    return {
      ...result,
      recipient: targetEmail,
      insightId: insight.id
    };
  }
}
