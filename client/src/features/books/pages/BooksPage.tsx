import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { BookModal } from "../components/BookModal";
import { DeleteBookModal } from "../components/DeleteBookModal";
import type { BookInventoryItem, BookCategory } from "../../../types/books";
import type { BookFormValues } from "../schemas/bookSchema";
import { toast } from "sonner";

export const BooksPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  
  // Modals visibility states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookInventoryItem | null>(null);

  // 1. Fetching relational query datasets
  const { data: books, isLoading } = useQuery<BookInventoryItem[]>({
    queryKey: ["libraryBooksCatalogFeed"],
    queryFn: async () => (await axiosClient.get("/books")).data
  });

  const { data: categories = [] } = useQuery<BookCategory[]>({
    queryKey: ["bookCategoriesDropdownFeed"],
    queryFn: async () => (await axiosClient.get("/categories")).data
  });

  // 2. Data Mutation Operations Pipelines
  const saveBookMutation = useMutation({
    mutationFn: async (payload: BookFormValues) => {
      if (selectedBook) {
        return await axiosClient.put(`/books/${selectedBook.id}`, payload);
      }
      return await axiosClient.post("/books", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["libraryBooksCatalogFeed"] });
      toast.success("Asset catalog definitions updated successfully.");
      setIsFormOpen(false);
    },
    onError: () => toast.error("An error occurred during database commit operations.")
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (id: string) => await axiosClient.delete(`/books/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["libraryBooksCatalogFeed"] });
      toast.success("Asset completely removed from system indexes.");
      setIsDeleteOpen(false);
    }
  });

  // 3. Evaluation filtration logic paths
  const filteredBooks = books?.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "" || book.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">System Core Asset Catalog</h2>
          <p className="text-xs text-gray-500">Add new volumes, organize classifications, and track shelf distribution levels.</p>
        </div>
        <button
          onClick={() => { setSelectedBook(null); setIsFormOpen(true); }}
          className="px-4 py-2.5 bg-teal-brand hover:bg-teal-hover text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          📚 Catalog New Media Asset
        </button>
      </div>

      {/* Query Filter Navigation Controls Line */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <input
          type="text"
          placeholder="🔎 Query collection by title index terms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:col-span-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand"
        >
          <option value="">-- View All Categories --</option>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
      </div>

      {/* Inventory Asset Ledger View Grid Data Box */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-gray-400 font-semibold animate-pulse">Syncing Active Media Ledger Records...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase bg-gray-50/70">
                  <th className="py-3.5 px-4">Book Title & Creator Index</th>
                  <th className="py-3.5 px-4">Classification Group</th>
                  <th className="py-3.5 px-4 text-center">Total Volumes</th>
                  <th className="py-3.5 px-4 text-center">Shelf Availability</th>
                  <th className="py-3.5 px-4 text-center">In Circulation</th>
                  <th className="py-3.5 px-4 text-right">Data Operations</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
                {filteredBooks?.map(book => (
                  <tr key={book.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-gray-900">
                      <div>{book.title}</div>
                      <div className="text-xs text-gray-400 font-normal">By {book.author}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {book.categoryName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold">{book.totalCopies}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-mono font-bold ${book.availableCopies > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {book.availableCopies} left
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-gray-500">{book.lendingCount} active</td>
                    <td className="py-3.5 px-4 text-right space-x-3">
                      <button onClick={() => { setSelectedBook(book); setIsFormOpen(true); }} className="text-xs font-bold text-teal-brand hover:text-teal-hover transition-colors cursor-pointer">Modify</button>
                      <button onClick={() => { setSelectedBook(book); setIsDeleteOpen(true); }} className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer">Purge</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <BookModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={(vals) => saveBookMutation.mutate(vals)} categories={categories} editingBook={selectedBook} />
      <DeleteBookModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={() => selectedBook && deleteBookMutation.mutate(selectedBook.id)} bookTitle={selectedBook?.title || ""} />
    </div>
  );
};