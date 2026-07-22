import { NextResponse } from 'next/server';
import { deleteBooking } from '@/lib/booking-store';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await deleteBooking(id);

    if (!result) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/bookings/[id] failed', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
