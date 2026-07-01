import { NextResponse } from 'next/server';
import { prisma as prismaClient } from '../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const user = await prismaClient.user.findUnique({
      where: { id },
      include: {
        badges: {
          include: { badge: true }
        },
        xpLogs: {
          orderBy: { createdAt: 'desc' },
          take: 3
        },
        favorites: {
          include: { restaurant: true }
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: { restaurant: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('[GET /api/profile/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    const updatedUser = await prismaClient.user.update({
      where: { id },
      data: {
        name: data.name,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        location: data.location
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('[PATCH /api/profile/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
  }
}
