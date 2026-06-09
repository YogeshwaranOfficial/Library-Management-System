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
    <div className="fixed inset-0 bg-ocean-blue/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-100 animate-zoom-in">
        <div className="text-center">
          <span className="text-3xl text-rose-500 block mb-2">{mode === "SINGLE" ? "⚠️" : "💥"}</span>
          <h3 className="text-lg font-bold text-gray-900">
            {mode === "SINGLE" ? "Purge Circulation Record" : "Purge Completed History"}
          </h3>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            {mode === "SINGLE" 
              ? `Are you sure you want to delete this issue_book data file for "${titleDetails}"?`
              : "Are you sure you want to permanently delete all circulation entries with a RETURNED status from the system registry?"}
          </p>
        </div>
        <div className="mt-5 flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-3.5 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">Abort</button>
          <button type="button" onClick={onConfirm} className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-all cursor-pointer">
            Confirm Deletion
          </button>
        </div>
      </div>
    </div>
  );
};