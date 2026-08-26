/**
 * Market & Competitor Scraper Module
 * Ini adalah tempat teman AI kamu menaruh script scraping (Puppeteer, Cheerio, API scraper, dll).
 */

import { prisma } from '../../lib/prisma.js';

export class MarketScraper {
  /**
   * Scrapes competitor/market data and persists to ScrapedMarketData table.
   * @param {Object} params
   * @param {string} [params.restaurantId]
   * @param {string} params.targetQuery
   * @param {string} [params.platform]
   */
  static async runScraper({ restaurantId = null, targetQuery = 'Coffee Shop Jakarta', platform = 'GOOGLE_MAPS' }) {
    console.log(`🕷️ [MarketScraper] Running scraper for "${targetQuery}" on platform: ${platform}...`);

    try {
      const mockScrapedResult = {
        targetName: targetQuery,
        platform,
        rating: 4.5,
        reviewCount: 320,
        scrapedData: {
          averagePrice: 32000,
          peakDays: ['Jumat', 'Sabtu', 'Minggu'],
          popularAmenities: ['Free WiFi', 'Power Outlets', 'Smoking Area', 'AC'],
          scrapedAt: new Date().toISOString()
        }
      };

      const saved = await prisma.scrapedMarketData.create({
        data: {
          restaurantId,
          targetName: mockScrapedResult.targetName,
          platform: mockScrapedResult.platform,
          rating: mockScrapedResult.rating,
          reviewCount: mockScrapedResult.reviewCount,
          scrapedData: mockScrapedResult.scrapedData
        }
      });

      console.log(`✅ [MarketScraper] Successfully scraped and saved data id: ${saved.id}`);
      return saved;
    } catch (err) {
      console.error('❌ [MarketScraper] Scraper error:', err);
      throw err;
    }
  }
}
