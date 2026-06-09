import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteLibrarianProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  librarianName: string;
  isPending: boolean;
}

export const DeleteLibrarianProfile: React.FC<DeleteLibrarianProfileProps> = ({
  isOpen,
  onClose,
  onConfirm,
  librarianName,
  isPending,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-secondary/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-utility-crimson/10 overflow-hidden">
        
        {/* Urgent Attention Header */}
        <div className="bg-utility-crimson/10 p-4 flex items-center gap-3 border-b border-utility-crimson/10">
          <div className="p-2 bg-utility-crimson/20 text-utility-crimson rounded-xl">
            <AlertTriangle size={18} />
          </div>
          <h3 className="font-bold text-xs text-utility-crimson uppercase tracking-wider flex-1">
            Delete Librarain Account
          </h3>
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isPending}
            className="p-1 text-slate-light hover:text-slate-secondary rounded-lg cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Warning Details Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs font-medium text-slate-secondary/90 leading-relaxed">
            Are you completely confident about deleting <strong className="text-slate-secondary font-bold">"{librarianName}"</strong> of all administrative privileges and access layers?
          </p>
          <div className="bg-canvas-dominant/60 rounded-xl p-3 border border-slate-light/5">
            <p className="text-[11px] text-utility-crimson font-bold uppercase tracking-wide">
              ⚠️ Reminder
            </p>
            <p className="text-[10px] text-slate-light font-medium mt-0.5">
              This completely cleanses their profile registry. They will instantly lose access to management terminals.
            </p>
          </div>
        </div>

        {/* Control Footer Tray */}
        <div className="bg-canvas-dominant p-4 border-t border-slate-light/10 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-light/10 text-slate-secondary hover:bg-slate-light/10 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            Abort
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-5 py-2 bg-utility-crimson hover:bg-utility-crimson/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Trash2 size={13} /> 
            {isPending ? "Revoking..." : "Confirm Deletion"}
          </button>
        </div>

      </div>
    </div>
  );
};