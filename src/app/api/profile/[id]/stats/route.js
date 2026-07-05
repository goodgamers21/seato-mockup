import { NextResponse } from 'next/server';
import { prisma as prismaClient } from '../../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const user = await prismaClient.user.findUnique({
      where: { id },
      include: {
        badges: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Mock stats calculation
    // Get checkins this month (mocking by counting xp logs for check_in this month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const checkIns = await prismaClient.xPLog.count({
      where: {
        userId: id,
        action: 'CHECK_IN',
        createdAt: {
          gte: startOfMonth
        }
      }
    });

    const xpLogsThisMonth = await prismaClient.xPLog.findMany({
      where: {
        userId: id,
        createdAt: {
          gte: startOfMonth
        }
      }
    });

    const xpEarnedThisMonth = xpLogsThisMonth.reduce((sum, log) => sum + log.xpAmount, 0);

    // Mock rank position (just counting how many users have more XP)
    const usersWithMoreXp = await prismaClient.user.count({
      where: {
        xpPoints: {
          gt: user.xpPoints
        }
      }
    });
    
    const rankPosition = usersWithMoreXp + 1;

    // Badge progress (mock calculation: e.g., next badge requires 50 reviews, user has 45, so 90%)
    const badgeProgress = Math.min(100, Math.round((user.statsUlasan / 15) * 100)); // e.g. for Coffee Expert

    const stats = {
      checkInsThisMonth: checkIns,
      xpEarnedThisMonth,
      rankPosition,
      nextBadgeProgress: badgeProgress,
      nextBadgeName: 'Coffee Expert'
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[GET /api/profile/[id]/stats] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile stats' }, { status: 500 });
  }
}
