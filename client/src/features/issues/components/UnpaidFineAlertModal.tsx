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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl border border-rose-100 shadow-2xl overflow-hidden animate-zoom-in">
        
        {/* Warning Alert Banner Header */}
        <div className="bg-rose-50 px-6 py-5 border-b border-rose-100 flex items-start gap-3.5">
          <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Return Blocked: Unpaid Fine</h3>
            <p className="text-2xs text-rose-700 font-semibold mt-0.5 uppercase tracking-wider">
              Financial Validation Constraint
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs leading-relaxed text-gray-600">
          <p>
            The circulation ledger cannot accept this book return because an outstanding fine sequence is active on the borrower's account profile.
          </p>

          {/* Audit Summary Container */}
          <div className="bg-slate-50 border border-gray-200 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Account Holder:</span>
              <span className="font-bold text-gray-900">{memberName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Asset Context:</span>
              <span className="font-bold text-gray-900 max-w-50 truncate">{bookTitle}</span>
            </div>
            <div className="h-px bg-gray-200 my-1" />
            <div className="flex justify-between items-center pt-0.5">
              <span className="text-rose-700 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Pending Balance:
              </span>
              <span className="text-base font-black font-mono text-gray-950">
                ₹{fineAmount && fineAmount > 0 ? `${fineAmount}.00` : "Calculated at Desk"}
              </span>
            </div>
          </div>

          <p className="text-3xs text-gray-400 italic bg-gray-50 p-2.5 rounded-lg border border-gray-100">
            Note: Institutional policy dictates that cash registration updates must clear through the banking ledger before updating live warehouse stock allocation parameters.
          </p>
        </div>

        {/* Action Controls Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-2.5 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Dismiss Alert
          </button>
          
          {onNavigateToFines && (
            <button
              onClick={() => {
                onClose();
                onNavigateToFines();
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              Collect Fine Counter <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};