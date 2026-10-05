import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

// PATCH /api/superadmin/communities/[id] - Superadmin updates community status
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { verificationStatus, verificationNote } = body;

    if (!verificationStatus || !['PENDING_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED'].includes(verificationStatus)) {
      return NextResponse.json(
        { error: 'Status verifikasi tidak valid' },
        { status: 400 }
      );
    }

    const dataToUpdate = { verificationStatus };
    if (verificationNote !== undefined) {
      dataToUpdate.verificationNote = verificationNote;
    }

    const updated = await prisma.community.update({
      where: { id },
      data: dataToUpdate,
      include: {
        pic: { select: { id: true, name: true, email: true } }
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/superadmin/communities/[id]] Error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui status komunitas' }, { status: 500 });
  }
}
