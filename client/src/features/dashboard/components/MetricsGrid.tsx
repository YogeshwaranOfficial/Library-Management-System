import type { DashboardSummaryMetrics } from "../../../types/dashboard";

// Editorial Visual Assets
import { BookOpen, BookCheck, Users, AlertTriangle, Coins } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  bgClass: string;
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, subtext, bgClass, icon }: MetricCardProps) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex justify-between items-start transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 text-left font-sans">
    <div className="space-y-1.5">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">{title}</span>
      <div className="text-2xl font-bold text-slate-900 tracking-tight font-sans">{value}</div>
      {subtext && <p className="text-[11px] text-slate-400 font-semibold italic">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-xl ${bgClass} shadow-xs shrink-0 flex items-center justify-center`}>
      {icon}
    </div>
  </div>
);

export const MetricsGrid = ({ data }: { data: DashboardSummaryMetrics | undefined }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
      <MetricCard 
        title="Total Books" 
        value={data?.totalBooks || 0} 
        subtext={`Total copies: ${data?.totalCopies || 0}`} 
        bgClass="bg-amber-50/50 text-slate-900 border border-amber-100" 
        icon={<BookOpen size={20} className="text-slate-700" />} 
      />
      <MetricCard 
        title="Available Books" 
        value={data?.availableBooks || 0} 
        bgClass="bg-emerald-50/60 text-emerald-700 border border-emerald-100" 
        icon={<BookCheck size={20} />} 
      />
      <MetricCard 
        title="Active Members" 
        value={data?.activeMembers || 0} 
        bgClass="bg-slate-100 text-slate-800 border border-slate-200/60" 
        icon={<Users size={20} />} 
      />
      <MetricCard 
        title="Books Overdue" 
        value={data?.overdueCount || 0} 
        subtext={`Late Ratio: ${data?.overduePercentage || 0}%`}
        bgClass="bg-rose-50 text-rose-600 border border-rose-100" 
        icon={<AlertTriangle size={20} />} 
      />
      <MetricCard 
        title="Outstanding Fines" 
        value={`₹${data?.totalOutstandingFines || 0}`} 
        subtext="Fine rate: ₹10/day" 
        bgClass="bg-amber-50 text-amber-700 border border-amber-200/70" 
        icon={<Coins size={20} />} 
      />
    </div>
  );
};