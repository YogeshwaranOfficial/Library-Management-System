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
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans select-none text-left">
    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden p-6 animate-zoom-in text-center text-[#2D3748]">
      
      {/* Centered Action Icon Container Frame */}
      <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5 bg-amber-50 border border-amber-200">
        <RotateCcw size={28} className="text-amber-600" />
      </div>

      {/* Corporate Styled Header Accent Stack */}
      <h4 className="text-xl font-bold text-[#1A365D] tracking-tight">
        Restore Fine Record
      </h4>

      {/* Description Context Block */}
      <p className="text-sm text-[#718096] leading-relaxed mt-4">
        Are you sure you want to revert the payment transaction for{" "}
        <span className="font-semibold text-[#1A365D]">
          "{fine.memberName}"
        </span>
        ? This will shift the record back to the active overdue list.
      </p>

      {/* Footer Action Control Layout Block Area */}
      <div className="mt-6 pt-5 border-t border-gray-100 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 border border-gray-200 rounded-xl bg-white text-[#2D3748] text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onConfirm(fine.fine_id)}
          className="flex-1 py-2.5 bg-[#2B6CB0] hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
        >
          Restore Entry
        </button>
      </div>

    </div>
  </div>
);
};
