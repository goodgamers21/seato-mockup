import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/community - List all verified or active communities
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'VERIFIED';

    const where = {};
    if (status !== 'ALL') {
      where.verificationStatus = status;
    }
    if (category) {
      where.category = category;
    }

    const communities = await prisma.community.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        pic: {
          select: { id: true, name: true, avatarUrl: true, email: true }
        },
        _count: {
          select: { members: true, events: true }
        }
      }
    });

    return NextResponse.json(communities);
  } catch (error) {
    console.error('[GET /api/community] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch communities' }, { status: 500 });
  }
}

// POST /api/community - Register new community (Pending review)
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, category, description, logoUrl, picUserId } = body;

    if (!name || !category || !picUserId) {
      return NextResponse.json(
        { error: 'Field name, category, dan picUserId wajib diisi' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: picUserId } });
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    const community = await prisma.community.create({
      data: {
        name,
        category,
        description,
        logoUrl,
        picUserId,
        verificationStatus: 'PENDING_REVIEW',
        members: {
          create: [
            {
              userId: picUserId,
              role: 'PIC'
            }
          ]
        }
      },
      include: {
        pic: { select: { id: true, name: true } },
        members: true
      }
    });

    return NextResponse.json(community, { status: 201 });
  } catch (error) {
    console.error('[POST /api/community] Error:', error);
    return NextResponse.json({ error: 'Gagal mendaftarkan komunitas' }, { status: 500 });
  }
}
