'use client';

import { Plus, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface HeaderProps {
  onAddClick: () => void;
  onAddBookingClick: () => void;
}

export default function Header({ onAddClick, onAddBookingClick }: HeaderProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await fetch('/api/auth', { method: 'DELETE' });
    router.refresh();
    router.push('/login');
  };

  return (
    <header className="border-b border-border bg-background sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">The Green Table</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={onAddBookingClick}
              className="flex items-center gap-1 sm:gap-2 rounded-lg bg-green-600 px-3 sm:px-6 py-2 sm:py-2.5 text-white font-semibold hover:bg-green-700 transition-colors text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Booking</span>
              <span className="sm:hidden">Book</span>
            </button>
            <button
              onClick={onAddClick}
              className="flex items-center gap-1 sm:gap-2 rounded-lg bg-blue-600 px-3 sm:px-6 py-2 sm:py-2.5 text-white font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <Plus size={18} className="sm:block" />
              <span className="hidden sm:inline">Add</span>
              <span className="sm:hidden">+</span>
            </button>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              title="Sign out"
              className="flex items-center gap-1 sm:gap-2 rounded-lg border border-border px-3 sm:px-4 py-2 sm:py-2.5 text-muted-foreground font-semibold hover:bg-muted hover:text-foreground transition-colors text-sm sm:text-base disabled:opacity-50"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
