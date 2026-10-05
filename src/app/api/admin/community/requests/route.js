import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

// GET /api/admin/community/requests - Merchant views pending/approved requests
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const status = searchParams.get('status') || 'PENDING';

    if (!restaurantId) {
      return NextResponse.json({ error: 'restaurantId diperlukan' }, { status: 400 });
    }

    const where = { restaurantId };
    if (status !== 'ALL') {
      where.status = status;
    }

    const requests = await prisma.communityEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        community: {
          select: {
            id: true,
            name: true,
            category: true,
            logoUrl: true,
            verificationStatus: true,
            pic: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        submittedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('[GET /api/admin/community/requests] Error:', error);
    return NextResponse.json({ error: 'Gagal mengambil permintaan komunitas' }, { status: 500 });
  }
}
