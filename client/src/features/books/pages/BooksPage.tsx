import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { BookModal } from "../components/BookModal";
import { DeleteBookModal } from "../components/DeleteBookModal";
import { BookDetailModal } from "../components/BookDetailModal";
import type { BookInventoryItem, BookCategory } from "../../../types/books";
import type { BookFormValues } from "../schemas/bookSchema";
import { toast } from "sonner";

// Editorial Icon Elements
import {
  Search,
  Plus,
  RotateCcw,
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";

export const BooksPage = () => {
  const queryClient = useQueryClient();

  // Dynamic Search Orchestration states
  const [localSearch, setLocalSearch] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Dynamic Pagination Tracking States
  const [currentPage, setCurrentPage] = useState(1);
  const RECORDS_PER_PAGE = 10;

  // Modal Visibility States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookInventoryItem | null>(
    null,
  );

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
    queryKey: [
      "libraryBooksCatalogFeed",
      activeSearchQuery,
      categoryFilter,
      currentPage,
    ],
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
    },
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
  const totalPages = Math.max(
    1,
    Math.ceil(totalDatabaseRecords / RECORDS_PER_PAGE),
  );

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

  // Save/Update Book Mutation Pipeline
  const saveBookMutation = useMutation({
    mutationFn: async (payload: BookFormValues) => {
      const processedPayload = {
        book_name: payload.title,
        book_author: payload.author,
        total_copies: Number(payload.totalCopies),
        category_id: payload.categoryId,
      };

      if (selectedBook) {
        const response = await axiosClient.patch(
          `/books/${selectedBook.id}`,
          processedPayload,
        );
        return response.data;
      }

      const response = await axiosClient.post("/books", processedPayload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["libraryBooksCatalogFeed"] });
      toast.success(
        selectedBook
          ? "Book metrics updated successfully."
          : "New title appended to index safely!",
      );
      setIsFormOpen(false);
      setSelectedBook(null);
    },
    onError: () => {
      toast.error(
        "Database schema transaction rejected our data structure formats.",
      );
    },
  });

  // Delete Book Mutation Pipeline
  const deleteBookMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosClient.delete(`/books/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["libraryBooksCatalogFeed"] });
      toast.success("Volume profile purged from repository catalog.");
      setIsDeleteOpen(false);
      setSelectedBook(null);

      if (parsedBooks.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    },
    onError: () => {
      toast.error("Unable to execute target ledger deletion contract.");
    },
  });

  return (
    <div className="flex flex-col min-h-screen max-w-6xl relative animate-fade-in pb-12 font-sans text-xs sm:text-sm text-text-main text-left">
      {/* 💳 Top Deck Banner (Synchronized heights, margins, and layout) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card-bg p-5 mb-5 rounded-2xl border border-border-main shadow-xs shrink-0">
        <div>
          <h2 className="text-xl font-bold text-text-main tracking-tight">
            Books Management Desk
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">
            View, evaluate, and trace total volume distribution limits across
            the facility.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedBook(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          <Plus size={14} /> Add New Book
        </button>
      </div>

      {/* 🎛️ Control Filtering Deck (Inline grid alignment setup) */}
      <div className="flex flex-col md:flex-row gap-3 bg-card-bg p-4 mb-5 rounded-2xl border border-border-main shadow-2xs shrink-0">
        {/* Search Input Box Container */}
        <div className="relative flex-1 w-full">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by book title or author name..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-border-main text-text-main rounded-xl text-xs sm:text-sm font-medium outline-hidden focus:bg-card-bg focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all placeholder-slate-400"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-text-main p-0.5 cursor-pointer transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters Grouping Grid */}
        <div className="flex gap-2.5 w-full md:w-auto items-center">
          {/* Category Dropdown Selection Box Container */}
          <div className="w-full md:w-56 relative">
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-border-main text-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider appearance-none outline-hidden focus:bg-card-bg focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <ChevronDown size={14} />
            </span>
          </div>

          {/* Reset Action Control Trigger */}
          <button
            type="button"
            onClick={handleClearAllFilters}
            className="px-4 py-2 h-8.5 text-xs font-bold text-slate-500 bg-slate-50 border border-border-main hover:bg-slate-100 hover:text-text-main rounded-xl cursor-pointer transition-all text-center whitespace-nowrap flex items-center justify-center gap-1.5 uppercase"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* 📊 Main Table Grid Render Block Layout */}
      {isLoading ? (
        <div className="text-center py-20 text-xs sm:text-sm text-slate-400 font-semibold animate-pulse flex-1 flex flex-col items-center justify-center gap-2">
          Syncing Active Media Ledger Records...
        </div>
      ) : (
        <div className="flex flex-col flex-1 space-y-5">
          <div className="bg-card-bg rounded-2xl border border-border-main shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-main text-[11px] font-bold text-slate-400 uppercase bg-slate-50 tracking-wider">
                    <th className="py-3.5 px-5">Book Title & Creator Index</th>
                    <th className="py-3.5 px-5">Category</th>
                    <th className="py-3.5 px-5 text-center">Total Volumes</th>
                    <th className="py-3.5 px-5 text-center">
                      Shelf Availability
                    </th>
                    <th className="py-3.5 px-5 text-right">
                      Book Lending Count
                    </th>
                  </tr>
                </thead>
                <tbody className="text-xs sm:text-sm divide-y divide-slate-100 text-text-main">
                  {parsedBooks.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-20 text-xs text-slate-500 font-medium"
                      >
                        Operational Clear View. Zero matching volume records
                        found inside database indexes.
                      </td>
                    </tr>
                  ) : (
                    parsedBooks.map((book) => (
                      <tr
                        key={book.id}
                        onClick={() => {
                          setSelectedBook(book);
                          setIsDetailOpen(true);
                        }}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer select-none group"
                      >
                        <td className="py-3.5 px-5 text-text-main">
                          <div className="truncate max-w-xs font-bold text-text-main">
                            {book.title}
                          </div>
                          <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">
                            By {book.author}
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-slate-50 text-text-main border border-slate-100">
                            <Award size={11} className="text-amber-500" />
                            {book.categoryName}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-center font-mono font-bold text-text-main">
                          {book.totalCopies}
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase border ${
                              book.availableCopies > 0
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-rose-50 text-rose-700 border-rose-100"
                            }`}
                          >
                            {book.availableCopies} left
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-medium text-slate-500 text-right">
                          <div className="flex items-center justify-end gap-1 font-bold text-text-main text-xs sm:text-sm uppercase tracking-wide">
                            <BookOpen size={12} className="text-slate-400" />
                            <span>{book.lendingCount} times</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 🏁 Standard Footer Pagination Row Controls Container */}
            {totalPages > 0 && (
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>
                  Page {currentPage} / {totalPages}{" "}
                  <span className="text-slate-300 mx-2">|</span> Total{" "}
                  {totalDatabaseRecords} Books
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPage((p) => Math.max(1, p - 1));
                    }}
                    className="p-2 border border-border-main bg-card-bg hover:bg-slate-50 text-slate-600 rounded-lg disabled:opacity-30 cursor-pointer transition-colors shadow-xs"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                    }}
                    className="p-2 border border-border-main bg-card-bg hover:bg-slate-50 text-slate-600 rounded-lg disabled:opacity-30 cursor-pointer transition-colors shadow-xs"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🪟 Modals Infrastructure Overlay Layer Blocks */}
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
        onConfirm={() =>
          selectedBook && deleteBookMutation.mutate(selectedBook.id)
        }
        bookTitle={selectedBook?.title || ""}
      />
    </div>
  );
};
