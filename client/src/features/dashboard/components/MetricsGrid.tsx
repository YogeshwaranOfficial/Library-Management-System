import type { DashboardSummaryMetrics } from "../../../types/dashboard";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  bgClass: string;
  icon: string;
}

const MetricCard = ({ title, value, subtext, bgClass, icon }: MetricCardProps) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex justify-between items-start transition-all hover:shadow-md">
    <div className="space-y-1">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">{title}</span>
      <div className="text-2xl font-bold text-gray-900 tracking-tight">{value}</div>
      {subtext && <p className="text-xs text-gray-400 font-medium italic">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-xl ${bgClass} text-xl shadow-xs`}>{icon}</div>
  </div>
);

export const MetricsGrid = ({ data }: { data: DashboardSummaryMetrics | undefined }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
      <MetricCard 
        title="Total Books" 
        value={data?.totalBooks || 0} 
        subtext={`Total copies: ${data?.totalCopies || 0}`} 
        bgClass="bg-blue-50 text-blue-600" 
        icon="📘" 
      />
      <MetricCard 
        title="Available Books" 
        value={data?.availableBooks || 0} 
        bgClass="bg-emerald-50 text-emerald-600" 
        icon="📄" 
      />
      <MetricCard 
        title="Active Members" 
        value={data?.activeMembers || 0} 
        bgClass="bg-purple-50 text-purple-600" 
        icon="👥" 
      />
      <MetricCard 
        title="Books Overdue" 
        value={data?.overdueCount || 0} 
        subtext={`Late Ratio: ${data?.overduePercentage || 0}%`}
        bgClass="bg-rose-50 text-rose-600" 
        icon="⚠️" 
      />
      <MetricCard 
        title="Outstanding Fines" 
        value={`₹${data?.totalOutstandingFines || 0}`} 
        subtext="Fine rate: ₹10/day" 
        bgClass="bg-amber-50 text-amber-600" 
        icon="🪙" 
      />
    </div>
  );
};