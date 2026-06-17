import { useState } from "react";
import type { BookInventoryItem } from "../../../types/books";
import { DeleteBookModal } from "./DeleteBookModal";

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
  });

  const handleConfirmDeletion = () => {
    setIsDeleteOpen(false); // Close the local delete confirmation modal state
    onClose(); // Close the core details framework drawer
    onDeleteTrigger(); // Execute the original deletion action from BooksPage.tsx
  };

return (
  <>
    {/* High-contrast background overlay with clean backdrop filter */}
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm font-sans select-none text-left">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl transition-all overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]">
        
        {/* Header Framework - Matching Reference Module */}
        <div className="flex items-center justify-between border-b border-gray-200 p-5 bg-white">
          <div>
            <h3 className="text-lg font-bold text-[#1A365D] tracking-tight">
              Book Details
            </h3>
            <p className="text-[11px] text-[#718096] font-bold mt-1 tracking-wider uppercase">
              ID: BOOK-
              {book.id ? String(book.id).slice(-4).toUpperCase() : "0000"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#718096] hover:text-[#1A365D] hover:bg-gray-100 transition-all text-xs font-bold cursor-pointer p-1.5 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Detailed Metadata Body Context Frame */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#2D3748]">
          <div className="space-y-6">
            
            {/* Top Row Title Stack */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xl font-bold text-[#1A365D] tracking-tight">
                  {book.title}
                </h4>
                <p className="text-sm font-medium text-[#718096] mt-0.5">
                  by {book.author}
                </p>
              </div>
              <span
                className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold select-none ${
                  book.availableCopies > 0
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${book.availableCopies > 0 ? "bg-emerald-500" : "bg-rose-500"}`} />
                {book.availableCopies > 0 ? "Available" : "Out of Stock"}
              </span>
            </div>

            <hr className="border-gray-100" />

            {/* Core Info Properties Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 text-sm">
              <div>
                <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                  Language Spec
                </span>
                <span className="font-semibold text-[#1A365D] mt-1 block select-all text-sm">
                  {book.language}
                </span>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                  Category Classification
                </span>
                <span className="font-semibold text-[#1A365D] mt-1 block select-all text-sm truncate">
                  {book.categoryName}
                </span>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                  Shelf Registry Date
                </span>
                <span className="font-semibold text-[#2D3748] mt-1 block text-sm">
                  {shelfEntryDate}
                </span>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                  Lending Metrics (Total / Available / Loans)
                </span>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-[#2D3748] border border-gray-200">
                    {book.totalCopies} Total
                  </span>
                  <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {book.availableCopies} On Shelf
                  </span>
                  <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-[#2D3748] border border-gray-200">
                    {book.lendingCount}× Borrowed
                  </span>
                </div>
              </div>
            </div>

            {/* Operations Layout Action Buttons - Matching layout rules and theme */}
            <div className="pt-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(true)}
                className="px-4 py-2 text-xs font-bold text-rose-600 uppercase tracking-wider hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-all cursor-pointer text-left sm:text-center"
              >
                Remove Book
              </button>

             <button
              type="button"
              onClick={onEditTrigger} // Let the parent handle closing the view without clearing the book data
              className="px-5 py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm text-center tracking-wide"
            >
              Edit Details
            </button>
            </div>

          </div>
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
);}