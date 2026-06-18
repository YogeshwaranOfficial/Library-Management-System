import { AlertCircle, TrendingUp } from "lucide-react";

interface FinesBannerProps {
  totalCount: number;
  totalUnpaidAmount: number;
}

export const FinesNotificationBanner = ({
  totalCount,
  totalUnpaidAmount,
}: FinesBannerProps) => {
  if (totalCount === 0) return null;

  return (
    <div className="bg-linear-to-r from-[#4b6993] to-[#3c5578] p-5 rounded-2xl text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slide-in text-left text-xs sm:text-sm border border-white/10">
      <div className="flex items-center gap-3.5">
        <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-xs shrink-0 flex items-center justify-center">
          <AlertCircle size={18} className="text-white" />
        </div>
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200">
            Overdue Fines Detected
          </h4>
          <p className="text-[11px] text-slate-300 font-medium mt-0.5">
            There are currently {totalCount} active overdue items requiring
            immediate attention.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 w-full sm:w-auto justify-between shrink-0">
        <div>
          <span className="text-[11px] block text-slate-300 font-bold uppercase tracking-wide">
            Total Outstanding Balance
          </span>
          <span className="text-base font-bold mt-0.5 block">
            ₹{totalUnpaidAmount.toLocaleString()}.00
          </span>
        </div>
        <TrendingUp size={14} className="text-slate-300 shrink-0" />
      </div>
    </div>
  );
};