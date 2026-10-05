import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

// POST /api/community/[id]/join - Member joins a community
export async function POST(request, { params }) {
  try {
    const { id: communityId } = params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 });
    }

    const community = await prisma.community.findUnique({
      where: { id: communityId }
    });

    if (!community) {
      return NextResponse.json({ error: 'Komunitas tidak ditemukan' }, { status: 404 });
    }

    // Check if already a member
    const existing = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Sudah menjadi anggota komunitas ini' }, { status: 409 });
    }

    const member = await prisma.communityMember.create({
      data: {
        communityId,
        userId,
        role: 'MEMBER'
      },
      include: {
        user: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('[POST /api/community/[id]/join] Error:', error);
    return NextResponse.json({ error: 'Gagal bergabung ke komunitas' }, { status: 500 });
  }
}
