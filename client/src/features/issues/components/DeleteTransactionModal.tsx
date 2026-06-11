import { Trash2, AlertOctagon, X } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mode: "SINGLE" | "BULK_CLEAN";
  titleDetails?: string;
}

export const DeleteTransactionModal = ({ isOpen, onClose, onConfirm, mode, titleDetails }: DeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans text-xs sm:text-sm text-slate-700 text-left animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 animate-zoom-in">
        
        {/* Warning Indicator Context Accent Strip */}
        <div className="bg-rose-50 px-5 py-4 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-rose-100 rounded-lg text-rose-600">
              {mode === "SINGLE" ? <AlertOctagon size={16} /> : <Trash2 size={16} />}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {mode === "SINGLE" ? "Purge Circulation Record" : "Purge Completed History"}
              </h3>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Informational Core Content block */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {mode === "SINGLE" ? (
              <>
                Are you sure you want to delete this <span className="font-bold text-slate-900">issue_book</span> data file for <span className="font-bold text-slate-900">"{titleDetails}"</span>?
              </>
            ) : (
              "Are you sure you want to permanently delete all circulation entries with a RETURNED status from the system registry?"
            )}
          </p>

          <div className="text-[11px] bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl font-medium leading-normal">
            ⚠️ Warning: This administrative destruction execution cannot be undone. System database records will alter instantly.
          </div>
        </div>

        {/* Control Desk Actions Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
          >
            Abort
          </button>
          <button 
            type="button" 
            onClick={onConfirm} 
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 shadow-xs rounded-xl transition-all cursor-pointer"
          >
            Confirm Deletion
          </button>
        </div>

      </div>
    </div>
  );
};