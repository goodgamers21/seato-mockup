import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET /api/superadmin/community-events - Superadmin monitors all events
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const events = await prisma.communityEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        community: {
          select: { id: true, name: true, category: true, verificationStatus: true }
        },
        restaurant: {
          select: { id: true, name: true, city: true }
        },
        submittedBy: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { rsvps: true }
        }
      }
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('[GET /api/superadmin/community-events] Error:', error);
    return NextResponse.json({ error: 'Gagal memuat event komunitas untuk superadmin' }, { status: 500 });
  }
}
