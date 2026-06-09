import { RotateCcw } from "lucide-react";
import type { FineRecord } from "../../../types/fines";

interface RestoreFineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  fine: FineRecord | null;
}

export const RestoreFineModal = ({ isOpen, onClose, onConfirm, fine }: RestoreFineModalProps) => {
  if (!isOpen || !fine) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-100 animate-zoom-in">
        <div className="text-center">
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Restore Ledger Entry</h3>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Are you sure you want to revert the payment for <span className="font-bold text-gray-900">"{fine.memberName}"</span>? This will move the record back to the Active Defaulters list and re-calculate the total fine amount.
          </p>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
          <button 
            onClick={() => onConfirm(fine.fine_id)} 
            className="flex-1 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-all"
          >
            Restore Entry
          </button>
        </div>
      </div>
    </div>
  );
};