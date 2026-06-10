import { ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";

interface UnpaidFineAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  bookTitle: string;
  fineAmount?: number;
  onNavigateToFines?: () => void;
}

export const UnpaidFineAlertModal = ({
  isOpen,
  onClose,
  memberName,
  bookTitle,
  fineAmount,
  onNavigateToFines,
}: UnpaidFineAlertModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-secondary/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl border border-rose-100 shadow-2xl overflow-hidden animate-zoom-in text-left">
        
        {/* Warning Alert Banner Header */}
        <div className="bg-rose-50/50 px-6 py-5 border-b border-rose-100/60 flex items-start gap-3.5">
          <div className="p-2 bg-rose-100/80 rounded-xl text-rose-600 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-secondary">Return Blocked: Pending Balance</h3>
            <p className="text-[9px] text-rose-700 font-black mt-0.5 uppercase tracking-widest">
              Financial Validation Exception Bound
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs leading-relaxed text-slate-secondary font-medium">
          <p className="text-slate-light">
            The library core system cannot authorize this inventory shelf check-in sequence because an unpaid fine liability matches this active operation.
          </p>

          {/* Audit Summary Container */}
          <div className="bg-canvas-dominant border border-slate-light/10 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-light uppercase text-[9px] tracking-wider font-bold">Account Holder:</span>
              <span className="font-bold text-slate-secondary">{memberName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-light uppercase text-[9px] tracking-wider font-bold">Asset Volume:</span>
              <span className="font-bold text-slate-secondary max-w-48 truncate">{bookTitle}</span>
            </div>
            <div className="h-px bg-slate-light/10 my-1.5" />
            <div className="flex justify-between items-center pt-0.5">
              <span className="text-rose-700 font-black uppercase text-[10px] tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Overdue Debt:
              </span>
              <span className="text-base font-black font-data text-slate-secondary">
                {fineAmount && fineAmount > 0 ? `₹${fineAmount}.00` : "Calculated at Desk"}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-light italic bg-canvas-dominant/40 p-3 rounded-xl border border-slate-light/5 leading-normal">
            Policy Rule: Outstanding debt liabilities must clear through the cash registration counter desk before restoring book items back into system catalog slots.
          </p>
        </div>

        {/* Action Controls Footer */}
        <div className="px-6 py-4 bg-canvas-dominant border-t border-slate-light/10 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white text-slate-light border border-slate-light/10 hover:text-slate-secondary font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            Dismiss Alert
          </button>
          
          {onNavigateToFines && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToFines();
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              Collect Fine Counter <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};