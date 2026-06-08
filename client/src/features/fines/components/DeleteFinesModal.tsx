interface DeleteFinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  memberName?: string;
  amount?: number;
}

export const DeleteFinesModal = ({ isOpen, onClose, onConfirm, memberName, amount }: DeleteFinesModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-ocean-blue/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-100 animate-zoom-in">
        <div className="text-center">
          <span className="text-3xl text-rose-500 block mb-2">⚠️</span>
          <h3 className="text-lg font-bold text-gray-900">Delete Fine</h3>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Are you sure you want to permanently delete the fine ledger invoice totaling <span className="font-bold text-gray-900">₹{amount}.00</span> registered against account holder <span className="font-bold text-gray-900">"{memberName}"</span>?
          </p>
          <p className="text-[10px] text-rose-600 bg-rose-50 border border-rose-100 p-2 rounded-lg mt-3 font-medium">
            Warning: This action breaks reporting audit history loops. Proceed with caution.
          </p>
        </div>
        <div className="mt-5 flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-3.5 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">Cancel</button>
          <button type="button" onClick={onConfirm} className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-all cursor-pointer">
            Delete record
          </button>
        </div>
      </div>
    </div>
  );
};