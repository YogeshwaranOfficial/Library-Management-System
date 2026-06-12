import { Sparkles } from "lucide-react";

interface SimulatorProps {
  totalOutstanding: number;
  discount: number;
  onChange: (v: number) => void;
}

export const AmnestySimulator = ({
  totalOutstanding,
  discount,
  onChange,
}: SimulatorProps) => {
  const waivedFine = (totalOutstanding * (discount / 100)).toFixed(0);
  const projectedRecovery = (totalOutstanding - Number(waivedFine)).toFixed(0);

  return (
    <div className="bg-card-bg p-6 rounded-2xl border border-border-main/60 shadow-xs space-y-4 text-left font-sans">
      <div>
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={12} className="text-amber-500" /> Bulk Amnesty
          Clearance Simulator
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
          Model the financial recovery outcome of offering a percentage-based
          amnesty fine relief.
        </p>
      </div>

      <div className="p-4 bg-amber-50/40 border border-amber-100 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 text-xs font-bold">
          <span className="text-text-main tracking-wide">
            Relief Rate: {discount}%
          </span>
          <span className="text-amber-700 font-mono">
            Projected Cash Collection: ₹{projectedRecovery}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={discount}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 focus:outline-hidden"
        />
      </div>

      <div className="text-[11px] text-slate-400 font-semibold italic leading-relaxed">
        Offering this clearance drops{" "}
        <span className="text-rose-600 not-italic font-bold">
          ₹{waivedFine}
        </span>{" "}
        in toxic debt and creates an immediate collection incentive for
        unreturned books.
      </div>
    </div>
  );
};
