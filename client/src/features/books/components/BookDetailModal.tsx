import { useState } from "react";
import type { BookInventoryItem } from "../../../types/books";
import { DeleteBookModal } from "./DeleteBookModal";

// Editorial Visual Assets
import {
  BookOpen,
  User,
  Layers,
  Calendar,
  Archive,
  BookmarkCheck,
  BarChart3,
  Edit3,
  Trash2,
  X,
} from "lucide-react";

interface BookDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookInventoryItem | null;
  onEditTrigger: () => void;
  onDeleteTrigger: () => void; // Restored the original prop name here
}

export const BookDetailModal = ({
  isOpen,
  onClose,
  book,
  onEditTrigger,
  onDeleteTrigger, // Restored here
}: BookDetailModalProps) => {
  // Internal state tracking to switch over to the confirmation display layer
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (!isOpen || !book) return null;

  // Format the ISO database timestamp into a human-readable calendar date
  const shelfEntryDate = new Date(book.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleConfirmDeletion = () => {
    setIsDeleteOpen(false); // Close the local delete confirmation modal state
    onClose(); // Close the core details framework drawer
    onDeleteTrigger(); // Execute the original deletion action from BooksPage.tsx
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 font-sans text-text-main text-left">
        <div className="bg-card-bg w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
          {/* Header section */}
          <div className="bg-slate-900 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Book Details
              </h3>
              <p className="text-xs text-slate-400 font-mono font-bold tracking-wider mt-1 uppercase">
                ID: BOOK-
                {book.id ? String(book.id).slice(-4).toUpperCase() : "0000"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:bg-slate-100 hover:rounded-lg transition-colors p-1 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Detailed Metadata Grid */}
          <div className="p-8 space-y-5 text-base">
            <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <BookOpen size={14} /> Book Name
              </label>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-text-main">
                {book.title}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <User size={14} /> Author / Creator
              </label>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800">
                {book.author}
              </div>
            </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                 <BookOpen size={14} />Language
              </label>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800">
                {book.language}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Layers size={14} /> Category Classification
                </label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 truncate">
                  {book.categoryName}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Calendar size={14} /> Shelf Registry Date
                </label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm font-semibold truncate">
                  {shelfEntryDate}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-amber-50/40 border border-amber-100 p-4 rounded-xl text-center">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <Archive size={12} /> Total Owned
                </span>
                <span className="text-xl font-mono font-bold text-text-main mt-1 block">
                  {book.totalCopies}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <BookmarkCheck size={12} /> On Shelf
                </span>
                <span className="text-xl font-mono font-bold text-emerald-700 mt-1 block">
                  {book.availableCopies}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <BarChart3 size={12} /> Lending Count
                </span>
                <span className="text-xl font-mono font-bold text-text-main mt-1 block">
                  {book.lendingCount}×
                </span>
              </div>
            </div>
          </div>

          {/* Action Panel Footer */}
          <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end text-sm font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(true)} // Toggles our local state to open the confirm window
              className="px-5 py-3 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 size={16} /> Remove Book
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditTrigger();
              }}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Edit3 size={16} /> Edit Book
            </button>
          </div>
        </div>
      </div>

      {/* Embedded inline confirmation screen */}
      <DeleteBookModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDeletion}
        bookTitle={book.title}
      />
    </>
  );
};
