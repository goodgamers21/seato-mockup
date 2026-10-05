import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET /api/superadmin/communities - Superadmin lists communities
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = {};
    if (status && status !== 'ALL') {
      where.verificationStatus = status;
    }

    const communities = await prisma.community.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        pic: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        _count: {
          select: { members: true, events: true }
        }
      }
    });

    return NextResponse.json(communities);
  } catch (error) {
    console.error('[GET /api/superadmin/communities] Error:', error);
    return NextResponse.json({ error: 'Gagal memuat komunitas superadmin' }, { status: 500 });
  }
}
