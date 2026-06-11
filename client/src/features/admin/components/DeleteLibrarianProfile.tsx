import React from "react";

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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
      {/* Container: Matches the clean off-white base with soft linen-amber border */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-amber-100/80 animate-zoom-in">
        
        <div className="text-center">
          {/* Header: Crisp text-base alignment with deep slate-ink tone */}
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Revoke Administrative Access
          </h3>
          
          {/* Main Paragraph: Structured at text-sm slate-600 for high editorial legibility */}
          <p className="text-sm text-slate-600 mt-4 leading-relaxed">
            Are you completely confident about stripping{" "}
            <strong className="text-slate-900 font-bold">"{librarianName}"</strong> of all administrative privileges and access layers?
          </p>
          
          {/* Callout Block: Shipped with premium cream/rose warning surface tokens */}
          <div className="text-xs text-rose-900 font-medium mt-5 bg-rose-50/60 border border-rose-100 p-4 rounded-xl text-left leading-relaxed">
            <span className="font-bold uppercase tracking-wider block mb-1 text-rose-950 text-[11px]">
              ⚠️ Critical Reminder:
            </span>
            This action completely cleanses their system profile registry. They will instantly lose terminal authentication rights and management access across the network.
          </div>
        </div>
        
        {/* Modal Action Footers - Crisp Touchpoints */}
        <div className="mt-6 flex justify-end gap-3 pt-5 border-t border-slate-100 text-xs font-bold tracking-wide">
          
          {/* Cancel/Abort Button */}
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isPending}
            className="px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl transition-all hover:bg-slate-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Abort
          </button>
          
          {/* Action Button: Dark editorial signature signature button block */}
          <button 
            type="button" 
            onClick={onConfirm} 
            disabled={isPending}
            className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-amber-50 rounded-xl transition-all cursor-pointer shadow-sm disabled:bg-slate-700 disabled:cursor-not-allowed min-w-32.5 text-center"
          >
            {isPending ? "Revoking..." : "Confirm Deletion"}
          </button>
          
        </div>
      </div>
    </div>
  );
};