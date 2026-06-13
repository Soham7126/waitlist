'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Bell, Check, X } from 'lucide-react';
import type { Customer } from '@/app/page';

interface QueueTableProps {
  customers: Customer[];
  onMarkReady: (id: string) => void;
  onSeat: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (customer: Customer) => void;
  isHistoryView: boolean;
  isEmpty: boolean;
  isLoading: boolean;
}

const StatusBadge = ({
  status,
  remainingTime,
}: {
  status: 'waiting' | 'ready' | 'seated' | 'cancelled';
  remainingTime?: number;
}) => {
  let bgColor = 'bg-blue-100 text-blue-700';
  let text = 'Waiting';

  if (status === 'ready') {
    bgColor = 'bg-orange-100 text-orange-700';
    text = 'Ready';
  } else if (status === 'seated') {
    bgColor = 'bg-green-100 text-green-700';
    text = 'Seated';
  } else if (status === 'cancelled') {
    bgColor = 'bg-gray-100 text-gray-600';
    text = 'Cancelled';
  }

  return (
    <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${bgColor}`}>
      {text}
    </span>
  );
};

const TimerBadge = ({ remainingSeconds }: { remainingSeconds: number }) => {
  const minutes = Math.floor(Math.max(0, remainingSeconds) / 60);
  const seconds = Math.max(0, remainingSeconds) % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  let bgColor = 'bg-green-100 text-green-700';
  if (remainingSeconds <= 60) {
    bgColor = 'bg-red-100 text-red-700';
  } else if (remainingSeconds <= 300) {
    bgColor = 'bg-yellow-100 text-yellow-700';
  }

  return (
    <span className={`inline-block rounded-md px-3 py-1 text-sm font-semibold ${bgColor}`}>
      {timeString}
    </span>
  );
};

const TypeBadge = ({ type }: { type: string }) => {
  const isPhone = type.toLowerCase() === 'phone';
  const bgColor = isPhone ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700';

  return (
    <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${bgColor}`}>
      {type}
    </span>
  );
};

