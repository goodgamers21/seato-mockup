import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const totalUsers = await prisma.user.count();
    const totalRestaurants = await prisma.restaurant.count();
    const activeSubscribed = await prisma.restaurant.count({
      where: { status: 'SUBSCRIBED' }
    });
    const verifiedFree = await prisma.restaurant.count({
      where: { status: 'VERIFIED_FREE' }
    });

    // Mock MRR calculation for demo (in production, fetch from payment gateway or invoices)
    const mrr = activeSubscribed * 500000; // Rp 500,000 per subscribed resto

    return NextResponse.json({
      totalUsers,
      totalRestaurants,
      activeSubscribed,
      verifiedFree,
      mrr
    });
  } catch (error) {
    console.error('[GET /api/superadmin/dashboard] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
