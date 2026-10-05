import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';

// PATCH /api/community/events/[id]/cancel - PIC cancels event
export async function PATCH(request, { params }) {
  try {
    const { id: eventId } = params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 });
    }

    const event = await prisma.communityEvent.findUnique({
      where: { id: eventId },
      include: { community: true }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
    }

    // Only PIC can cancel
    if (event.community.picUserId !== userId && event.submittedById !== userId) {
      return NextResponse.json(
        { error: 'Hanya PIC komunitas yang dapat membatalkan event ini' },
        { status: 403 }
      );
    }

    const updated = await prisma.communityEvent.update({
      where: { id: eventId },
      data: { status: 'CANCELLED' }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/community/events/[id]/cancel] Error:', error);
    return NextResponse.json({ error: 'Gagal membatalkan event' }, { status: 500 });
  }
}
