interface QueueTabsProps {
  activeTab: 'active' | 'history';
  onTabChange: (tab: 'active' | 'history') => void;
}

export default function QueueTabs({ activeTab, onTabChange }: QueueTabsProps) {
  return (
    <div className="flex gap-2 border-b border-border overflow-x-auto">
      <button
        onClick={() => onTabChange('active')}
        className={`px-3 sm:px-4 py-2.5 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap transition-colors ${
          activeTab === 'active'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <span className="sm:hidden">Active</span>
        <span className="hidden sm:inline">Active Queue</span>
      </button>
      <button
        onClick={() => onTabChange('history')}
        className={`px-3 sm:px-4 py-2.5 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap transition-colors ${
          activeTab === 'history'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        History
      </button>
    </div>
  );
}
