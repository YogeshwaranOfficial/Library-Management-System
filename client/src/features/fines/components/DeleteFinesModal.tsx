import { AlertTriangle, X, AlertCircle } from "lucide-react";

interface DeleteFinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  memberName?: string;
  amount?: number;
}

export const DeleteFinesModal = ({ isOpen, onClose, onConfirm, memberName, amount }: DeleteFinesModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-secondary/40 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-fade-in text-left">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-light/10 animate-zoom-in">
        
        {/* Top Close Control */}
        <div className="absolute right-4 top-4">
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-light hover:text-slate-secondary transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 text-center">
          {/* Branded Alert Icon */}
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100/50">
            <AlertTriangle size={28} className="text-rose-600" />
          </div>

          <h3 className="text-xs font-black text-slate-secondary uppercase tracking-wider">Purge Fine Invoice</h3>
          
          <p className="text-[11px] text-slate-light font-medium mt-3 leading-relaxed px-2">
            Are you sure you want to permanently delete the ledger invoice totaling <span className="font-data font-black text-rose-600">₹{amount}.00</span> registered against <span className="font-bold text-slate-secondary">"{memberName}"</span>?
          </p>

          {/* Audit Warning Box */}
          <div className="mt-5 p-3.5 bg-rose-50/50 rounded-xl border border-rose-100/60 flex items-start gap-2.5 text-left">
            <AlertCircle size={14} className="text-rose-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-rose-700 font-bold leading-normal uppercase tracking-tight">
              Execution Warning: This action breaks reporting audit history loops. Administrative caution required.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-canvas-dominant border-t border-slate-light/10 flex gap-2">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-slate-light hover:text-slate-secondary bg-white border border-slate-light/10 rounded-xl transition-all cursor-pointer"
          >
            Abort
          </button>
          <button 
            type="button" 
            onClick={onConfirm} 
            className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 shadow-xs rounded-xl transition-all cursor-pointer"
          >
            Delete record
          </button>
        </div>

      </div>
    </div>
  );
};