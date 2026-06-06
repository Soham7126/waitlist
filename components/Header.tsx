import { Plus } from 'lucide-react';

interface HeaderProps {
  onAddClick: () => void;
}

export default function Header({ onAddClick }: HeaderProps) {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs sm:text-sm">
              GT
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">The Green Table</h1>
          </div>
          <button
            onClick={onAddClick}
            className="flex items-center gap-1 sm:gap-2 rounded-lg bg-blue-600 px-3 sm:px-6 py-2 sm:py-2.5 text-white font-semibold hover:bg-blue-700 transition-colors flex-shrink-0 text-sm sm:text-base"
          >
            <Plus size={18} className="sm:block" />
            <span className="hidden sm:inline">Add</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>
      </div>
    </header>
  );
}
