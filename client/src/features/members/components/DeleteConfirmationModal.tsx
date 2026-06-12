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
      <div className="bg-card-bg rounded-2xl shadow-xl w-full max-w-sm p-6 border border-amber-100/80 animate-zoom-in">
        <div className="text-center">
          {/* Header: Shifted from text-sm to text-base, using a deeper, slate-ink tone */}
          <h3 className="text-base font-bold text-text-main tracking-tight">
            Confirm Member Deletion
          </h3>

          {/* Main Paragraph: Softened slightly to slate-600 for optimal readability */}
          <p className="text-sm text-slate-600 mt-4 leading-relaxed">
            Are you sure you want to delete the library member record for{" "}
            <strong className="text-text-main font-bold">{memberName}</strong>?
          </p>

          {/* Callout Block: Shifted to a premium cream/rose warning surface with refined typography rules */}
          <div className="text-xs text-rose-900 font-medium mt-5 bg-rose-50/60 border border-rose-100 p-4 rounded-xl text-left leading-relaxed">
            <span className="font-bold uppercase tracking-wider block mb-1 text-rose-950 text-[11px]">
              Notice:
            </span>
            This action removes the library member profile tier assignment only.
            The underlying system user account credentials will not be deleted.
          </div>
        </div>

        {/* Modal Action Footers - Clear Call to Action */}
        <div className="mt-6 flex justify-end gap-3 pt-5 border-t border-slate-100 text-xs font-bold tracking-wide">
          {/* Cancel Button: Crisp off-white tactile styling */}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 bg-slate-50 border border-border-main text-text-main rounded-xl transition-all hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          {/* Action Button: High contrast, dark editorial signature ink button */}
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-amber-50 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Confirm Deletion
          </button>
        </div>
      </div>
    </div>
  );
};
