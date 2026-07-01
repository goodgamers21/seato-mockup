import { NextResponse } from 'next/server';
import { prisma as prismaClient } from '../../../lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    // Global scope is default. Can be extended to support 'friends' scope if needed.

    const users = await prismaClient.user.findMany({
      orderBy: { xpPoints: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        initials: true,
        avatarUrl: true,
        level: true,
        xpPoints: true,
        cafesVisited: true,
        _count: {
          select: { badges: true }
        }
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('[GET /api/leaderboard] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
