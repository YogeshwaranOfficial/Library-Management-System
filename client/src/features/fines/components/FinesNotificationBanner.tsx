import { AlertCircle, TrendingUp } from "lucide-react";

interface FinesBannerProps {
  totalCount: number;
  totalUnpaidAmount: number;
}

export const FinesNotificationBanner = ({ totalCount, totalUnpaidAmount }: FinesBannerProps) => {
  if (totalCount === 0) return null;

  return (
    <div className="bg-linear-to-r from-amber-500 to-orange-600 p-4 rounded-2xl text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-slide-in">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
          <AlertCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-bold text-sm tracking-wide uppercase">Overdue Account Penalties Detected</h4>
          <p className="text-2xs text-amber-100 font-medium">
            {totalCount} active dynamic resource leaks processed at 12:00 AM tonight.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 bg-black/10 px-4 py-2 rounded-xl border border-white/10 w-full sm:w-auto justify-between">
        <div className="text-left">
          <span className="text-3xs block text-amber-200 font-bold uppercase tracking-wider">Uncollected Portfolio</span>
          <span className="text-base font-black font-mono">₹{totalUnpaidAmount.toLocaleString()}.00</span>
        </div>
        <TrendingUp className="w-4 h-4 text-amber-200" />
      </div>
    </div>
  );
};