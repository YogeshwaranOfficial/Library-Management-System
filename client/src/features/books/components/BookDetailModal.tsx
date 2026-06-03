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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-gray-200 shadow-xl overflow-hidden animate-scale-up">
        {/* Header section */}
        <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-gray-900">Book Details</h3>
            <p className="text-[11px] text-gray-400 font-mono">ID: {book.id}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors text-sm font-semibold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="p-6 space-y-4 text-sm">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Book Name</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900">{book.title}</div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Author / Creator</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700">{book.author}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Category Classification</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 truncate">{book.categoryName}</div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Shelf Registry Date</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-xs font-medium truncate">{shelfEntryDate}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-teal-50/30 border border-teal-100/60 p-3 rounded-xl text-center">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase">Total Owned</span>
              <span className="text-lg font-mono font-bold text-gray-800">{book.totalCopies}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase">On Shelf</span>
              <span className="text-lg font-mono font-bold text-teal-600">{book.availableCopies}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase">Lending Count</span>
              <span className="text-lg font-mono font-bold text-indigo-600">{book.lendingCount}×</span>
            </div>
          </div>
        </div>

        {/* Action Panel Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
          <button
            onClick={() => { onClose(); onDeleteTrigger(); }}
            className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100/70 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Remove Book
          </button>
          <button
            onClick={() => { onClose(); onEditTrigger(); }}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Edit Book
          </button>
        </div>
      </div>
    </div>
  );
};