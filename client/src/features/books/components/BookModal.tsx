import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookFormSchema, type BookFormValues } from "../schemas/bookSchema";
import type { BookCategory, BookInventoryItem } from "../../../types/books";

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookFormValues) => void;
  categories: BookCategory[];
  editingBook?: BookInventoryItem | null;
}

export const BookModal = ({ isOpen, onClose, onSubmit, categories, editingBook }: BookModalProps) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BookFormValues>({
    resolver: zodResolver(BookFormSchema),
    defaultValues: { title: "", author: "", totalCopies: 1, categoryId: "" }
  });

  // Dynamically populate fields when editing an existing profile
  useEffect(() => {
    if (editingBook) {
      reset({
        title: editingBook.title,
        author: editingBook.author,
        totalCopies: editingBook.totalCopies,
        categoryId: editingBook.categoryId
      });
    } else {
      reset({ title: "", author: "", totalCopies: 1, categoryId: "" });
    }
  }, [editingBook, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-ocean-blue/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 animate-zoom-in">
        <div className="bg-linear-to-r from-ocean-light to-ocean-blue p-5 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">{editingBook ? "Modify Book Details" : "Add New Book"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors cursor-pointer text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">Book Title</label>
            <input type="text" {...register("title")} placeholder="e.g., Rich dad Poor dad" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand" />
            {errors.title && <p className="text-xs text-red-500 mt-1 font-medium">{errors.title.message}</p>}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">Author / Creator of the Book</label>
            <input type="text" {...register("author")} placeholder="e.g., Robert Kiyosaki and Sharon Lechter" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand" />
            {errors.author && <p className="text-xs text-red-500 mt-1 font-medium">{errors.author.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">Total Copies</label>
              <input type="number" {...register("totalCopies")} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand" />
              {errors.totalCopies && <p className="text-xs text-red-500 mt-1 font-medium">{errors.totalCopies.message}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">Book Category</label>
              <select {...register("categoryId")} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand">
                <option value="">All Category</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-xs text-red-500 mt-1 font-medium">{errors.categoryId.message}</p>}
            </div>
          </div>

          {editingBook && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase block">Available Copies</span>
                <div className="text-lg font-bold text-amber-900 mt-0.5">{editingBook.availableCopies}</div>
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase block">Lending Count</span>
                <div className="text-lg font-bold text-amber-900 mt-0.5">{editingBook.lendingCount}</div>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-teal-brand hover:bg-teal-hover shadow-sm rounded-xl transition-all cursor-pointer">
              {editingBook ? "Update Book" : "Create Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};