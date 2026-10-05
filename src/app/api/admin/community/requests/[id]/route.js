import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';

// PATCH /api/admin/community/requests/[id] - Merchant Approve or Reject
export async function PATCH(request, { params }) {
  try {
    const { id: eventId } = params;
    const body = await request.json();
    const { action, reply = '', restaurantId } = body;

    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: 'action wajib diisi dengan APPROVE atau REJECT' },
        { status: 400 }
      );
    }

    if (reply && reply.length > 140) {
      return NextResponse.json(
        { error: 'Balasan singkat maksimal 140 karakter' },
        { status: 400 }
      );
    }

    const event = await prisma.communityEvent.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json({ error: 'Permintaan event tidak ditemukan' }, { status: 404 });
    }

    if (event.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Permintaan ini sudah berstatus ${event.status}` },
        { status: 400 }
      );
    }

    // Check restaurant ownership if provided
    if (restaurantId && event.restaurantId !== restaurantId) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki hak akses atas venue ini' },
        { status: 403 }
      );
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    const updated = await prisma.communityEvent.update({
      where: { id: eventId },
      data: {
        status: newStatus,
        merchantReply: reply ? reply.trim().slice(0, 140) : null
      },
      include: {
        community: true
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/admin/community/requests/[id]] Error:', error);
    return NextResponse.json({ error: 'Gagal memproses permintaan event' }, { status: 500 });
  }
}
