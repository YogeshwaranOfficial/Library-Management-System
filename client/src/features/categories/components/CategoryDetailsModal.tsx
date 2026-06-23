import React, { useState } from "react";
import type { CategoryMetrics } from "../types/category.types";
import { DeleteCategoryConfirmationModal } from "./DeleteCategoryConfirmationModal"; // Adjust path if needed

interface CategoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryMetrics | null;
  onUpdateName: (id: string, newName: string) => Promise<void>;
  onDeleteCategory: (category: CategoryMetrics) => void;
  isMutating: boolean;
}

export const CategoryDetailsModal: React.FC<CategoryDetailsModalProps> = ({
  isOpen,
  onClose,
  category,
  onUpdateName,
  onDeleteCategory,
  isMutating,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [localError, setLocalError] = useState("");
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  
  // Track confirmation dialog state parameters locally
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Synchronize state parameters when modal opens
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen && category) {
      setEditName(category.category_name);
      setLocalError("");
      setIsEditing(false);
      setIsConfirmDeleteOpen(false); // Make sure confirmation layer resets
    }
  }

  if (!isOpen || !category) return null;

  const readableId = `CAT-${category.category_id.slice(-4).toUpperCase()}`;

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      setLocalError("Name cannot be left blank");
      return;
    }
    if (!/^[A-Za-z\s]+$/.test(editName)) {
      setLocalError("Name must contain alphabets only");
      return;
    }

    setLocalError("");
    await onUpdateName(category.category_id, editName.trim());
    setIsEditing(false);
  };

  const handleConfirmDeleteTransaction = () => {
    onDeleteCategory(category);
    setIsConfirmDeleteOpen(false);
  };

  const registryDate = new Date(category.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {/* High-contrast background overlay with clean backdrop filter */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm font-sans select-none text-left">
        <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl transition-all overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]">
          
          {/* Header Framework */}
          <div className="flex items-center justify-between border-b border-gray-200 p-5 bg-white">
            <div>
              <h3 className="text-lg font-bold text-[#1A365D] tracking-tight">
                Category Details
              </h3>
              <p className="text-[11px] text-[#718096] font-bold mt-1 tracking-wider uppercase">
                ID: {readableId}
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
              
              {/* Top Row Title/Edit Stack */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="w-full max-w-md">
                  {isEditing ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-gray-200 text-sm font-semibold text-[#2D3748] rounded-xl outline-hidden focus:bg-white focus:border-[#1A365D] focus:ring-4 focus:ring-slate-900/5 transition-all"
                      />
                      {localError && (
                        <p className="text-xs text-rose-700 font-bold px-1">
                          {localError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xl font-bold text-[#1A365D] tracking-tight">
                        {category.category_name}
                      </h4>
                      <p className="text-sm font-medium text-[#718096] mt-0.5">
                        Library Asset Classification
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Core Info Properties Grid Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 text-sm">
                <div>
                  <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                    System Registry Date
                  </span>
                  <span className="font-semibold text-[#2D3748] mt-1 block text-sm">
                    {registryDate}
                  </span>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                    Inventory Performance Metrics
                  </span>
                  <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-[#2D3748] border border-gray-200">
                      {category.booksCount || 0} Unique Titles
                    </span>
                    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {category.totalCopies || 0} Total Copies
                    </span>
                    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-[#2D3748] border border-gray-200">
                      {category.lendingCount || 0}× Borrowed
                    </span>
                  </div>
                </div>
              </div>

              {/* Operations Layout Action Buttons */}
              <div className="pt-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                {isEditing ? (
                  <div className="flex gap-2 w-full justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditName(category.category_name);
                        setLocalError("");
                      }}
                      className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider hover:bg-gray-50 border border-gray-200 rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isMutating}
                      onClick={handleSaveEdit}
                      className="px-5 py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm text-center tracking-wide disabled:opacity-50"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={isMutating}
                      onClick={() => setIsConfirmDeleteOpen(true)} // 👈 Intercepts click and safely opens confirmation panel
                      className="px-4 py-2 text-xs font-bold text-rose-600 uppercase tracking-wider hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-all cursor-pointer text-left sm:text-center disabled:opacity-50"
                    >
                      Remove Category
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-5 py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm text-center tracking-wide"
                    >
                      Modify Name
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Layered Confirmation Prompt (Sets an explicit stacking indexing order profile z-60) */}
      <DeleteCategoryConfirmationModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDeleteTransaction}
        category={category}
        isMutating={isMutating}
      />
    </>
  );
};