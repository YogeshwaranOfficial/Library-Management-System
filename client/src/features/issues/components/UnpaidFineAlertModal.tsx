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
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 font-sans text-xs sm:text-sm text-text-main text-left animate-fade-in">
      <div className="bg-card-bg w-full max-w-md rounded-2xl border border-rose-100 shadow-2xl overflow-hidden animate-zoom-in">
        {/* Warning Alert Banner Header */}
        <div className="bg-rose-50 px-6 py-5 border-b border-rose-100 flex items-start gap-3.5">
          <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-main">
              Return Blocked: Pending Balance
            </h3>
            <p className="text-[11px] text-rose-700 font-bold mt-0.5 uppercase tracking-wide">
              Financial Validation Exception Bound
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs leading-relaxed text-text-main font-medium">
          <p className="text-slate-500">
            The library core system cannot authorize this inventory shelf
            check-in sequence because an unpaid fine liability matches this
            active operation.
          </p>

          {/* Audit Summary Container */}
          <div className="bg-slate-50 border border-border-main rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 uppercase text-[11px] tracking-wide font-bold">
                Account Holder:
              </span>
              <span className="font-bold text-text-main">{memberName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 uppercase text-[11px] tracking-wide font-bold">
                Asset Volume:
              </span>
              <span className="font-bold text-text-main max-w-48 truncate">
                {bookTitle}
              </span>
            </div>
            <div className="h-px bg-slate-200 my-1.5" />
            <div className="flex justify-between items-center pt-0.5">
              <span className="text-rose-700 font-bold uppercase text-[11px] tracking-wide flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Overdue Debt:
              </span>
              <span className="text-base font-bold  text-text-main">
                {fineAmount && fineAmount > 0
                  ? `₹${fineAmount}.00`
                  : "Calculated at Desk"}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-border-main leading-normal">
            Policy Rule: Outstanding debt liabilities must clear through the
            cash registration counter desk before restoring book items back into
            system catalog slots.
          </p>
        </div>

        {/* Action Controls Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-border-main flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-card-bg text-slate-500 border border-border-main hover:text-text-main font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
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
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              Collect Fine
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
