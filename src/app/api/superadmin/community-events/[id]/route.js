import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

// PATCH /api/superadmin/community-events/[id] - Moderation: Force Cancel or Flag
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, isFlagged } = body;

    const dataToUpdate = {};
    if (action === 'FORCE_CANCEL') {
      dataToUpdate.status = 'CANCELLED';
    }
    if (isFlagged !== undefined) {
      dataToUpdate.isFlaggedByAdmin = Boolean(isFlagged);
    }

    const updated = await prisma.communityEvent.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/superadmin/community-events/[id]] Error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui event' }, { status: 500 });
  }
}
