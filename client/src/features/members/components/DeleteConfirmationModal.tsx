interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  memberName: string;
}

export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  memberName,
}: DeleteConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
      {/* Container: Changed to an off-white/ivory-tint base with a soft linen-amber border */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-200 animate-zoom-in">
        <div className="text-center">
          {/* Header: Shifted from text-sm to text-base, using a deeper, slate-ink tone */}
          <h3 className="text-lg font-bold text-[#1A365D] tracking-tight">
            Confirm Member Deletion
          </h3>

          {/* Main Paragraph: Softened slightly to slate-600 for optimal readability */}
          <p className="text-sm text-[#2D3748] mt-4 leading-relaxed">
            Are you sure you want to delete the library member record for{" "}
            <strong className="text-[#1A365D] font-bold">{memberName}</strong>?
          </p>

          {/* Callout Block: Shifted to a premium cream/rose warning surface with refined typography rules */}
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-left text-xs text-rose-700 font-medium leading-relaxed">
            <span className="block mb-1 text-[11px] font-bold uppercase tracking-widest text-rose-800">
              Notice:
            </span>
            This action removes the library member profile tier assignment only.
            The underlying system user account credentials will not be deleted.
          </div>
        </div>

        {/* Modal Action Footers - Clear Call to Action */}
        <div className="mt-6 flex justify-end gap-3 pt-5 border-t border-gray-100 text-xs font-bold tracking-wide">
          {/* Cancel Button: Crisp off-white tactile styling */}
          <button
            type="button"
            onClick={onClose}
           className="px-4 py-2.5 bg-white border border-gray-200 text-[#718096] rounded-xl transition-all hover:bg-gray-50 hover:text-[#1A365D] cursor-pointer"
          >
            Cancel
          </button>
          {/* Action Button: High contrast, dark editorial signature ink button */}
          <button
            type="button"
            onClick={onConfirm}
className="px-5 py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white rounded-full transition-all cursor-pointer shadow-sm tracking-wide"          >
            Confirm Deletion
          </button>
        </div>
      </div>
    </div>
  );
};
