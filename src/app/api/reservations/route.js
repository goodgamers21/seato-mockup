import { prisma as prismaClient } from '../../../lib/prisma';
import { NextResponse } from 'next/server';

async function checkAutoTerminate(reservations) {
  const now = new Date();
  const updatedReservations = [];

  for (const res of reservations) {
    if (res.status === 'Confirmed') {
      try {
        let timeStr = res.time;
        if (timeStr.includes('WIB')) timeStr = timeStr.replace('WIB', '').trim();
        
        // Use local timezone assuming WIB (+07:00)
        const resDate = new Date(`${res.date}T${timeStr}:00+07:00`); 
        
        if (!isNaN(resDate.getTime())) {
          const diffMins = (now.getTime() - resDate.getTime()) / (1000 * 60);
          const updateDiffMins = (now.getTime() - new Date(res.updatedAt).getTime()) / (1000 * 60);

          // Terminate if > 15 mins late AND hasn't been updated in the last 1 minute (grace period for testing)
          if (diffMins > 15 && updateDiffMins > 1) {
            // Auto terminate!
            const updated = await prismaClient.reservation.update({
              where: { id: res.id },
              data: { 
                status: 'Dibatalkan', 
                cancelReason: 'Terlambat / No Show (Otomatis)',
                cancelledBy: 'system'
              },
              include: { restaurant: true }
            });
            
            // Free up seatoOccupied on the correct area
            if (res.areaId) {
              const area = await prismaClient.restaurantArea.findUnique({ where: { id: res.areaId } });
              if (area && area.seatoOccupied > 0) {
                await prismaClient.restaurantArea.update({
                  where: { id: area.id },
                  data: { seatoOccupied: area.seatoOccupied - 1 }
                });
              }
            }
            
            updatedReservations.push(updated);
            continue;
          }
        }
      } catch (e) {}
    }
    updatedReservations.push(res);
  }
  return updatedReservations;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prismaClient.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let reservations = await prismaClient.reservation.findMany({
      where: { userId: user.id },
      include: { restaurant: true, promo: true },
      orderBy: { createdAt: 'desc' }
    });

    reservations = await checkAutoTerminate(reservations);

    const upcoming = reservations.filter(r => r.status === 'Confirmed' || r.status === 'Menunggu Konfirmasi');
    const selesai = reservations.filter(r => r.status === 'Selesai');
    const dibatalkan = reservations.filter(r => r.status === 'Dibatalkan' || r.status === 'Ditolak Restoran');

    const formatRes = (r) => ({
      id: r.id,
      restaurantId: r.restaurantId,
      restaurantName: r.restaurant.name,
      status: r.status,
      date: r.date,
      time: r.time,
      guests: r.guests,
      tableType: r.tableType,
      areaId: r.areaId,
      location: r.restaurant.city,
      invoiceId: r.invoiceId,
      totalAmount: r.totalAmount,
      paymentStatus: r.paymentStatus,
      cancelReason: r.cancelReason,
      cancelledBy: r.cancelledBy,
      promo: r.promo ? { code: r.promo.code, imageUrl: r.promo.imageUrl, title: r.promo.title } : null
    });

    // Check if soft ban has expired
    let isBanned = false;
    let cancelCount = user.cancelCount;
    if (user.bannedUntil) {
      if (new Date() < new Date(user.bannedUntil)) {
        isBanned = true;
      } else {
        // Soft ban expired, reset cancel count optionally
        await prismaClient.user.update({
          where: { id: user.id },
          data: { bannedUntil: null, cancelCount: 0 }
        });
        cancelCount = 0;
      }
    }

    return NextResponse.json({
      upcoming: upcoming.map(formatRes),
      selesai: selesai.map(formatRes),
      dibatalkan: dibatalkan.map(formatRes),
      isBanned: isBanned,
      cancelCount: cancelCount
    });
  } catch (error) {
    console.error('[GET /api/reservations] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prismaClient.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const restaurant = await prismaClient.restaurant.findFirst({
      where: { name: body.restaurantName }
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    let isBanned = false;
    if (user.bannedUntil && new Date() < new Date(user.bannedUntil)) {
      isBanned = true;
    }

    if (isBanned) {
      return NextResponse.json({ error: 'Akun Anda di-suspend sementara (1 jam) karena membatalkan 5 kali.' }, { status: 403 });
    }

    // Generate Invoice ID
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const invoiceId = `INV-${dateStr}-${randomHex}`;
    
    // Generate mock amount (e.g. 50k, 100k, 150k based on guests)
    const guests = body.guests || 2;
    const totalAmount = guests * 50000;

    const newRes = await prismaClient.reservation.create({
      data: {
        userId: user.id,
        restaurantId: restaurant.id,
        status: 'Menunggu Konfirmasi',
        date: body.date || 'Hari ini',
        time: body.time || '19:00 WIB',
        guests,
        tableType: body.tableType || 'Meja Indoor',
        areaId: body.areaId || null,
        invoiceId,
        totalAmount,
        paymentStatus: 'Unpaid',
        promoId: body.promoId || null
      }
    });

    // Increment user's statsReservasi
    await prismaClient.user.update({
      where: { id: user.id },
      data: { statsReservasi: user.statsReservasi + 1 }
    });

    return NextResponse.json(newRes, { status: 201 });
  } catch (error) {
    console.error('[POST /api/reservations] Error:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}
