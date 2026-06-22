interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
}

export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
}: DeleteConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-200 animate-zoom-in">
        <div className="text-center">
          <h3 className="text-lg font-bold text-[#1A365D] tracking-tight">
            Confirm Deletion
          </h3>

          <p className="text-sm text-[#2D3748] mt-4 leading-relaxed">
            Are you sure you want to delete{" "}
            <strong className="text-[#1A365D] font-bold">
              {selectedCount === 1 ? "this library member" : `${selectedCount} library members`}
            </strong>?
          </p>

          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-left text-xs text-rose-700 font-medium leading-relaxed">
            <span className="block mb-1 text-[11px] font-bold uppercase tracking-widest text-rose-800">
              Important:
            </span>
            This will only remove their library access. Their main login account will not be deleted.
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-5 border-t border-gray-100 text-xs font-bold tracking-wide">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-white border border-gray-200 text-[#718096] rounded-xl transition-all hover:bg-gray-50 hover:text-[#1A365D] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white rounded-full transition-all cursor-pointer shadow-sm tracking-wide"
          >
            Delete Now
          </button>
        </div>
      </div>
    </div>
  );
};