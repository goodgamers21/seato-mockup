import { NextResponse } from 'next/server';
import { prisma as prismaClient } from '../../../../../lib/prisma';

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const restaurantId = resolvedParams.id;
    const body = await request.json();
    const { areas } = body; // Array of area objects

    if (!Array.isArray(areas)) {
      return NextResponse.json({ error: 'areas must be an array' }, { status: 400 });
    }

    // To be safe on SQLite and preserve frontend IDs:
    // 1. Find existing areas
    // 2. Delete ones that are no longer in the payload
    // 3. Upsert the ones in the payload

    const currentAreaIds = areas.map(a => a.id).filter(Boolean);

    await prismaClient.$transaction(async (tx) => {
      // Delete removed areas
      await tx.restaurantArea.deleteMany({
        where: {
          restaurantId,
          id: { notIn: currentAreaIds.length > 0 ? currentAreaIds : ['NONE'] }
        }
      });

      // Upsert areas
      for (const a of areas) {
        await tx.restaurantArea.upsert({
          where: { id: a.id || 'NEW_ID_THAT_WILL_NEVER_MATCH' },
          update: {
            name: a.name,
            total: Number(a.total),
            seatoAllocated: Number(a.seatoAllocated),
            seatoOccupied: Number(a.seatoOccupied || 0),
            walkInOccupied: Number(a.walkInOccupied || 0),
            tableAssignments: a.tableAssignments || []
          },
          create: {
            id: a.id, // Preserve the ID from frontend so it doesn't break React state
            restaurantId,
            name: a.name,
            total: Number(a.total),
            seatoAllocated: Number(a.seatoAllocated),
            seatoOccupied: Number(a.seatoOccupied || 0),
            walkInOccupied: Number(a.walkInOccupied || 0),
            tableAssignments: a.tableAssignments || []
          }
        });
      }
    });

    // Fetch the updated areas
    const updatedAreas = await prismaClient.restaurantArea.findMany({
      where: { restaurantId }
    });

    return NextResponse.json({ success: true, areas: updatedAreas });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to sync areas' }, { status: 500 });
  }
}

// GET: Fetch current areas for a restaurant
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const restaurantId = resolvedParams.id;

    const areas = await prismaClient.restaurantArea.findMany({
      where: { restaurantId }
    });

    return NextResponse.json({ success: true, areas });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch areas' }, { status: 500 });
  }
}

// PATCH: Atomic increment/decrement of seatoOccupied or walkInOccupied for a single area
export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params;
    const restaurantId = resolvedParams.id;
    const body = await request.json();
    const { areaId, field, delta, assignments } = body;

    // Validate input
    if (!areaId || !field || typeof delta !== 'number') {
      return NextResponse.json({ error: 'areaId, field, and delta are required' }, { status: 400 });
    }

    if (!['seatoOccupied', 'walkInOccupied'].includes(field)) {
      return NextResponse.json({ error: 'field must be seatoOccupied or walkInOccupied' }, { status: 400 });
    }

    if (delta !== 1 && delta !== -1 && delta !== 0) {
      return NextResponse.json({ error: 'delta must be 1, -1, or 0' }, { status: 400 });
    }

    // Fetch current area to validate constraints
    const area = await prismaClient.restaurantArea.findFirst({
      where: { id: areaId, restaurantId }
    });

    if (!area) {
      return NextResponse.json({ error: 'Area not found' }, { status: 404 });
    }

    const currentOccupied = area.seatoOccupied + area.walkInOccupied;

    // Validate constraints
    if (field === 'seatoOccupied') {
      const newVal = area.seatoOccupied + delta;
      if (newVal < 0) {
        return NextResponse.json({ error: 'seatoOccupied cannot go below 0' }, { status: 400 });
      }
      if (newVal > area.seatoAllocated) {
        return NextResponse.json({ error: 'seatoOccupied cannot exceed seatoAllocated' }, { status: 400 });
      }
      if (currentOccupied + delta > area.total) {
        return NextResponse.json({ error: 'Total occupied cannot exceed total tables' }, { status: 400 });
      }
    }

    if (field === 'walkInOccupied') {
      const newVal = area.walkInOccupied + delta;
      if (newVal < 0) {
        return NextResponse.json({ error: 'walkInOccupied cannot go below 0' }, { status: 400 });
      }
      if (currentOccupied + delta > area.total) {
        return NextResponse.json({ error: 'Total occupied cannot exceed total tables' }, { status: 400 });
      }
    }

    // Atomic update
    const updateData = { [field]: area[field] + delta };
    if (assignments !== undefined) {
      updateData.tableAssignments = assignments;
    }

    const updatedArea = await prismaClient.restaurantArea.update({
      where: { id: areaId },
      data: updateData
    });

    // Return all areas so frontend can sync full state
    const allAreas = await prismaClient.restaurantArea.findMany({
      where: { restaurantId }
    });

    return NextResponse.json({ success: true, areas: allAreas });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update area' }, { status: 500 });
  }
}
