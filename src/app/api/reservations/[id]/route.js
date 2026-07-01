import { NextResponse } from 'next/server';
import { prisma as prismaClient } from '../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const reservation = await prismaClient.reservation.findUnique({
      where: { id },
      include: { restaurant: true }
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    return NextResponse.json(reservation);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reservation' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const reservation = await prismaClient.reservation.findUnique({ where: { id } });
    if (!reservation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const oldStatus = reservation.status;
    const newStatus = body.status;
    const cancelledBy = body.cancelledBy || null; // "user" | "admin" | "system"

    // Build update data
    const updateData = {};
    if (newStatus) updateData.status = newStatus;
    if (body.paymentStatus) updateData.paymentStatus = body.paymentStatus;
    if (body.cancelReason) updateData.cancelReason = body.cancelReason;
    if (cancelledBy) updateData.cancelledBy = cancelledBy;
    if (body.assignedTable !== undefined) updateData.assignedTable = body.assignedTable;

    // ============================================
    // LOGIC: Handle seatoOccupied changes per area
    // ============================================

    // Helper: increment seatoOccupied on the correct area
    const incrementSeatoOccupied = async () => {
      if (reservation.areaId) {
        const area = await prismaClient.restaurantArea.findUnique({ where: { id: reservation.areaId } });
        if (area) {
          await prismaClient.restaurantArea.update({
            where: { id: area.id },
            data: { seatoOccupied: area.seatoOccupied + 1 }
          });
        }
      }
    };

    // Helper: decrement seatoOccupied on the correct area
    const decrementSeatoOccupied = async () => {
      if (reservation.areaId) {
        const area = await prismaClient.restaurantArea.findUnique({ where: { id: reservation.areaId } });
        if (area && area.seatoOccupied > 0) {
          await prismaClient.restaurantArea.update({
            where: { id: area.id },
            data: { seatoOccupied: area.seatoOccupied - 1 }
          });
        }
      }
    };

    // 1. Menunggu Konfirmasi → Confirmed (Admin Approve)
    //    → seatoOccupied +1
    if (oldStatus === 'Menunggu Konfirmasi' && newStatus === 'Confirmed') {
      await incrementSeatoOccupied();
    }

    // 2. Confirmed → Dibatalkan (User Cancel dari reservasi yang sudah di-approve)
    //    → seatoOccupied -1, cancelCount +1 (jika cancelledBy === 'user')
    if (oldStatus === 'Confirmed' && newStatus === 'Dibatalkan') {
      await decrementSeatoOccupied();

      if (cancelledBy === 'user') {
        const user = await prismaClient.user.findUnique({ where: { id: reservation.userId } });
        if (user) {
          const newCount = user.cancelCount + 1;
          let updateUserData = { cancelCount: newCount };
          if (newCount >= 5) {
            updateUserData.bannedUntil = new Date(Date.now() + 60 * 60 * 1000);
          }
          await prismaClient.user.update({ where: { id: user.id }, data: updateUserData });
        }
      }
    }

    // 3. Menunggu Konfirmasi → Dibatalkan (User Cancel sebelum di-approve)
    //    → cancelCount +1 (jika cancelledBy === 'user'), seatoOccupied tidak berubah
    if (oldStatus === 'Menunggu Konfirmasi' && newStatus === 'Dibatalkan') {
      if (cancelledBy === 'user') {
        const user = await prismaClient.user.findUnique({ where: { id: reservation.userId } });
        if (user) {
          const newCount = user.cancelCount + 1;
          let updateUserData = { cancelCount: newCount };
          if (newCount >= 5) {
            updateUserData.bannedUntil = new Date(Date.now() + 60 * 60 * 1000);
          }
          await prismaClient.user.update({ where: { id: user.id }, data: updateUserData });
        }
      }
    }

    // 4. Menunggu Konfirmasi → Ditolak Restoran (Admin Reject)
    //    → TIDAK tambah cancelCount, TIDAK ubah seatoOccupied
    //    (No additional logic needed — status change only)

    // 5. Confirmed → Sedang Makan (Check In)
    //    → Status change only. seatoOccupied remains the same (already +1 when Confirmed).

    // 6. Confirmed or Sedang Makan → Selesai (Admin marks as completed / Check Out)
    //    → seatoOccupied -1, and award Check-In XP to user
    if ((oldStatus === 'Confirmed' || oldStatus === 'Sedang Makan') && newStatus === 'Selesai') {
      await decrementSeatoOccupied();
      
      const user = await prismaClient.user.findUnique({ where: { id: reservation.userId } });
      if (user) {
         // Determine XP Amount (+15 if first visit, but for now let's use +5 check-in)
         // Check if they have past finished reservations at this restaurant
         const pastVisits = await prismaClient.reservation.count({
            where: { userId: user.id, restaurantId: reservation.restaurantId, status: 'Selesai', id: { not: reservation.id } }
         });
         const isFirstVisit = pastVisits === 0;
         const xpAmount = isFirstVisit ? 15 : 5;
         const actionLabel = isFirstVisit ? 'FIRST_VISIT' : 'CHECK_IN';
         
         const newXpPoints = user.xpPoints + xpAmount;
         
         const LEVEL_THRESHOLDS = [
            { level: 1, xp: 0 }, { level: 5, xp: 500 }, { level: 10, xp: 2000 },
            { level: 15, xp: 5000 }, { level: 20, xp: 10000 }, { level: 25, xp: 20000 }
         ];
         let newLevel = 1;
         for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (newXpPoints >= LEVEL_THRESHOLDS[i].xp) {
               newLevel = LEVEL_THRESHOLDS[i].level;
               const nextThreshold = LEVEL_THRESHOLDS[i+1];
               if (nextThreshold) {
                  const xpDiff = nextThreshold.xp - LEVEL_THRESHOLDS[i].xp;
                  const levelDiff = nextThreshold.level - LEVEL_THRESHOLDS[i].level;
                  const xpPerLevel = xpDiff / levelDiff;
                  newLevel += Math.floor((newXpPoints - LEVEL_THRESHOLDS[i].xp) / xpPerLevel);
               }
               break;
            }
         }
         newLevel = newLevel > 25 ? 25 : newLevel;

         await prismaClient.$transaction([
            prismaClient.xPLog.create({
               data: { userId: user.id, action: actionLabel, xpAmount, sourceId: reservation.id }
            }),
            prismaClient.user.update({
               where: { id: user.id },
               data: { xpPoints: newXpPoints, level: newLevel }
            })
         ]);
      }
    }

    // Execute the update
    const updated = await prismaClient.reservation.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/reservations/:id] Error:', error);
    return NextResponse.json({ error: 'Failed to update reservation', details: error.message }, { status: 500 });
  }
}
