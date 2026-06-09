import type { BookInventoryItem } from "../../../types/books";

interface BookDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookInventoryItem | null;
  onEditTrigger: () => void;
  onDeleteTrigger: () => void;
}

export const BookDetailModal = ({
  isOpen,
  onClose,
  book,
  onEditTrigger,
  onDeleteTrigger,
}: BookDetailModalProps) => {
  if (!isOpen || !book) return null;

  // Format the ISO database timestamp into a human-readable calendar date
  const shelfEntryDate = new Date(book.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-secondary/40 backdrop-blur-xs p-4 font-sans text-slate-secondary">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-light/10 shadow-xl overflow-hidden animate-scale-up">
        
        {/* Header section */}
        <div className="bg-canvas-dominant/80 px-6 py-4 border-b border-slate-light/10 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-secondary tracking-tight">Book Details</h3>
            <p className="text-[10px] text-slate-light font-bold font-data tracking-wider mt-0.5 uppercase">
              ID: BOOK-{book.id ? String(book.id).slice(-4).toUpperCase() : "0000"}
            </p>          
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-light hover:text-slate-secondary transition-colors text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="p-6 space-y-4 text-sm">
          <div>
            <label className="text-xs font-bold text-slate-light uppercase tracking-wider block mb-1.5">Book Name</label>
            <div className="px-3.5 py-2 bg-canvas-dominant border border-slate-light/10 rounded-xl font-semibold text-slate-secondary">{book.title}</div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-light uppercase tracking-wider block mb-1.5">Author / Creator</label>
            <div className="px-3.5 py-2 bg-canvas-dominant border border-slate-light/10 rounded-xl text-slate-secondary font-medium">{book.author}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-light uppercase tracking-wider block mb-1.5">Category Classification</label>
              <div className="px-3.5 py-2 bg-canvas-dominant border border-slate-light/10 rounded-xl text-slate-secondary font-medium truncate">{book.categoryName}</div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-light uppercase tracking-wider block mb-1.5">Shelf Registry Date</label>
              <div className="px-3.5 py-2 bg-canvas-dominant border border-slate-light/10 rounded-xl text-slate-light text-xs font-bold font-data truncate">{shelfEntryDate}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-sage-primary/5 border border-sage-primary/10 p-3.5 rounded-xl text-center">
            <div>
              <span className="block text-[10px] font-bold text-slate-light uppercase tracking-wider">Total Owned</span>
              <span className="text-base font-bold text-slate-secondary font-data mt-0.5 block">{book.totalCopies}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-light uppercase tracking-wider">On Shelf</span>
              <span className="text-base font-bold text-sage-primary font-data mt-0.5 block">{book.availableCopies}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-light uppercase tracking-wider">Lending Count</span>
              <span className="text-base font-bold text-slate-secondary font-data mt-0.5 block">{book.lendingCount}×</span>
            </div>
          </div>
        </div>

        {/* Action Panel Footer */}
        <div className="px-6 py-4 bg-canvas-dominant border-t border-slate-light/10 flex gap-2 justify-end text-xs font-bold">
          <button
            onClick={() => { onClose(); onDeleteTrigger(); }}
            className="px-4 py-2 bg-utility-crimson/10 text-utility-crimson border border-utility-crimson/10 hover:bg-utility-crimson/20 rounded-xl transition-colors cursor-pointer"
          >
            Remove Book
          </button>
          <button
            onClick={() => { onClose(); onEditTrigger(); }}
            className="px-5 py-2.5 bg-sage-primary hover:bg-sage-primary/90 text-white rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Edit Book
          </button>
        </div>
      </div>
    </div>
  );
};