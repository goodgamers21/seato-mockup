/**
 * DTOs for Visitor Telemetry / Activity Tracking
 */

export class LogVisitorActivityDto {
  constructor({ restaurantId, userId = null, action = 'VIEW_PAGE', keyword = null, source = 'DIRECT', device = 'Web' }) {
    if (!restaurantId) throw new Error('restaurantId is required');
    this.restaurantId = restaurantId;
    this.userId = userId;
    this.action = action; // 'VIEW_PAGE' | 'CLICK_MENU' | 'CLICK_RESERVE' | 'SEARCH_KEYWORD' | 'VIEW_PROMO'
    this.keyword = keyword ? String(keyword).trim() : null;
    this.source = source; // 'SEARCH' | 'NEARBY' | 'HOME_TRENDING' | 'DIRECT'
    this.device = device; // 'iOS' | 'Android' | 'Web'
  }
}
