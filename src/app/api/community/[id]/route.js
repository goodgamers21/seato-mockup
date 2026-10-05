import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET /api/community/[id] - Detail community
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        pic: {
          select: { id: true, name: true, avatarUrl: true, specialization: true }
        },
        members: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true, initials: true } }
          }
        },
        events: {
          where: { status: { in: ['APPROVED', 'LIVE'] } },
          orderBy: { date: 'asc' },
          include: {
            restaurant: { select: { id: true, name: true, address: true, imageUrl: true } }
          }
        }
      }
    });

    if (!community) {
      return NextResponse.json({ error: 'Komunitas tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(community);
  } catch (error) {
    console.error('[GET /api/community/[id]] Error:', error);
    return NextResponse.json({ error: 'Gagal mengambil detail komunitas' }, { status: 500 });
  }
}
