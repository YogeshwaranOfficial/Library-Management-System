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
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto font-sans">
      <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl m-4">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded-md">
              {readableId}
            </span>
            <h3 className="text-lg font-bold text-slate-950 mt-2">Category Information</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-colors cursor-pointer text-lg font-light">✕</button>
        </div>

        {/* Content Details Block */}
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category Name</label>
            {isEditing ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary outline-none transition-all"
                />
                {localError && <p className="text-[10px] font-bold text-rose-600 px-1">{localError}</p>}
              </div>
            ) : (
              <p className="text-sm font-semibold text-slate-800 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                {category.category_name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Owned Books</span>
              <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">{category.booksCount}</span>
            </div>
            <div className="p-4 bg-sage-primary/5 rounded-xl border border-sage-primary/10">
              <span className="text-[10px] font-bold text-sage-primary/70 uppercase tracking-widest block mb-1">Total Borrows</span>
              <span className="text-2xl font-black text-sage-primary font-mono tracking-tight">{category.lendingCount}</span>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-500 font-medium">
            <p>Created on: <span className="font-mono text-slate-700">{new Date(category.created_at).toLocaleDateString()}</span></p>
          </div>
        </div>

        {/* Footer Actions Panel */}
        <div className="mt-8 flex justify-between items-center pt-4 border-t border-slate-100">
          <button
            disabled={isMutating}
            onClick={() => onDeleteCategory(category)}
            className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Delete Category
          </button>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => { setIsEditing(false); setEditName(category.category_name); setLocalError(""); }}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={isMutating}
                  onClick={handleSaveEdit}
                  className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-slate-100 text-slate-800 hover:bg-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
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