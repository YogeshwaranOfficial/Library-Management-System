import { AlertTriangle } from "lucide-react";

interface DeleteFinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  memberName?: string;
  amount?: number;
}

export const DeleteFinesModal = ({
  isOpen,
  onClose,
  onConfirm,
  memberName,
  amount,
}: DeleteFinesModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-sans">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden animate-zoom-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-5 bg-white">
          <h3 className="text-lg font-bold text-[#1A365D] tracking-tight">
            Delete Fine Record
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="text-[#718096] hover:text-[#1A365D] hover:bg-gray-100 transition-all cursor-pointer p-1.5 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center text-[#2D3748]">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-5">
            <AlertTriangle size={30} className="text-rose-600" />
          </div>

          <h4 className="text-xl font-bold text-[#1A365D] tracking-tight">
            Confirm Fine Deletion
          </h4>

          <p className="text-sm text-[#718096] leading-relaxed mt-4">
            Are you sure you want to permanently remove the fine amount of
            <span className="font-bold text-rose-600 "> ₹{amount}.00</span>{" "}
            registered against
            <span className="font-semibold text-[#1A365D]">
              {" "}
              "{memberName}"
            </span>
            ?
          </p>

          {/* Warning Card */}
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-left">
            <span className="block text-[11px] font-bold uppercase tracking-widest text-rose-700 mb-2">
              Permanent Action
            </span>

            <p className="text-xs text-rose-800 leading-relaxed font-medium">
              This operation cannot be undone. The selected fine record will be
              permanently removed from the fines ledger, audit history, and
              administrative tracking logs.
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
            Delete Record
          </button>
        </div>
      </div>
    </div>
  );
};
