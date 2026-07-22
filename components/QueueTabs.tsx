interface QueueTabsProps {
  activeTab: 'active' | 'history' | 'bookings' | 'analytics';
  onTabChange: (tab: 'active' | 'history' | 'bookings' | 'analytics') => void;
}

export default function QueueTabs({ activeTab, onTabChange }: QueueTabsProps) {
  const tabs: { key: 'active' | 'history' | 'bookings' | 'analytics'; label: string; shortLabel: string }[] = [
    { key: 'active', label: 'Active Queue', shortLabel: 'Active' },
    { key: 'history', label: 'History', shortLabel: 'History' },
    { key: 'bookings', label: 'Bookings', shortLabel: 'Bookings' },
    { key: 'analytics', label: 'Analytics', shortLabel: 'Analytics' },
  ];

  return (
    <div className="flex gap-2 border-b border-border overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-3 sm:px-4 py-2.5 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap transition-colors ${
            activeTab === tab.key
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="sm:hidden">{tab.shortLabel}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
