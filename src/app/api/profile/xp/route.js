import { NextResponse } from 'next/server';
import { prisma as prismaClient } from '../../../lib/prisma';

// Level thresholds based on plan
const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: 'Newcomer' },
  { level: 5, xp: 500, title: 'Explorer' },
  { level: 10, xp: 2000, title: 'Enthusiast' },
  { level: 15, xp: 5000, title: 'Connoisseur' },
  { level: 20, xp: 10000, title: 'Master Hopper' },
  { level: 25, xp: 20000, title: 'Legend Hopper' },
];

function calculateLevel(xp) {
  let currentLevel = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      currentLevel = LEVEL_THRESHOLDS[i].level;
      // Add incremental levels between thresholds
      const nextThreshold = LEVEL_THRESHOLDS[i+1];
      if (nextThreshold) {
         const xpDiff = nextThreshold.xp - LEVEL_THRESHOLDS[i].xp;
         const levelDiff = nextThreshold.level - LEVEL_THRESHOLDS[i].level;
         const xpPerLevel = xpDiff / levelDiff;
         const extraLevels = Math.floor((xp - LEVEL_THRESHOLDS[i].xp) / xpPerLevel);
         currentLevel += extraLevels;
      }
      break;
    }
  }
  return currentLevel > 25 ? 25 : currentLevel;
}

export async function POST(request) {
  try {
    const { userId, action, xpAmount, sourceId } = await request.json();

    if (!userId || !action || !xpAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await prismaClient.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newXpPoints = user.xpPoints + xpAmount;
    const newLevel = calculateLevel(newXpPoints);

    // Create log and update user in a transaction
    const [xpLog, updatedUser] = await prismaClient.$transaction([
      prismaClient.xPLog.create({
        data: {
          userId,
          action,
          xpAmount,
          sourceId
        }
      }),
      prismaClient.user.update({
        where: { id: userId },
        data: {
          xpPoints: newXpPoints,
          level: newLevel
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      leveledUp: newLevel > user.level,
      newLevel,
      newXpPoints,
      xpLog
    });
  } catch (error) {
    console.error('[POST /api/profile/xp] Error:', error);
    return NextResponse.json({ error: 'Failed to award XP' }, { status: 500 });
  }
}
