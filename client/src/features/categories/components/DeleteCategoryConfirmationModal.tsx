import React from "react";
import type { CategoryMetrics } from "../types/category.types";
import { Trash2 } from "lucide-react";

interface DeleteCategoryConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  category: CategoryMetrics | null;
  isMutating: boolean;
}

export const DeleteCategoryConfirmationModal: React.FC<DeleteCategoryConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  category,
  isMutating,
}) => {
  if (!isOpen || !category) return null;

  const hasBooks = (category.booksCount || 0) > 0;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-sans select-none">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden animate-zoom-in">

        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-gray-200 p-5 bg-white">
          <h3 className="text-lg font-bold text-[#1A365D] tracking-tight">
            Delete Category From Catalog
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="text-[#718096] hover:text-[#1A365D] hover:bg-gray-100 transition-all cursor-pointer p-1.5 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Content Section */}
        <div className="p-6 text-center text-[#2D3748]">
          {/* Centered Trash Icon Frame with Adaptive Border Theme */}
          <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5 ${
            hasBooks 
              ? "bg-amber-50 border border-amber-200" 
              : "bg-rose-50 border border-rose-200"
          }`}>
            <Trash2 size={30} className={hasBooks ? "text-amber-600" : "text-rose-600"} />
          </div>

          <h4 className="text-xl font-bold text-[#1A365D] tracking-tight">
            Confirm Category Deletion
          </h4>

          <p className="text-sm text-[#718096] leading-relaxed mt-4">
            Are you sure you want to permanently remove the category{" "}
            <span className="font-semibold text-[#1A365D]">
              "{category.category_name}"
            </span>{" "}
            from the system records?
          </p>

          {/* Warning Card Condition Layers matching reference layout styling */}
          {hasBooks ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
              <span className="block text-[11px] font-bold uppercase tracking-widest text-amber-700 mb-2">
                ⚠️ System Records Notice
              </span>

              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                There are currently <span className="font-bold text-amber-950">{category.booksCount} books</span> registered under this category. Dropping this registry will cause all associated books to be shown as <span className="font-bold text-amber-950 underline">unclassified</span> inside the catalogs.
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-left">
              <span className="block text-[11px] font-bold uppercase tracking-widest text-rose-700 mb-2">
                ✓ Safe Drop Analysis
              </span>

              <p className="text-xs text-rose-800 leading-relaxed font-medium">
                No active book items are bound to this category. This classification can be dropped immediately without altering auxiliary indexing records.
              </p>
            </div>
          )}
        </div>

        {/* Footer Action Layout Tray */}
        <div className="flex justify-end gap-3 border-t border-gray-200 p-5 bg-white">
          <button
            type="button"
            disabled={isMutating}
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-[#2D3748] text-sm font-semibold hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isMutating}
            onClick={onConfirm}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isMutating ? "Dropping..." : "Confirm Delete"}
          </button>
        </div>

      </div>
    </div>
  );
}