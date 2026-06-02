interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  bgClass: string;
  icon: string;
}

interface DashboardSummary {
  totalBooks?: number;
  availableBooks?: number;
  activeMembers?: number;
  overdueCount?: string | number;
  totalFines?: number;
}

const MetricCard = ({ title, value, subtext, bgClass, icon }: MetricCardProps) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start">
    <div className="space-y-1">
      <span className="text-sm font-medium text-gray-500">{title}</span>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
    </div>
    <div className={`p-2.5 rounded-lg ${bgClass} text-xl`}>{icon}</div>
  </div>
);

export const MetricsGrid = ({ data }: { data: DashboardSummary | undefined }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <MetricCard title="Total Books" value={data?.totalBooks || "1,500 Books"} subtext="copies: 4,500" bgClass="bg-blue-50 text-blue-600" icon="📘" />
      <MetricCard title="Available Books" value={data?.availableBooks || "3,200 available"} bgClass="bg-green-50 text-green-600" icon="📄" />
      <MetricCard title="Active Members" value={data?.activeMembers || "450"} bgClass="bg-purple-50 text-purple-600" icon="👥" />
      <MetricCard title="Books Overdue" value={data?.overdueCount || "35 (2.3%)"} bgClass="bg-red-50 text-red-600" icon="⚠️" />
      <MetricCard title="Total Outstanding Fines" value={`₹${data?.totalFines || "15,400"}`} subtext="Daily rate: ₹10/day" bgClass="bg-amber-50 text-amber-600" icon="🪙" />
    </div>
  );
};