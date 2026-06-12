import React, { useState } from "react";
import type { CategoryMetrics } from "../types/category.types";

// Editorial Visual Assets
import {
  Layers,
  BookOpen,
  BarChart3,
  Calendar,
  Edit3,
  Trash2,
  X,
} from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 font-sans text-text-main text-left">
      <div className="bg-card-bg w-full max-w-xl rounded-2xl border border-border-main shadow-2xl overflow-hidden animate-scale-up">
        {/* Header section - Clean Dark Structured Banner */}
        <div className="bg-slate-900 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Category Details
            </h3>
            <p className="text-xs text-slate-400 font-mono font-bold tracking-wider mt-1 uppercase">
              ID: {readableId}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:bg-card-bg/10 hover:rounded-lg transition-colors p-1 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Detailed Metadata Layout */}
        <div className="p-8 space-y-5 text-base">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Layers size={14} /> Category Name
            </label>
            {isEditing ? (
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-border-main text-sm font-semibold text-text-main rounded-xl placeholder:text-slate-400 outline-hidden focus:bg-card-bg focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
                />
                {localError && (
                  <p className="text-xs text-rose-700 font-bold mt-1.5 px-1">
                    {localError}
                  </p>
                )}
              </div>
            ) : (
              <div className="px-4 py-3 bg-slate-50 border border-border-main rounded-xl font-semibold text-text-main">
                {category.category_name}
              </div>
            )}
          </div>

          {/* Stats Row layout */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50/40 border border-amber-100 rounded-xl text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                <BookOpen size={12} /> Total Owned Books
              </span>
              <span className="text-xl font-mono font-bold text-text-main mt-1 block">
                {category.booksCount}
              </span>
            </div>

            <div className="p-4 bg-amber-50/40 border border-amber-100 rounded-xl text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                <BarChart3 size={12} /> Total Borrows
              </span>
              <span className="text-xl font-mono font-bold text-text-main mt-1 block">
                {category.lendingCount}
              </span>
            </div>
          </div>

          {/* Registry Date layout */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Calendar size={14} /> System Registry Date
            </label>
            <div className="px-4 py-3 bg-slate-50 border border-border-main rounded-xl text-slate-500 text-sm font-semibold">
              {new Date(category.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Action Panel Footer */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end text-sm font-bold uppercase tracking-wider">
          <button
            type="button"
            disabled={isMutating}
            onClick={() => onDeleteCategory(category)}
            className="mr-auto px-5 py-3 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} /> Delete Category
          </button>

          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditName(category.category_name);
                  setLocalError("");
                }}
                className="px-5 py-3 bg-card-bg border border-border-main text-text-main rounded-xl transition-all hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isMutating}
                onClick={handleSaveEdit}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Edit3 size={16} /> Modify Name
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
