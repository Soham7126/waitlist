import { Clock, Bell, Users, Hourglass } from 'lucide-react';

interface StatsCardProps {
  stats: {
    waiting: number;
    ready: number;
    seatedToday: number;
    avgWait: number;
  };
}

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size: number; className?: string }>;
  color: string;
}) => {
  return (
    <div className="rounded-xl bg-white p-4 sm:p-6 border border-border">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">{value}</p>
        </div>
        <Icon size={20} className={`flex-shrink-0 sm:size-6 ${color}`} />
      </div>
    </div>
  );
};

export default function StatsCards({ stats }: StatsCardProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Waiting"
        value={stats.waiting}
        icon={Clock}
        color="text-blue-500"
      />
      <StatCard
        label="Ready"
        value={stats.ready}
        icon={Bell}
        color="text-orange-500"
      />
      <StatCard
        label="Seated Today"
        value={stats.seatedToday}
        icon={Users}
        color="text-teal-500"
      />
      <StatCard
        label="Avg Wait"
        value={`${stats.avgWait}m`}
        icon={Hourglass}
        color="text-blue-500"
      />
    </div>
  );
}
