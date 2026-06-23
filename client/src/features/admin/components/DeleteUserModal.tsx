import React from "react";

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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans select-none">
      {/* Container: Changed to match the exact reference modal layout theme tokens */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-200 animate-zoom-in">
        <div className="text-center">
          {/* Header: Shifted to match institutional branding header typography rules */}
          <h3 className="text-lg font-bold text-[#1A365D] tracking-tight">
            Confirm User Account Purge
          </h3>

          {/* Main Paragraph: Styled using identical text-color mappings for high editorial legibility */}
          <p className="text-sm text-[#2D3748] mt-4 leading-relaxed">
            Are you sure you want to completely delete the system profile record
            for{" "}
            <strong className="text-[#1A365D] font-bold">"{userName}"</strong>{" "}
            from the library management core engine?
          </p>

          {/* Callout Block: Shipped with premium cream/rose warning surfaces matching reference specs */}
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-left text-xs text-rose-700 font-medium leading-relaxed">
            <span className="block mb-1 text-[11px] font-bold uppercase tracking-widest text-rose-800">
              ⚠️ Irreversible Action:
            </span>
            This process instantly flushes out their system user registry
            parameters, active resource rentals, tracking workflows, and
            systemic archival logs completely.
          </div>
        </div>

        {/* Modal Action Footers - Crisp Touchpoints Matching Reference Layout */}
        <div className="mt-6 flex justify-end gap-3 pt-5 border-t border-gray-100 text-xs font-bold tracking-wide">
          {/* Cancel Button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2.5 bg-white border border-gray-200 text-[#718096] rounded-xl transition-all hover:bg-gray-50 hover:text-[#1A365D] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          {/* Action Button: Dark editorial signature signature button block */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="px-5 py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white rounded-full transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed tracking-wide text-center"
          >
            {isPending ? "Purging Files..." : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};