const CustomerCard = ({
  customer,
  onMarkReady,
  onSeat,
  onCancel,
  onDelete,
  onEdit,
  isHistoryView,
}: {
  customer: Customer;
  onMarkReady: (id: string) => void;
  onSeat: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (customer: Customer) => void;
  isHistoryView: boolean;
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(customer.waitTime * 60);

  useEffect(() => {
    if (customer.status === 'seated' || customer.status === 'cancelled') {
      return;
    }

    const startTime = customer.addedAt.getTime();
    const totalWaitSeconds = customer.waitTime * 60;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, totalWaitSeconds - elapsedSeconds);
      setRemainingSeconds(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [customer]);

  const formattedTime = format(customer.addedAt, 'hh:mm a');

  return (
    <div
      className="rounded-lg border border-border bg-white p-4 space-y-3 cursor-pointer transition-shadow hover:shadow-md"
      onDoubleClick={() => onEdit(customer)}
      title="Double-click to edit"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-2xl font-bold text-foreground">{customer.token}</div>
          <div className="mt-1">
            <div className="font-semibold text-foreground text-sm">{customer.name}</div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-muted-foreground">👤 {customer.partySize}</span>
              {customer.tableNumbers?.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  Table {customer.tableNumbers.join(' & ')}
                </span>
              )}
              {customer.phone && <span className="text-xs text-muted-foreground">{customer.phone}</span>}
              <TypeBadge type={customer.type} />
            </div>
          </div>
        </div>
        <StatusBadge status={customer.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border">
        <div>
          <span className="text-muted-foreground">Added</span>
          <div className="font-semibold text-foreground">{formattedTime}</div>
        </div>
        <div>
          <span className="text-muted-foreground">Wait</span>
          <div className="mt-1">
            {customer.status !== 'seated' && customer.status !== 'cancelled' && (
              <TimerBadge remainingSeconds={remainingSeconds} />
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2 flex-wrap">
        {isHistoryView ? (
          <button
            onClick={() => onDelete(customer.id)}
            className="w-full px-3 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors border border-gray-200"
          >
            Delete
          </button>
        ) : customer.status === 'waiting' ? (
          <>
            <button
              onClick={() => onMarkReady(customer.id)}
              className="flex-1 min-w-fit inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border-2 border-orange-400 text-orange-600 font-semibold hover:bg-orange-50 transition-colors text-sm"
            >
              <Bell size={16} />
              <span className="hidden sm:inline">Mark Ready</span>
              <span className="sm:hidden">Ready</span>
            </button>
            <button
              onClick={() => onSeat(customer.id)}
              className="flex-1 min-w-fit inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors text-sm"
            >
              <Check size={16} />
              <span>Seat</span>
            </button>
            <button
              onClick={() => onCancel(customer.id)}
              className="flex-1 min-w-fit px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border border-red-200"
            >
              Cancel
            </button>
          </>
        ) : customer.status === 'ready' ? (
          <>
            <button
              onClick={() => onSeat(customer.id)}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors text-sm"
            >
              <Check size={16} />
              <span>Seat</span>
            </button>
            <button
              onClick={() => onCancel(customer.id)}
              className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border border-red-200"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => onDelete(customer.id)}
            className="w-full px-3 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors border border-gray-200"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

const CustomerRow = ({
  customer,
  onMarkReady,
  onSeat,
  onCancel,
  onDelete,
  onEdit,
  isHistoryView,
}: {
  customer: Customer;
  onMarkReady: (id: string) => void;
  onSeat: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (customer: Customer) => void;
  isHistoryView: boolean;
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(customer.waitTime * 60);

  useEffect(() => {
    if (customer.status === 'seated' || customer.status === 'cancelled') {
      return;
    }

    const startTime = customer.addedAt.getTime();
    const totalWaitSeconds = customer.waitTime * 60;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, totalWaitSeconds - elapsedSeconds);
      setRemainingSeconds(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [customer]);

  const formattedTime = format(customer.addedAt, 'hh:mm a');

  return (
    <tr
      className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
      onDoubleClick={() => onEdit(customer)}
      title="Double-click to edit"
    >
      <td className="px-4 sm:px-6 py-4">
        <div className="font-bold text-base sm:text-lg text-foreground">{customer.token}</div>
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="font-medium text-sm sm:text-base text-foreground">{customer.name}</div>
        <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 mt-1 flex-wrap">
          <span>👤 {customer.partySize}</span>
          {customer.tableNumbers?.length > 0 && (
            <span>Table {customer.tableNumbers.join(' & ')}</span>
          )}
          {customer.phone && <span className="hidden sm:inline">{customer.phone}</span>}
          <TypeBadge type={customer.type} />
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-foreground">{formattedTime}</td>
      <td className="px-4 sm:px-6 py-4">
        {customer.status !== 'seated' && customer.status !== 'cancelled' && (
          <TimerBadge remainingSeconds={remainingSeconds} />
        )}
      </td>
      <td className="px-4 sm:px-6 py-4">
        <StatusBadge status={customer.status} />
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="flex gap-2 items-center flex-wrap">
          {isHistoryView ? (
            <button
              onClick={() => onDelete(customer.id)}
              className="text-xs sm:text-sm font-semibold text-gray-400 hover:text-red-600 transition-colors"
            >
              Delete
            </button>
          ) : customer.status === 'waiting' ? (
            <>
              <button
                onClick={() => onMarkReady(customer.id)}
                className="inline-flex items-center gap-1 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 border-orange-400 text-orange-600 font-semibold hover:bg-orange-50 transition-colors text-xs sm:text-sm"
              >
                <Bell size={16} />
                <span className="hidden sm:inline">Mark Ready</span>
                <span className="sm:hidden">Ready</span>
              </button>
              <button
                onClick={() => onSeat(customer.id)}
                className="inline-flex items-center gap-1 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors text-xs sm:text-sm"
              >
                <Check size={16} />
                Seat
              </button>
              <button
                onClick={() => onCancel(customer.id)}
                className="text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : customer.status === 'ready' ? (
            <>
              <button
                onClick={() => onSeat(customer.id)}
                className="inline-flex items-center gap-1 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors text-xs sm:text-sm"
              >
                <Check size={16} />
                Seat
              </button>
              <button
                onClick={() => onCancel(customer.id)}
                className="text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => onDelete(customer.id)}
              className="text-xs sm:text-sm font-semibold text-gray-400 hover:text-red-600 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default function QueueTable({
  customers,
  onMarkReady,
  onSeat,
  onCancel,
  onDelete,
  onEdit,
  isHistoryView,
  isEmpty,
  isLoading,
}: QueueTableProps) {
  return (
    <div className="mt-4">
      {isLoading ? (
        <div className="rounded-lg border border-border bg-white py-12 text-center">
          <p className="text-muted-foreground">Loading queue from the database...</p>
        </div>
      ) : isEmpty ? (
        <div className="rounded-lg border border-border bg-white py-12 text-center">
          <p className="text-muted-foreground">
            No parties waiting. Queue is empty.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {customers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onMarkReady={onMarkReady}
                onSeat={onSeat}
                onCancel={onCancel}
                onDelete={onDelete}
                onEdit={onEdit}
                isHistoryView={isHistoryView}
              />
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-lg border border-border bg-white overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Token
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Party
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Added At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Wait
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <CustomerRow
                    key={customer.id}
                    customer={customer}
                    onMarkReady={onMarkReady}
                    onSeat={onSeat}
                    onCancel={onCancel}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    isHistoryView={isHistoryView}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
