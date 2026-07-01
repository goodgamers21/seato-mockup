import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        areas: true, // Includes the area sizes
      }
    });
    
    return NextResponse.json(restaurants);
  } catch (error) {
    console.error('[GET /api/superadmin/restaurants] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const updated = await prisma.restaurant.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/superadmin/restaurants] Error:', error);
    return NextResponse.json({ error: 'Failed to update restaurant status' }, { status: 500 });
  }
}
