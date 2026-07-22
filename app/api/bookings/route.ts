import { NextResponse } from 'next/server';
import { createBooking, listBookings, updateBooking } from '@/lib/booking-store';

export async function GET() {
  const bookings = await listBookings();
  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body?.name || !body?.partySize || !body?.type || !body?.date || !body?.time) {
      return NextResponse.json(
        { error: 'Missing required booking fields' },
        { status: 400 }
      );
    }

    const booking = await createBooking({
      name: body.name,
      partySize: Number(body.partySize),
      phone: body.phone,
      type: body.type,
      date: body.date,
      time: body.time,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('POST /api/bookings failed', error);
    return NextResponse.json({ error: 'Failed to add booking' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    if (!body?.id) {
      return NextResponse.json({ error: 'Missing booking id' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.partySize !== undefined) updates.partySize = Number(body.partySize);
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.type !== undefined) updates.type = body.type;
    if (body.date !== undefined) updates.date = body.date;
    if (body.time !== undefined) updates.time = body.time;

    const booking = await updateBooking(body.id, updates);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('PATCH /api/bookings failed', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
