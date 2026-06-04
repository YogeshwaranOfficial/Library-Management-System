import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { BookModal } from "../components/BookModal";
import { DeleteBookModal } from "../components/DeleteBookModal";
import { BookDetailModal } from "../components/BookDetailModal";
import type { BookInventoryItem, BookCategory } from "../../../types/books";
import type { BookFormValues } from "../schemas/bookSchema";
import { toast } from "sonner";

export const BooksPage = () => {
  const queryClient = useQueryClient();

  // 💡 Dynamic Search Orchestration states
  const [localSearch, setLocalSearch] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // 📑 Dynamic Pagination Tracking States
  const [currentPage, setCurrentPage] = useState(1);
  const RECORDS_PER_PAGE = 10;

  // Modal Visibility States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookInventoryItem | null>(null);

  // =========================================================================
  // ⏱️ NATIVE DEBOUNCE LIFECYCLE ENGINE
  // =========================================================================
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setActiveSearchQuery(localSearch);
      setCurrentPage(1); // Snap back to Page 1 when filters change
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [localSearch]);

  // 1. Fetching relational query datasets
  const { data: booksResponse, isLoading } = useQuery({
    queryKey: ["libraryBooksCatalogFeed", activeSearchQuery, categoryFilter, currentPage],
    queryFn: async () => {
      const response = await axiosClient.get("/books", {
        params: {
          page: currentPage,
          limit: RECORDS_PER_PAGE,
          search: activeSearchQuery || undefined,
          category_id: categoryFilter || undefined,
        },
      });
      return response.data;
    },
  });

  // Dedicated Category Dropdown Feed route 
  const { data: categories = [] } = useQuery<BookCategory[]>({
    queryKey: ["bookCategoriesDropdownFeed"],
    queryFn: async () => {
      const response = await axiosClient.get("/books/categories"); 
      return response.data?.data || [];
    }
  });

  // Structural mapping layer for explicit type safety checks
  interface BackendBookRow {
    book_id?: string;
    id?: string;
    book_name?: string;
    book_author?: string;
    total_copies?: number;
    totalCopies?: number;
    available_copies?: number;
    availableCopies?: number;
    lending_count?: number;
    lendingCount?: number;
    category_id?: string;
    categoryId?: string;
    created_at?: string;
    createdAt?: string;
    category?: {
      name: string;
    };
    categoryName?: string;
  }

  // Extract core rows and pagination totals safely
  const rawRows: BackendBookRow[] = booksResponse?.data?.rows || [];
  const totalDatabaseRecords = Number(booksResponse?.data?.count || 0);
  const totalPages = Math.max(1, Math.ceil(totalDatabaseRecords / RECORDS_PER_PAGE));

  // 2. Data Adaptation Mapping
  const parsedBooks: BookInventoryItem[] = rawRows.map((b: BackendBookRow) => ({
    id: String(b.book_id || b.id || ""),
    title: String(b.book_name || "Untitled volume"),
    author: String(b.book_author || "Unknown"),
    totalCopies: Number(b.total_copies || b.totalCopies || 0),
    availableCopies: Number(b.available_copies ?? b.availableCopies ?? 0),
    lendingCount: Number(b.lending_count || b.lendingCount || 0),
    categoryId: String(b.category_id || b.categoryId || ""),
    categoryName: String(b.category?.name || b.categoryName || "Unclassified"),
    createdAt: String(b.created_at || b.createdAt || new Date().toISOString()),
  }));

  // 3. Operational Filter Reset Handler
  const handleClearAllFilters = () => {
    setLocalSearch("");
    setActiveSearchQuery("");
    setCategoryFilter("");
    setCurrentPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    setCurrentPage(1);
  };

  // 4. Mutation Pipelines
  const saveBookMutation = useMutation({
    mutationFn: async (payload: BookFormValues) => {
      if (selectedBook) {
        return await axiosClient.put(`/books/${selectedBook.id}`, payload);
      }
      return await axiosClient.post("/books", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["libraryBooksCatalogFeed"] });
      toast.success("updated successfully.");
      setIsFormOpen(false);
    },
    onError: () => toast.error("An error occurred during database commit operations."),
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (id: string) => await axiosClient.delete(`/books/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["libraryBooksCatalogFeed"] });
      toast.success("Deleted Successfully");
      setIsDeleteOpen(false);
      if (parsedBooks.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Action Title Jumbotron Header block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Library Books Catalog</h2>
          <p className="text-xs text-gray-500">View, evaluate, and trace total volume distribution limits across the facility.</p>
        </div>
        <button
          onClick={() => { setSelectedBook(null); setIsFormOpen(true); }}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          📚 Add New Book
        </button>
      </div>

      {/* Query Filter Navigation Controls Line */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-xl border border-gray-200 items-center justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-4/5">
          <input
            type="text"
            placeholder="🔎 Search by book title or author name..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="sm:col-span-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-600 transition-all"
          />
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white outline-none focus:ring-2 focus:ring-teal-100 transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Clear Filter Control Button */}
        <button
          onClick={handleClearAllFilters}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-all cursor-pointer col-span-2 sm:col-auto whitespace-nowrap"
        >
          Clear Filters
        </button>
      </div>

      {/* Ledger Grid Framework View */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-gray-400 font-semibold animate-pulse">Syncing Active Media Ledger Records...</div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase bg-gray-50/70">
                    <th className="py-3.5 px-4">Book Title & Creator Index</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4 text-center">Total Volumes</th>
                    <th className="py-3.5 px-4 text-center">Shelf Availability</th>
                    <th className="py-3.5 px-4 text-center">Book Lending Count</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
                  {parsedBooks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-xs text-gray-400 italic">No book matches found in the ledger indexes.</td>
                    </tr>
                  ) : (
                    parsedBooks.map((book) => (
                      /* 💡 MODIFIED: Added onClick context and cursor styling directly onto the table row wrapper */
                      <tr 
                        key={book.id} 
                        onClick={() => { setSelectedBook(book); setIsDetailOpen(true); }}
                        className="hover:bg-gray-50/80 transition-colors cursor-pointer select-none"
                      >
                        <td className="py-3.5 px-4 font-medium text-gray-900">
                          <div className="truncate max-w-xs">{book.title}</div>
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
                        <td className="py-3.5 px-4 text-center font-mono font-medium text-gray-600">{book.lendingCount} times</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RELIABLE PAGINATION FOOTER ROW CONTROLS */}
          {totalPages > 0 && (
            <div className="flex items-center justify-between bg-white px-5 py-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="text-xs text-gray-500 font-medium">
                Showing Page {currentPage} of{" "}
                {totalPages} ({totalDatabaseRecords} Books Found)
              </div>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={(e) => { e.stopPropagation(); setCurrentPage((p) => Math.max(1, p - 1)); }}
                  className="px-3 py-1.5 border border-gray-200 text-xs font-semibold rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  ◀ Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={(e) => { e.stopPropagation(); setCurrentPage((p) => Math.min(totalPages, p + 1)); }}
                  className="px-4 py-1.5 border border-gray-200 text-xs font-semibold rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Next ▶
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Embedded Modals Overlay Orchestration Grid */}
      <BookDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        book={selectedBook}
        onEditTrigger={() => setIsFormOpen(true)}
        onDeleteTrigger={() => setIsDeleteOpen(true)}
      />

      <BookModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={(vals) => saveBookMutation.mutate(vals)}
        categories={categories}
        editingBook={selectedBook}
      />

      <DeleteBookModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => selectedBook && deleteBookMutation.mutate(selectedBook.id)}
        bookTitle={selectedBook?.title || ""}
      />
    </div>
  );
};