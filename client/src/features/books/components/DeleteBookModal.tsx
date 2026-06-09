interface DeleteBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bookTitle: string;
}

export const DeleteBookModal = ({ isOpen, onClose, onConfirm, bookTitle }: DeleteBookModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-secondary/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-slate-light/10 animate-zoom-in text-slate-secondary">
        <div className="text-center">
          <span className="text-3xl text-utility-crimson block mb-2">🗑️</span>
          <h3 className="text-base font-bold text-slate-secondary tracking-tight">Delete Book From Catalog</h3>
          <p className="text-xs text-slate-light mt-2.5 leading-relaxed font-medium">
            Are you absolutely sure you want to delete <strong className="text-slate-secondary font-bold">"{bookTitle}"</strong> permanently from the library repository index?
          </p>
          <p className="text-[11px] text-utility-crimson font-semibold mt-3 bg-utility-crimson/10 border border-utility-crimson/10 p-2.5 rounded-xl leading-normal">
            Warning: This action cannot be reverted and will permanently delete all tracking history and copy instances.
          </p>
        </div>
        
        {/* Action Panel Buttons */}
        <div className="mt-5 flex justify-end gap-2 pt-4 border-t border-slate-light/10 text-xs font-bold">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-3.5 py-2 text-slate-light hover:text-slate-secondary transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={onConfirm} 
            className="px-4 py-2 text-white bg-utility-crimson hover:bg-utility-crimson/90 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};