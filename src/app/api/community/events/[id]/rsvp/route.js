import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';

// POST /api/community/events/[id]/rsvp - Join an event
export async function POST(request, { params }) {
  try {
    const { id: eventId } = params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 });
    }

    // Atomic transaction to check capacity and create RSVP
    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.communityEvent.findUnique({
        where: { id: eventId }
      });

      if (!event) {
        throw { status: 404, message: 'Event tidak ditemukan' };
      }

      if (!['APPROVED', 'LIVE'].includes(event.status)) {
        throw { status: 400, message: 'Hanya event yang disetujui yang dapat diikuti' };
      }

      const existingRsvp = await tx.communityEventRsvp.findUnique({
        where: {
          eventId_userId: { eventId, userId }
        }
      });

      if (existingRsvp && existingRsvp.status === 'JOINED') {
        throw { status: 409, message: 'Anda sudah bergabung dalam event ini' };
      }

      if (event.currentRsvp >= event.targetCapacity) {
        throw { status: 400, message: 'Kuota event sudah penuh' };
      }

      let rsvp;
      if (existingRsvp) {
        rsvp = await tx.communityEventRsvp.update({
          where: { id: existingRsvp.id },
          data: { status: 'JOINED' }
        });
      } else {
        rsvp = await tx.communityEventRsvp.create({
          data: { eventId, userId, status: 'JOINED' }
        });
      }

      const updatedEvent = await tx.communityEvent.update({
        where: { id: eventId },
        data: { currentRsvp: event.currentRsvp + 1 }
      });

      return { rsvp, currentRsvp: updatedEvent.currentRsvp, targetCapacity: updatedEvent.targetCapacity };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[POST /api/community/events/[id]/rsvp] Error:', error);
    if (error.status) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Gagal bergabung ke event' }, { status: 500 });
  }
}

// DELETE /api/community/events/[id]/rsvp - Cancel RSVP
export async function DELETE(request, { params }) {
  try {
    const { id: eventId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingRsvp = await tx.communityEventRsvp.findUnique({
        where: {
          eventId_userId: { eventId, userId }
        }
      });

      if (!existingRsvp || existingRsvp.status !== 'JOINED') {
        throw { status: 404, message: 'Anda belum terdaftar di event ini' };
      }

      await tx.communityEventRsvp.update({
        where: { id: existingRsvp.id },
        data: { status: 'CANCELLED' }
      });

      const event = await tx.communityEvent.findUnique({ where: { id: eventId } });
      const newCount = Math.max(0, (event.currentRsvp || 1) - 1);

      const updatedEvent = await tx.communityEvent.update({
        where: { id: eventId },
        data: { currentRsvp: newCount }
      });

      return { currentRsvp: updatedEvent.currentRsvp };
    });

    return NextResponse.json({ message: 'Berhasil membatalkan kehadiran', ...result });
  } catch (error) {
    console.error('[DELETE /api/community/events/[id]/rsvp] Error:', error);
    if (error.status) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Gagal membatalkan kehadiran' }, { status: 500 });
  }
}
