import { Trash2, AlertOctagon } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mode: "SINGLE" | "BULK_CLEAN";
  titleDetails?: string;
}

export const DeleteTransactionModal = ({
  isOpen,
  onClose,
  onConfirm,
  mode,
  titleDetails,
}: DeleteModalProps) => {
  if (!isOpen) return null;

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-sans">
    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden animate-zoom-in">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-5 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
            {mode === "SINGLE" ? (
              <AlertOctagon size={18} className="text-rose-600" />
            ) : (
              <Trash2 size={18} className="text-rose-600" />
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#1A365D] tracking-tight">
              {mode === "SINGLE"
                ? "Delete Circulation Record"
                : "Delete Returned History"}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-[#718096] hover:text-[#1A365D] hover:bg-gray-100 transition-all cursor-pointer p-1.5 rounded-full"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-6 text-[#2D3748]">
        <p className="text-sm text-[#718096] leading-relaxed">
          {mode === "SINGLE" ? (
            <>
              Are you sure you want to permanently remove the circulation
              record for
              <span className="font-semibold text-[#1A365D]">
                {" "}
                "{titleDetails}"
              </span>
              ?
            </>
          ) : (
            <>
              Are you sure you want to permanently remove all circulation
              records that currently have a
              <span className="font-semibold text-[#1A365D]">
                {" "}
                RETURNED
              </span>
              {" "}status?
            </>
          )}
        </p>

        {/* Warning Card */}
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <span className="block text-[11px] font-bold uppercase tracking-widest text-rose-700 mb-2">
            Permanent Action
          </span>

          <p className="text-xs text-rose-800 leading-relaxed font-medium">
            This operation cannot be undone. Deleted circulation records will
            be permanently removed from the system database and administrative
            audit history.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t border-gray-200 p-5 bg-white">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-[#2D3748] text-sm font-semibold hover:bg-gray-50 transition-all cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className="px-5 py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-sm"
        >
          Confirm Delete
        </button>
      </div>
    </div>
  </div>
);
};
