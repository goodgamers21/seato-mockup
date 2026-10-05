import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET /api/community/events - List APPROVED / LIVE events
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'APPROVED,LIVE';
    const communityId = searchParams.get('communityId');

    const statusList = status.split(',').map(s => s.trim());

    const where = {
      status: { in: statusList }
    };

    if (category) {
      where.activityType = category;
    }
    if (communityId) {
      where.communityId = communityId;
    }

    const events = await prisma.communityEvent.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ],
      include: {
        community: {
          select: {
            id: true,
            name: true,
            category: true,
            logoUrl: true,
            verificationStatus: true
          }
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            imageUrl: true,
            rating: true
          }
        },
        rsvps: {
          select: {
            userId: true,
            status: true
          }
        }
      }
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('[GET /api/community/events] Error:', error);
    return NextResponse.json({ error: 'Gagal memuat event komunitas' }, { status: 500 });
  }
}

// POST /api/community/events - Submit new community event (PIC Only of Verified Community)
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      communityId,
      restaurantId,
      submittedById,
      title,
      activityType,
      eventType = 'SANTAI',
      date,
      time,
      targetCapacity = 25,
      requestChips = [],
      customNote = ''
    } = body;

    // Validate required fields
    if (!communityId || !restaurantId || !submittedById || !title || !activityType || !date || !time) {
      return NextResponse.json(
        { error: 'Field communityId, restaurantId, submittedById, title, activityType, date, dan time wajib diisi' },
        { status: 400 }
      );
    }

    // 1. Verify community existence & status
    const community = await prisma.community.findUnique({
      where: { id: communityId }
    });

    if (!community) {
      return NextResponse.json({ error: 'Komunitas tidak ditemukan' }, { status: 404 });
    }

    if (community.verificationStatus !== 'VERIFIED') {
      return NextResponse.json(
        { error: 'Hanya komunitas yang sudah terverifikasi (VERIFIED) yang dapat mengajukan event' },
        { status: 403 }
      );
    }

    // 2. Verify PIC authorization
    if (community.picUserId !== submittedById) {
      return NextResponse.json(
        { error: 'Hanya PIC resmi komunitas yang berhak mengajukan event' },
        { status: 403 }
      );
    }

    // 3. Verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restoran/venue tidak ditemukan' }, { status: 404 });
    }

    // 4. Validate lead-time
    const now = new Date();
    const eventDate = new Date(`${date}T00:00:00+07:00`);
    const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const minDays = eventType === 'TERSTRUKTUR' ? 7 : 3;
    if (diffDays < minDays) {
      return NextResponse.json(
        { error: `Event ${eventType} membutuhkan waktu pengajuan minimal H-${minDays}. Tanggal yang dipilih terlalu dekat.` },
        { status: 400 }
      );
    }

    // 5. Create event with PIC auto-RSVP
    const event = await prisma.$transaction(async (tx) => {
      const newEvent = await tx.communityEvent.create({
        data: {
          communityId,
          restaurantId,
          submittedById,
          title,
          activityType,
          eventType,
          date,
          time,
          targetCapacity: parseInt(targetCapacity, 10) || 25,
          currentRsvp: 1, // PIC is automatically joined
          requestChips,
          customNote,
          status: 'PENDING'
        }
      });

      // Auto-RSVP PIC
      await tx.communityEventRsvp.create({
        data: {
          eventId: newEvent.id,
          userId: submittedById,
          status: 'JOINED'
        }
      });

      return newEvent;
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('[POST /api/community/events] Error:', error);
    return NextResponse.json({ error: 'Gagal mengajukan event' }, { status: 500 });
  }
}
