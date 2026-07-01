import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            reservations: true,
            badges: true
          }
        },
        badges: {
          include: { badge: true }
        }
      }
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('[GET /api/superadmin/users] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
