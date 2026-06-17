import React, { useState } from "react";
import type { CategoryMetrics } from "../types/category.types";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCategories: CategoryMetrics[];
  onCreateCategory: (categoryName: string) => Promise<void>;
  isMutating: boolean;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  existingCategories,
  onCreateCategory,
  isMutating,
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [localError, setLocalError] = useState("");

  // Clean exit wrapper to clear parameters when closed
  const handleClose = () => {
    setCategoryName("");
    setLocalError("");
    onClose();
  };

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = categoryName.trim();

    if (!trimmedName) {
      setLocalError("Category name cannot be left blank");
      return;
    }

    if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      setLocalError("Name must contain alphabets only");
      return;
    }

    const nameExists = existingCategories.some(
      (cat) => cat.category_name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (nameExists) {
      setLocalError(`The category "${trimmedName}" already exists`);
      return;
    }

    setLocalError("");
    await onCreateCategory(trimmedName);
    
    // Clear state inputs on successful creation
    setCategoryName("");
    onClose();
  };

 return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm font-sans select-none text-left">
      {/* Added overflow-hidden below to clip the square, gray background footer into the parent's rounded track */}
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200 flex flex-col overflow-hidden">
        
        {/* Header Block */}
        <div className="flex items-center justify-between border-b border-gray-200 p-5 bg-white">
          <div>
            <h3 className="text-lg font-bold text-[#1A365D] tracking-tight">
              Create New Category
            </h3>
            <p className="text-[11px] text-[#718096] font-bold mt-1 tracking-wider uppercase">
              System Registry Setup
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-[#718096] hover:text-[#1A365D] hover:bg-gray-100 transition-all text-xs font-bold cursor-pointer p-1.5 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Input Field Form */}
        <form onSubmit={handleSave}>
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                Category Classification Name
              </label>
              <input
                type="text"
                autoFocus
                placeholder="e.g., Biography, Science Fiction"
                value={categoryName}
                onChange={(e) => {
                  setCategoryName(e.target.value);
                  if (localError) setLocalError("");
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-gray-200 text-sm font-semibold text-[#2D3748] rounded-xl outline-hidden focus:bg-white focus:border-[#1A365D] focus:ring-4 focus:ring-slate-900/5 transition-all"
              />
              {localError && (
                <p className="text-xs text-rose-700 font-bold px-1 mt-1">
                  ⚠️ {localError}
                </p>
              )}
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2 text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 tracking-wider hover:bg-gray-100 border border-gray-200 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isMutating || !categoryName.trim()}
              className="px-5 py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm text-center tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isMutating ? "Creating..." : "Register Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};