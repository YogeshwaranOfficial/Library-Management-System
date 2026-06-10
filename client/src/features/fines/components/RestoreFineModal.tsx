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
    <div className="fixed inset-0 bg-slate-secondary/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in text-left">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-light/10 animate-zoom-in">
        <div className="text-center">
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <RotateCcw size={20} className="text-amber-600" />
          </div>
          <h3 className="text-xs font-black text-slate-secondary uppercase tracking-wider">Restore Ledger Entry</h3>
          <p className="text-[11px] text-slate-light font-medium mt-2.5 leading-relaxed">
            Are you sure you want to revert the payment transaction for <span className="font-bold text-slate-secondary">"{fine.memberName}"</span>? This will shift the record securely back to the Active Defaulters view deck.
          </p>
        </div>
        
        <div className="mt-5 pt-1 flex gap-3">
          <button 
            type="button"
            onClick={onClose} 
            className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider bg-canvas-dominant hover:bg-slate-light/10 text-slate-light hover:text-slate-secondary rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={() => onConfirm(fine.fine_id)} 
            className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Restore Entry
          </button>
        </div>
      </div>
    </div>
  );
};