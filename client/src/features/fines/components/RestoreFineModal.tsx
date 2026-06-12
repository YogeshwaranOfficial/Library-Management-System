import { RotateCcw } from "lucide-react";
import type { FineRecord } from "../../../types/fines";

interface RestoreFineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  fine: FineRecord | null;
}

export const RestoreFineModal = ({
  isOpen,
  onClose,
  onConfirm,
  fine,
}: RestoreFineModalProps) => {
  if (!isOpen || !fine) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans text-xs sm:text-sm text-text-main text-left animate-fade-in">
      <div className="bg-card-bg rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-border-main animate-zoom-in">
        <div className="text-center">
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <RotateCcw size={20} className="text-amber-600" />
          </div>
          <h3 className="text-xs font-bold text-text-main uppercase tracking-wide">
            Restore Fine Record
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-2.5 leading-relaxed">
            Are you sure you want to revert the payment transaction for{" "}
            <span className="font-bold text-text-main">
              "{fine.memberName}"
            </span>
            ? This will shift the record back to the active overdue list.
          </p>
        </div>

        <div className="mt-5 pt-1 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-text-main border border-border-main rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(fine.fine_id)}
            className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Restore Entry
          </button>
        </div>
      </div>
    </div>
  );
};
