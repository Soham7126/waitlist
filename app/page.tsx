'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import StatsCards from '@/components/StatsCards';
import QueueTabs from '@/components/QueueTabs';
import QueueTable from '@/components/QueueTable';
import AddPartyModal from '@/components/AddPartyModal';
import AnalyticsTab from '@/components/AnalyticsTab';

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

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'analytics'>('active');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await fetch('/api/customers');

        if (!response.ok) {
          throw new Error('Failed to load customers');
        }

        const data: Customer[] = await response.json();
        setCustomers(
          data.map((customer) => ({
            ...customer,
            addedAt: new Date(customer.addedAt),
          }))
        );
      } catch (error) {
        console.error('Failed to load customers', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCustomers();

    // Refresh every 60 seconds so the analytics graph stays up to date
    const interval = setInterval(() => { void loadCustomers(); }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const activeCustomers = customers.filter((c) => c.status === 'waiting' || c.status === 'ready');
  const seatedCustomers = customers.filter((c) => c.status === 'seated' || c.status === 'cancelled');

  const stats = {
    waiting: customers.filter((c) => c.status === 'waiting').length,
    ready: customers.filter((c) => c.status === 'ready').length,
    seatedToday: customers.filter((c) => c.status === 'seated').length,
    avgWait:
      activeCustomers.length === 0
        ? 0
        : Math.round(
            activeCustomers.reduce((sum, c) => sum + c.waitTime, 0) /
              activeCustomers.length
          ),
  };

  const handleSaveCustomer = async (data: {
    name: string;
    partySize: number;
    waitTime: number;
    type: string;
    phone?: string;
    tableNumbers: number[];
  }) => {
    const response = await fetch('/api/customers', {
      method: editingCustomer ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        editingCustomer ? { id: editingCustomer.id, ...data } : data
      ),
    });

    if (!response.ok) {
      throw new Error('Failed to add customer');
    }

    const createdCustomer: Customer = await response.json();
    setCustomers((currentCustomers) => {
      const normalizedCustomer = {
        ...createdCustomer,
        addedAt: new Date(createdCustomer.addedAt),
      };

      return editingCustomer
        ? currentCustomers.map((customer) =>
            customer.id === editingCustomer.id ? normalizedCustomer : customer
          )
        : [...currentCustomers, normalizedCustomer];
    });
    setEditingCustomer(null);
  };

  const handleStatusChange = async (id: string, status: Customer['status']) => {
    const response = await fetch(`/api/customers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update customer status');
    }

    const updatedCustomer: Customer = await response.json();
    setCustomers((currentCustomers) =>
      currentCustomers.map((customer) =>
        customer.id === id
          ? {
              ...updatedCustomer,
              addedAt: new Date(updatedCustomer.addedAt),
            }
          : customer
      )
    );
  };

  const handleMarkReady = (id: string) => {
    void handleStatusChange(id, 'ready').catch((error) => {
      console.error('Failed to mark customer ready', error);
    });
  };

  const handleSeat = (id: string) => {
    void handleStatusChange(id, 'seated').catch((error) => {
      console.error('Failed to seat customer', error);
    });
  };

  const handleCancel = (id: string) => {
    void handleStatusChange(id, 'cancelled').catch((error) => {
      console.error('Failed to cancel customer', error);
    });
  };

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/customers/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete customer');
    }

    setCustomers((currentCustomers) => currentCustomers.filter((customer) => customer.id !== id));
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const modalInitialValues = editingCustomer
    ? {
        name: editingCustomer.name,
        partySize: String(editingCustomer.partySize),
        waitTime: String(editingCustomer.waitTime),
        type: editingCustomer.type,
        phone: editingCustomer.phone ?? '',
        tableNumbers: editingCustomer.tableNumbers?.join(', ') ?? '',
      }
    : undefined;

  const displayCustomers = activeTab === 'active' ? activeCustomers : seatedCustomers;

  const handleTabChange = (tab: 'active' | 'history' | 'analytics') => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onAddClick={() => setIsModalOpen(true)} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-8">
        <StatsCards stats={stats} />

        <div className="mt-6 sm:mt-8">
          <QueueTabs activeTab={activeTab} onTabChange={handleTabChange} />
          {activeTab === 'analytics' ? (
            <AnalyticsTab customers={customers} />
          ) : (
            <QueueTable
              customers={displayCustomers}
              onMarkReady={handleMarkReady}
              onSeat={handleSeat}
              onCancel={handleCancel}
              onDelete={handleDelete}
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
        initialValues={modalInitialValues}
        onClose={handleCloseModal}
        onSubmit={handleSaveCustomer}
      />
    </div>
  );
}
