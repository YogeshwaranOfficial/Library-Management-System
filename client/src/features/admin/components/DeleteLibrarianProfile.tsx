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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans select-none">
      {/* Container: Matches the clean off-white base with soft linen-amber border */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-200">
        <div className="text-center">
          {/* Header: Crisp text-base alignment with deep slate-ink tone */}
          <h3 className="text-lg font-bold text-[#1A365D] tracking-tight">
            Revoke Administrative Access
          </h3>

          {/* Main Paragraph: Structured at text-sm slate-600 for high editorial legibility */}
          <p className="text-sm text-[#2D3748] mt-4 leading-relaxed">
            Are you completely confident about stripping{" "}
            <strong className="text-[#1A365D] font-bold">
              "{librarianName}"
            </strong>{" "}
            of all administrative privileges and access layers?
          </p>

          {/* Callout Block: Shipped with premium cream/rose warning surface tokens */}
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-left text-xs text-rose-700 font-medium leading-relaxed">
            <span className="block mb-1 text-[11px] font-bold uppercase tracking-widest text-rose-800">
              ⚠️ Critical Reminder:
            </span>
            This action completely cleanses their system profile registry. They
            will instantly lose terminal authentication rights and management
            access across the network.
          </div>
        </div>

        {/* Modal Action Footers - Crisp Touchpoints */}
        <div className="mt-6 flex justify-end gap-3 pt-5 border-t border-gray-100 text-xs font-bold tracking-wide">
          {/* Cancel/Abort Button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2.5 bg-white border border-gray-200 text-[#718096] rounded-xl transition-all hover:bg-gray-50 hover:text-[#1A365D] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Abort
          </button>

          {/* Action Button: Dark editorial signature signature button block */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="px-5 py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white rounded-full transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-center"
          >
            {isPending ? "Revoking..." : "Confirm Deletion"}
          </button>
        </div>
      </div>
    </div>
  );
};
