import { AlertCircle, TrendingUp } from "lucide-react";

interface FinesBannerProps {
  totalCount: number;
  totalUnpaidAmount: number;
}

export const FinesNotificationBanner = ({ totalCount, totalUnpaidAmount }: FinesBannerProps) => {
  if (totalCount === 0) return null;

  return (
    <div className="bg-linear-to-r from-amber-500 to-orange-600 p-5 rounded-2xl text-white shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slide-in text-left">
      <div className="flex items-center gap-3.5">
        <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-xs shrink-0 flex items-center justify-center">
          <AlertCircle size={18} className="text-white" />
        </div>
        <div>
          <h4 className="font-black text-xs uppercase tracking-wider">Overdue Account Penalties Detected</h4>
          <p className="text-[10px] text-amber-100 font-medium mt-0.5">
            {totalCount} active dynamic resource leaks processed at 12:00 AM tonight.
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 bg-black/10 px-4 py-2.5 rounded-xl border border-white/10 w-full sm:w-auto justify-between shrink-0">
        <div>
          <span className="text-[9px] block text-amber-200 font-black uppercase tracking-wider">Uncollected Portfolio</span>
          <span className="text-base font-black font-data mt-0.5">₹{totalUnpaidAmount.toLocaleString()}.00</span>
        </div>
        <TrendingUp size={14} className="text-amber-200 shrink-0" />
      </div>
    </div>
  );
};