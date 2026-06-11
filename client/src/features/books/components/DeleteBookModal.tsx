// Editorial Visual Assets
import { Trash2 } from "lucide-react";

interface DeleteBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bookTitle: string;
}

export const DeleteBookModal = ({ isOpen, onClose, onConfirm, bookTitle }: DeleteBookModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans text-slate-700 text-left">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 animate-zoom-in">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-full mb-3.5">
            <Trash2 size={28} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Delete Book From Catalog
          </h3>
          
          <p className="text-base text-slate-500 mt-3 leading-relaxed font-medium">
            Are you absolutely sure you want to delete <strong className="text-slate-900 font-bold">"{bookTitle}"</strong> permanently from the library repository index?
          </p>
          
          <p className="text-sm text-rose-600 font-semibold mt-4 bg-rose-50 border border-rose-100 p-3.5 rounded-xl leading-relaxed">
            Warning: This action cannot be reverted and will permanently delete all tracking history and copy instances.
          </p>
        </div>
        
        {/* Action Panel Buttons */}
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 text-sm font-bold uppercase tracking-wider">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2.5 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={onConfirm} 
            className="px-5 py-2.5 text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all cursor-pointer"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};