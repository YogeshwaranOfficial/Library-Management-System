import React, { useState } from "react";
import type { CategoryMetrics } from "../types/category.types";

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

  // Track modal opening state changes cleanly without hook dependency issues
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen && category) {
      setEditName(category.category_name);
      setLocalError("");
      setIsEditing(false);
    }
  }

  if (!isOpen || !category) return null;

  // Generate Human Readable ID: CAT-last 4 digits of UUID
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

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl p-6 border border-slate-100 shadow-xl m-4">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
          <div>
            <span className="text-3xs font-mono font-bold tracking-widest text-slate-400 uppercase bg-slate-50 px-2 py-0.5 rounded-sm">
              {readableId}
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">Category Information</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
        </div>

        {/* Content Details Block */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category Name</label>
            {isEditing ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-100 focus:border-slate-600 outline-hidden"
                />
                {localError && <p className="text-3xs font-bold text-rose-500">{localError}</p>}
              </div>
            ) : (
              <p className="text-base font-bold text-slate-800 bg-slate-50/50 px-3 py-2 rounded-xl border border-slate-100">
                {category.category_name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100">
              <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Total Owned Books</span>
              <span className="text-xl font-extrabold text-slate-800 font-mono">{category.booksCount}</span>
            </div>
            <div className="p-3 bg-sky-50/30 rounded-xl border border-sky-100/50">
              <span className="text-3xs font-bold text-sky-600/80 uppercase tracking-wider block mb-0.5">Lending Circulation Count</span>
              <span className="text-xl font-extrabold text-sky-700 font-mono">{category.lendingCount}</span>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-400 font-medium space-y-1 font-sans">
            <p>Category Entry Date: <span className="font-mono text-slate-600">{new Date(category.created_at).toLocaleString()}</span></p>
          </div>
        </div>

        {/* Footer Actions Panel */}
        <div className="mt-8 flex justify-between items-center pt-4 border-t border-slate-100">
          <button
            disabled={isMutating}
            onClick={() => onDeleteCategory(category)}
            className="px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100/70 disabled:opacity-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Delete Category
          </button>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => { setIsEditing(false); setEditName(category.category_name); setLocalError(""); }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={isMutating}
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Modify Name
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};