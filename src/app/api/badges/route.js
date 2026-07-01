import { NextResponse } from 'next/server';
import { prisma as prismaClient } from '../../../lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      // Fetch badges for a specific user
      const userBadges = await prismaClient.userBadge.findMany({
        where: { userId },
        include: { badge: true }
      });
      return NextResponse.json(userBadges.map(ub => ({ ...ub.badge, earnedAt: ub.earnedAt })));
    } else {
      // Fetch all badges
      const badges = await prismaClient.badge.findMany();
      return NextResponse.json(badges);
    }
  } catch (error) {
    console.error('[GET /api/badges] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
  }
}
