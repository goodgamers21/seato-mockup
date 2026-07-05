import { NextResponse } from 'next/server';
import { prisma as prismaClient } from '../../../lib/prisma';

export async function POST(request) {
  try {
    const { userId, restaurantId } = await request.json();

    if (!userId || !restaurantId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const favorite = await prismaClient.userFavorite.create({
      data: {
        userId,
        restaurantId
      }
    });

    return NextResponse.json(favorite);
  } catch (error) {
    console.error('[POST /api/favorites] Error:', error);
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const restaurantId = url.searchParams.get('restaurantId');

    if (!userId || !restaurantId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prismaClient.userFavorite.deleteMany({
      where: {
        userId,
        restaurantId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/favorites] Error:', error);
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const restaurantId = url.searchParams.get('restaurantId');

    if (userId && restaurantId) {
       const favorite = await prismaClient.userFavorite.findUnique({
          where: {
            userId_restaurantId: {
               userId,
               restaurantId
            }
          }
       });
       return NextResponse.json({ isFavorite: !!favorite });
    }
    
    if (userId) {
       const favorites = await prismaClient.userFavorite.findMany({
         where: { userId },
         include: { restaurant: true }
       });
       return NextResponse.json(favorites);
    }

    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  } catch (error) {
    console.error('[GET /api/favorites] Error:', error);
    return NextResponse.json({ error: 'Failed to get favorites' }, { status: 500 });
  }
}
