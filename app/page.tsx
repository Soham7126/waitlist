'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import StatsCards from '@/components/StatsCards';
import QueueTabs from '@/components/QueueTabs';
import QueueTable from '@/components/QueueTable';
import BookingsTab from '@/components/BookingsTab';
import AddBookingModal from '@/components/AddBookingModal';

const AddPartyModal = dynamic(() => import('@/components/AddPartyModal'));
const AnalyticsTab = dynamic(() => import('@/components/AnalyticsTab'));

export interface Customer {
  id: string;
  name: string;
  partySize: number;
  waitTime: number;
  type: string;
  phone?: string;
  tableNumbers: number[];
  addedAt: Date;
  status: 'waiting' | 'ready' | 'seated' | 'cancelled';
  token: string;
}

export interface Booking {
  id: string;
  name: string;
  partySize: number;
  phone?: string;
  type: 'walkin' | 'dineout' | 'swiggy';
  date: string;
  time: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'bookings' | 'analytics'>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);

  const loadCustomers = useCallback(async () => {
    try {
      const response = await fetch('/api/customers');
      if (!response.ok) throw new Error('Failed to load customers');
      const data: Customer[] = await response.json();
      setCustomers(data.map((customer) => ({ ...customer, addedAt: new Date(customer.addedAt) })));
    } catch (error) {
      console.error('Failed to load customers', error);
    }
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      const response = await fetch('/api/bookings');
      if (!response.ok) throw new Error('Failed to load bookings');
      const data: Booking[] = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings', error);
    } finally {
      setIsBookingsLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await loadCustomers();
      setIsLoading(false);
    })();

    void loadBookings();
    const interval = setInterval(() => { void loadCustomers(); }, 60_000);
    return () => clearInterval(interval);
  }, [loadCustomers, loadBookings]);

  const { activeCustomers, seatedCustomers, stats } = useMemo(() => {
    const active: Customer[] = [];
    const seated: Customer[] = [];
    let waiting = 0;
    let ready = 0;
    let seatedToday = 0;
    let activeWaitSum = 0;

    for (const c of customers) {
      if (c.status === 'waiting' || c.status === 'ready') {
        active.push(c);
        activeWaitSum += c.waitTime;
        if (c.status === 'waiting') waiting++;
        else ready++;
      } else {
        seated.push(c);
        if (c.status === 'seated') seatedToday++;
      }
    }

    return {
      activeCustomers: active,
      seatedCustomers: seated,
      stats: {
        waiting,
        ready,
        seatedToday,
        avgWait: active.length === 0 ? 0 : Math.round(activeWaitSum / active.length),
      },
    };
  }, [customers]);

  const handleSaveCustomer = useCallback(async (data: {
    name: string;
    partySize: number;
    waitTime: number;
    type: string;
    phone?: string;
    tableNumbers: number[];
  }) => {
    const response = await fetch('/api/customers', {
      method: editingCustomer ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingCustomer ? { id: editingCustomer.id, ...data } : data),
    });

    if (!response.ok) throw new Error('Failed to add customer');

    const createdCustomer: Customer = await response.json();
    setCustomers((currentCustomers) => {
      const normalizedCustomer = { ...createdCustomer, addedAt: new Date(createdCustomer.addedAt) };
      return editingCustomer
        ? currentCustomers.map((customer) => customer.id === editingCustomer.id ? normalizedCustomer : customer)
        : [...currentCustomers, normalizedCustomer];
    });
    setEditingCustomer(null);
  }, [editingCustomer]);

  const handleSaveBooking = useCallback(async (data: {
    name: string;
    partySize: number;
    phone?: string;
    type: 'walkin' | 'dineout' | 'swiggy';
    date: string;
    time: string;
  }) => {
    if (editingBooking) {
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingBooking.id, ...data }),
      });
      if (!response.ok) throw new Error('Failed to update booking');
      const updatedBooking: Booking = await response.json();
      setBookings((prev) => prev.map((b) => b.id === editingBooking.id ? updatedBooking : b));
    } else {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add booking');
      const newBooking: Booking = await response.json();
      setBookings((prev) => [...prev, newBooking]);
    }
    setEditingBooking(null);
  }, [editingBooking]);

  const handleStatusChange = useCallback(async (id: string, status: Customer['status']) => {
    const response = await fetch(`/api/customers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) throw new Error('Failed to update customer status');

    const updatedCustomer: Customer = await response.json();
    setCustomers((currentCustomers) =>
      currentCustomers.map((customer) => customer.id === id ? { ...updatedCustomer, addedAt: new Date(updatedCustomer.addedAt) } : customer)
    );
  }, []);

  const handleMarkReady = useCallback((id: string) => { void handleStatusChange(id, 'ready').catch(console.error); }, [handleStatusChange]);
  const handleUndoReady = useCallback((id: string) => { void handleStatusChange(id, 'waiting').catch(console.error); }, [handleStatusChange]);
  const handleSeat = useCallback((id: string) => { void handleStatusChange(id, 'seated').catch(console.error); }, [handleStatusChange]);
  const handleCancel = useCallback((id: string) => { void handleStatusChange(id, 'cancelled').catch(console.error); }, [handleStatusChange]);

  const handleDeleteCustomer = useCallback(async (id: string) => {
    const response = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete customer');
    setCustomers((currentCustomers) => currentCustomers.filter((customer) => customer.id !== id));
  }, []);

  const handleDeleteBooking = useCallback(async (id: string) => {
    const response = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete booking');
    setBookings((prev) => prev.filter((booking) => booking.id !== id));
  }, []);

  const handleEditCustomer = useCallback((customer: Customer) => { setEditingCustomer(customer); setIsModalOpen(true); }, []);
  const handleCloseCustomerModal = useCallback(() => { setIsModalOpen(false); setEditingCustomer(null); }, []);
  const handleOpenBookingModal = useCallback(() => { setEditingBooking(null); setIsBookingModalOpen(true); }, []);
  const handleEditBooking = useCallback((booking: Booking) => { setEditingBooking(booking); setIsBookingModalOpen(true); }, []);
  const handleCloseBookingModal = useCallback(() => { setIsBookingModalOpen(false); setEditingBooking(null); }, []);

  const customerModalInitialValues = editingCustomer
    ? {
        name: editingCustomer.name,
        partySize: String(editingCustomer.partySize),
        waitTime: String(editingCustomer.waitTime),
        type: editingCustomer.type,
        phone: editingCustomer.phone ?? '',
        tableNumbers: editingCustomer.tableNumbers?.join(', ') ?? '',
      }
    : undefined;

  const bookingModalInitialValues = editingBooking
    ? {
        name: editingBooking.name,
        partySize: String(editingBooking.partySize),
        phone: editingBooking.phone ?? '',
        type: editingBooking.type,
        date: editingBooking.date,
        time: editingBooking.time,
      }
    : undefined;

  const displayCustomers = activeTab === 'active' ? activeCustomers : seatedCustomers;

  const handleTabChange = (tab: 'active' | 'history' | 'bookings' | 'analytics') => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onAddClick={() => setIsModalOpen(true)} onAddBookingClick={handleOpenBookingModal} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-8">
        <StatsCards stats={stats} />

        <div className="mt-6 sm:mt-8">
          <QueueTabs activeTab={activeTab} onTabChange={handleTabChange} />
          {activeTab === 'analytics' ? (
            <AnalyticsTab customers={customers} />
          ) : activeTab === 'bookings' ? (
            <BookingsTab
              bookings={bookings}
              onAddBooking={handleOpenBookingModal}
              onEditBooking={handleEditBooking}
              onDeleteBooking={handleDeleteBooking}
              isLoading={isBookingsLoading}
            />
          ) : (
            <QueueTable
              customers={displayCustomers}
              onMarkReady={handleMarkReady}
              onUndoReady={handleUndoReady}
              onSeat={handleSeat}
              onCancel={handleCancel}
              onDelete={handleDeleteCustomer}
              onEdit={handleEditCustomer}
              isHistoryView={activeTab === 'history'}
              isEmpty={displayCustomers.length === 0}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      <AddPartyModal
        isOpen={isModalOpen}
        mode={editingCustomer ? 'edit' : 'add'}
        initialValues={customerModalInitialValues}
        onClose={handleCloseCustomerModal}
        onSubmit={handleSaveCustomer}
      />

      <AddBookingModal
        isOpen={isBookingModalOpen}
        mode={editingBooking ? 'edit' : 'add'}
        initialValues={bookingModalInitialValues}
        onClose={handleCloseBookingModal}
        onSubmit={handleSaveBooking}
      />
    </div>
  );
}
