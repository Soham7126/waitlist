'use client';

import { memo } from 'react';
import { format } from 'date-fns';
import { Trash2, Edit } from 'lucide-react';
import type { Booking } from '@/lib/booking-store';

interface BookingsTabProps {
  bookings: Booking[];
  onAddBooking: () => void;
  onEditBooking: (booking: Booking) => void;
  onDeleteBooking: (id: string) => void;
  isLoading: boolean;
}

const SOURCE_COLORS: Record<string, string> = {
  walkin: 'bg-blue-100 text-blue-700',
  dineout: 'bg-green-100 text-green-700',
  swiggy: 'bg-orange-100 text-orange-700',
};

const SOURCE_LABELS: Record<string, string> = {
  walkin: 'Walkin',
  dineout: 'Dineout',
  swiggy: 'Swiggy',
};

const BookingRow = memo(function BookingRow({
  booking,
  onEdit,
  onDelete,
}: {
  booking: Booking;
  onEdit: (booking: Booking) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="px-4 sm:px-6 py-4">
        <div className="font-medium text-sm sm:text-base text-foreground">{booking.name}</div>
      </td>
      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-foreground">
        👤 {booking.partySize}
      </td>
      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-foreground">
        {booking.phone || '-'}
      </td>
      <td className="px-4 sm:px-6 py-4">
        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${SOURCE_COLORS[booking.type] ?? 'bg-gray-100 text-gray-700'}`}>
          {SOURCE_LABELS[booking.type] ?? booking.type}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-foreground">
        {format(new Date(booking.date), 'dd MMM yyyy')}
      </td>
      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-foreground">
        {format(new Date(`1970-01-01T${booking.time}`), 'hh:mm a')}
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(booking)}
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            title="Edit booking"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(booking.id)}
            className="text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
            title="Delete booking"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
});

export default function BookingsTab({
  bookings,
  onAddBooking,
  onEditBooking,
  onDeleteBooking,
  isLoading,
}: BookingsTabProps) {
  return (
    <div className="mt-4">
      {isLoading ? (
        <div className="rounded-lg border border-border bg-white py-12 text-center">
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-lg border border-border bg-white py-12 text-center">
          <p className="text-muted-foreground mb-4">No bookings yet.</p>
          <button
            onClick={onAddBooking}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white font-semibold hover:bg-blue-700 transition-colors text-sm"
          >
            Add Booking
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-white overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Name
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Guests
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Phone
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Source
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Date
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Time
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  onEdit={onEditBooking}
                  onDelete={onDeleteBooking}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
