import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  isPending: boolean;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  isPending,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-secondary/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-utility-crimson/10 overflow-hidden transform transition-all">
        
        {/* Warning Accent Strip */}
        <div className="bg-utility-crimson/10 p-4 flex items-center gap-3 border-b border-utility-crimson/10">
          <div className="p-2 bg-utility-crimson/20 text-utility-crimson rounded-xl">
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-xs text-utility-crimson uppercase tracking-wider">
             Confirm Delete
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isPending}
            className="p-1 text-slate-light hover:text-slate-secondary rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Message Core Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs font-medium text-slate-secondary/90 leading-relaxed">
            Are you sure want to completely delete <strong className="text-slate-secondary font-bold font-sans">"{userName}"</strong> from the library management databases?
          </p>
          <div className="bg-canvas-dominant/60 rounded-xl p-3 border border-slate-light/5">
            <p className="text-[11px] text-utility-crimson font-bold uppercase tracking-wide flex items-center gap-1.5">
              ⚠️ Irreversible Action
            </p>
            <p className="text-[10px] text-slate-light font-medium mt-0.5">
              This will instantly clean out their active profile, active rental parameters, and systemic histories.
            </p>
          </div>
        </div>

        {/* Dynamic Action Buttons */}
        <div className="bg-canvas-dominant p-4 border-t border-slate-light/10 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-light/10 text-slate-secondary hover:bg-slate-light/10 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel 
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-5 py-2 bg-utility-crimson hover:bg-utility-crimson/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Trash2 size={13} /> 
            {isPending ? "Deleting Files..." : "Confirm Delete"}
          </button>
        </div>

      </div>
    </div>
  );
};