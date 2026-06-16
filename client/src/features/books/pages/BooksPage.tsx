import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { axiosClient } from "../../../api/axiosClient";
import { BookModal } from "../components/BookModal";
import { BookDetailModal } from "../components/BookDetailModal";
import type { BookInventoryItem, BookCategory, LanguageCategory } from "../../../types/books";
import type { BookFormValues } from "../schemas/bookSchema";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/authStore";
import {
  Plus,
  Search,
  RotateCcw,
  X,
  BookOpen,
  ChevronDown
} from "lucide-react";

type RawLanguageResponse = string;

export const BooksPage = () => {
  const queryClient = useQueryClient();

  // Search filter parameters
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");

  // UI state tracking for active header filter menus
  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<"category" | "language" | null>(null);

  // Modal open states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookInventoryItem | null>(null);

  const token = useAuthStore((state) => state.token);
  
  // Refs for tracking outside dropdown menu clicks
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  // Close filters if a user clicks outside the element boundary boxes
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        activeHeaderDropdown === "category" && 
        categoryDropdownRef.current && 
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setActiveHeaderDropdown(null);
      }
      if (
        activeHeaderDropdown === "language" && 
        languageDropdownRef.current && 
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setActiveHeaderDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [activeHeaderDropdown]);

  // Dynamic paginated data grid query cache feed layer
  const { data: booksPayload, isLoading } = useQuery({
    queryKey: ["libraryBooksCatalogFeed", token, currentPage, searchTerm, categoryFilter, languageFilter],
    queryFn: async () => {
      const res = await axiosClient.get("/books", {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          category_id: categoryFilter || undefined,
          language: languageFilter || undefined,
        },
      });

      const rootData = res.data?.data || res.data;
      const rawRecords = rootData?.rows || rootData?.data || [];
      const totalCount = Number(rootData?.count || rootData?.meta?.total || 0);
      
      const globalTotalCopies = rootData?.meta?.globalTotalCopies ?? 0;
      const globalAvailableCopies = rootData?.meta?.globalAvailableCopies ?? 0;

      const transformed = Array.isArray(rawRecords)
        ? rawRecords.map((dbRow: unknown): BookInventoryItem => {
            const row = dbRow as Record<string, unknown>;
            const catObj = (row.category || {}) as Record<string, unknown>;

            return {
              id: String(row.book_id || row.id || ""),
              title: String(row.book_name || "Untitled Volume"),
              author: String(row.book_author || "Unknown Author"),
              totalCopies: Number(row.total_copies || row.totalCopies || 0),
              availableCopies: Number(row.available_copies ?? row.availableCopies ?? 0),
              language: String(row.language || "Not Mentioned"),
              lendingCount: Number(row.lending_count || row.lendingCount || 0),
              categoryId: String(row.category_id || row.categoryId || ""),
              categoryName: String(catObj.name || row.categoryName || "Unclassified"),
              createdAt: String(row.created_at || row.createdAt || new Date().toISOString()),
            };
          })
        : [];

      return { 
        total: totalCount, 
        globalTotal: globalTotalCopies, 
        globalAvailable: globalAvailableCopies, 
        data: transformed 
      };
    },
    enabled: !!token,
  });

  // Category selection options list feed route query
  const { data: categories = [] } = useQuery<BookCategory[]>({
    queryKey: ["bookCategoriesDropdownFeed", token],
    queryFn: async () => {
      const res = await axiosClient.get("/books/categories");
      return res.data?.data || res.data || [];
    },
    enabled: !!token,
  });

  // FIXED: Explicitly corrected mapping types to parse languages correctly
  const { data: languages = [] } = useQuery<RawLanguageResponse[], Error, LanguageCategory[]>({
    queryKey: ["bookLanguageDropdownFeed", token],
    queryFn: async (): Promise<RawLanguageResponse[]> => {
      const res = await axiosClient.get("/books/languages");
      const rootData = res.data?.data || [];
      return Array.isArray(rootData) ? rootData : [];
    },
    select: (rawData: RawLanguageResponse[]): LanguageCategory[] => {
      return rawData.map((langName: string) => ({
        id: langName,   
        name: langName, 
      }));
    },
    enabled: !!token,
  });

  // Save/Update mutation execution framework pipelines
  const saveBookMutation = useMutation({
    mutationFn: async (payload: BookFormValues) => {
      const processedPayload = {
        book_name: payload.title,
        book_author: payload.author,
        language: payload.language,
        total_copies: Number(payload.totalCopies),
        category_id: payload.categoryId,
      };

      if (selectedBook) {
        return await axiosClient.patch(`/books/${selectedBook.id}`, processedPayload);
      }
      return await axiosClient.post("/books", processedPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["libraryBooksCatalogFeed"] });
      queryClient.invalidateQueries({ queryKey: ["bookLanguageDropdownFeed"] });
      toast.success(selectedBook ? "Book metrics updated successfully." : "New title appended to index safely!");
      setIsFormOpen(false);
      setSelectedBook(null);
    },
    onError: (error: unknown) => {
      let msg = "Database validation failure.";
      if (error instanceof AxiosError) msg = error.response?.data?.message || msg;
      toast.error(msg);
    },
  });

  // Delete inventory item target execution pipeline 
  const deleteBookMutation = useMutation({
    mutationFn: async (bookId: string) => {
      return await axiosClient.delete(`/books/${bookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["libraryBooksCatalogFeed"] });
      queryClient.invalidateQueries({ queryKey: ["bookLanguageDropdownFeed"] });
      toast.success("Volume profile purged from repository catalog.");
      setSelectedBook(null);
    },
    onError: () => {
      toast.error("Unable to execute target ledger deletion contract.");
    },
  });

  const bookList = booksPayload?.data || [];
  const hasActiveFilters = Boolean(searchTerm || categoryFilter || languageFilter);
  const displayTotal = booksPayload?.total ?? 0;

  const displayGlobalTotal = booksPayload?.globalTotal ?? 0;
  const displayGlobalAvailable = booksPayload?.globalAvailable ?? 0;

  const totalPages = Math.ceil(displayTotal / 10) || 1;

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setLanguageFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-white text-[#2D3748] antialiased pb-16 pt-10 px-8 lg:px-14 font-sans select-none">
      
      {/* HEADER BLOCK WITH CORRESPONDING RESPONSIVE LIVE METRICS STRIPS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#718096] text-[11px] font-bold uppercase tracking-widest mb-1.5">
            <BookOpen size={13} className="stroke-[2.5]" /> Inventory
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A365D]">
            Books Management Desk
          </h1>
        </div>

        {/* Dynamic Metric Tracker Cards Block */}
        <div className="flex items-center gap-10 select-none pb-0.5">
          <div>
            <span className="block text-2xl font-bold text-[#1A365D] tracking-tight leading-none text-right">
              {displayTotal}
            </span>
            <span className="text-[10px] font-semibold text-[#718096] uppercase tracking-wider mt-2 block">
              {hasActiveFilters ? "Matched Volumes" : "Total Titles"}
            </span>
          </div>
          <div className="w-px h-6 bg-gray-200 self-end mb-0.5" />
          <div>
            <span className="block text-2xl font-bold text-emerald-600 tracking-tight leading-none text-right">
              {displayGlobalAvailable}
            </span>
            <span className="text-[10px] font-semibold text-[#718096] uppercase tracking-wider mt-2 block">
              On-Shelf Available
            </span>
          </div>
          <div className="w-px h-6 bg-gray-200 self-end mb-0.5" />
          <div>
            <span className="block text-2xl font-bold text-[#2B6CB0] tracking-tight leading-none text-right">
              {displayGlobalTotal}
            </span>
            <span className="text-[10px] font-semibold text-[#718096] uppercase tracking-wider mt-2 block">
              Total Managed Copies
            </span>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200 w-full mb-6" />

      {/* CORE CONTROL TOOLBAR UTILITY BAR LINE */}
      <div className="flex items-center justify-between gap-4 mb-4 h-9">
        <div className="text-[10px] font-bold tracking-widest text-[#1A365D] uppercase">
          Volumes Ledger
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-sm focus-within:border-gray-300 focus-within:bg-white transition-all w-48">
            <Search size={13} className="text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border-0 outline-hidden w-full text-xs font-medium text-[#1A365D] placeholder-[#A0AEC0] p-0 focus:ring-0 focus:outline-hidden"
            />
            {searchTerm && (
              <button 
                type="button" 
                onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
                className="text-gray-400 hover:text-gray-600 ml-1 shrink-0"
              >
                <X size={11} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleClearFilters}
            className={`p-1.5 rounded-full transition-colors ${hasActiveFilters ? "text-rose-600 hover:bg-rose-50" : "text-gray-400 hover:bg-gray-100"}`}
            title="Reset Filters"
          >
            <RotateCcw size={15} />
          </button>

          <div className="w-px h-4 bg-gray-200 mx-0.5" />

          <button
            onClick={() => { setSelectedBook(null); setIsFormOpen(true); }}
            className="flex items-center justify-center p-1.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white rounded-full transition-all cursor-pointer shadow-2xs shrink-0"
            title="Add New Book"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* PRIMARY DATA VIEWS LAYOUT CONTAINER */}
      <div className="flex items-start gap-10 w-full">
        <div className="w-full">
          {isLoading ? (
            <div className="py-24 text-xs font-semibold text-[#718096] tracking-widest uppercase animate-pulse">
              Syncing active media ledger sequences...
            </div>
          ) : (
            <div className="w-full">
              <div className="overflow-visible w-full">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="border-b border-gray-200 text-[11px] font-bold text-[#718096] uppercase tracking-widest bg-transparent select-none">
                      <th className="pb-3 pr-4 font-bold tracking-widest w-[38%] pl-3">Book Title & Creator Index</th>
                      
                      {/* LANGUAGE INTERACTIVE SELECT HEADER CELL */}
                      <th className="pb-3 px-4 font-bold tracking-widest w-[20%] relative">
                        <button
                          type="button"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setActiveHeaderDropdown(activeHeaderDropdown === "language" ? null : "language"); 
                          }}
                          className={`inline-flex items-center gap-1 hover:text-[#1A365D] transition-colors uppercase tracking-widest text-[11px] font-bold ${languageFilter ? "text-[#2B6CB0]" : ""}`}
                        >
                          Language {languageFilter ? `(${languageFilter})` : ""}
                          <ChevronDown size={11} className={`transition-transform duration-200 ${activeHeaderDropdown === "language" ? "rotate-180" : ""}`} />
                        </button>

                        {activeHeaderDropdown === "language" && (
                          <div 
                            ref={languageDropdownRef} 
                            onClick={(e) => e.stopPropagation()}
                            className="absolute left-4 top-7 z-50 w-40 bg-white border border-gray-200 rounded-lg shadow-xl py-1.5 text-xs text-[#2D3748] font-medium normal-case tracking-normal max-h-60 overflow-y-auto"
                          >
                            <button
                              type="button"
                              onClick={() => { setLanguageFilter(""); setActiveHeaderDropdown(null); setCurrentPage(1); }}
                              className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${!languageFilter ? "bg-slate-50/80 text-[#2B6CB0] font-semibold" : ""}`}
                            >
                              All Languages
                            </button>
                            {languages.map((lang) => (
                              <button
                                key={lang.id}
                                type="button"
                                onClick={() => { 
                                  setLanguageFilter(lang.id); 
                                  setActiveHeaderDropdown(null); 
                                  setCurrentPage(1); 
                                }}
                                className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors truncate ${languageFilter === lang.id ? "bg-slate-50/80 text-[#2B6CB0] font-semibold" : ""}`}
                              >
                                {lang.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </th>
                      
                      {/* CATEGORY INTERACTIVE SELECT HEADER CELL */}
                      <th className="pb-3 px-4 font-bold tracking-widest w-[22%] relative">
                        <button
                          type="button"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setActiveHeaderDropdown(activeHeaderDropdown === "category" ? null : "category"); 
                          }}
                          className={`inline-flex items-center gap-1 hover:text-[#1A365D] transition-colors uppercase tracking-widest text-[11px] font-bold ${categoryFilter ? "text-[#2B6CB0]" : ""}`}
                        >
                          Category {categoryFilter ? "(Filtered)" : ""}
                          <ChevronDown size={11} className={`transition-transform duration-200 ${activeHeaderDropdown === "category" ? "rotate-180" : ""}`} />
                        </button>
                        
                        {activeHeaderDropdown === "category" && (
                          <div 
                            ref={categoryDropdownRef} 
                            onClick={(e) => e.stopPropagation()}
                            className="absolute left-4 top-7 z-50 w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-1.5 text-xs text-[#2D3748] font-medium normal-case tracking-normal max-h-60 overflow-y-auto"
                          >
                            <button
                              type="button"
                              onClick={() => { setCategoryFilter(""); setActiveHeaderDropdown(null); setCurrentPage(1); }}
                              className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${!categoryFilter ? "bg-slate-50/80 text-[#2B6CB0] font-semibold" : ""}`}
                            >
                              All Categories
                            </button>
                            {categories.map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => { 
                                  setCategoryFilter(cat.id); 
                                  setActiveHeaderDropdown(null); 
                                  setCurrentPage(1); 
                                }}
                                className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors truncate ${categoryFilter === cat.id ? "bg-slate-50/80 text-[#2B6CB0] font-semibold" : ""}`}
                              >
                                {cat.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </th>

                      <th className="pb-3 px-4 font-bold tracking-widest w-[20%] text-right">Availability</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100 font-medium text-[#2D3748]">
                    {bookList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-20 text-left text-sm text-[#718096] font-medium pl-3">
                          No matching records currently indexed inside this filtered view.
                        </td>
                      </tr>
                    ) : (
                      bookList.map((book) => {
                        const isCurrentSelection = selectedBook?.id === book.id && isDetailOpen;
                        return (
                          <tr
                            key={book.id}
                            onClick={() => {
                              setSelectedBook(book);
                              setIsDetailOpen(true);
                            }}
                            className={`transition-all duration-150 cursor-pointer border-l-4 ${
                              isCurrentSelection 
                                ? 'bg-slate-50/80 border-l-4 border-l-blue-500'
                                : 'hover:bg-blue-50/40 border-l-4 border-l-transparent'
                            }`}
                          >
                            <td className="py-3.5 pr-4 pl-3 font-semibold text-[#1A365D] truncate">
                              <div className="truncate">
                                <div className={`font-semibold tracking-tight text-sm truncate ${isCurrentSelection ? "text-[#2B6CB0]" : "text-[#1A365D]"}`}>
                                  {book.title}
                                </div>
                                <div className="text-[11px] text-[#718096] font-normal mt-0.5 truncate">
                                  By {book.author}
                                </div>
                              </div>
                            </td>
                            
                            <td className="py-3.5 px-4 truncate">
                              <span className="text-xs uppercase font-bold tracking-wider text-gray-700">
                                {book.language}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 truncate">
                              <div className="font-semibold text-[#2D3748] tracking-tight text-xs truncate uppercase">
                                {book.categoryName}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-right truncate">
                              <span className="inline-flex items-center gap-1.5 font-semibold text-xs select-none">
                                <span className={`w-1.5 h-1.5 rounded-full ${book.availableCopies > 0 ? "bg-emerald-500" : "bg-rose-500"}`} />
                                <span className={book.availableCopies > 0 ? "text-emerald-700 font-mono" : "text-rose-700 font-mono"}>
                                  {book.availableCopies} / {book.totalCopies} Left
                                </span>
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION SUITE LAYER BLOCK CONTROLS */}
              {totalPages > 0 && (
                <div className="py-4 border-t border-gray-100 flex justify-between items-center text-xs text-[#718096] tracking-wide mt-2 select-none pl-3">
                  <span>Page <span className="font-semibold text-gray-800">{currentPage}</span> of <span className="font-semibold text-gray-800">{totalPages}</span></span>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={(e) => { e.stopPropagation(); setCurrentPage((p) => Math.max(p - 1, 1)); }}
                      className="text-gray-600 font-semibold tracking-wider disabled:opacity-20 cursor-pointer hover:text-[#2B6CB0] flex items-center gap-1 transition-colors"
                    >
                      ← Previous
                    </button>
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={(e) => { e.stopPropagation(); setCurrentPage((p) => Math.min(p + 1, totalPages)); }}
                      className="text-gray-600 font-semibold tracking-wider disabled:opacity-20 cursor-pointer hover:text-[#2B6CB0] flex items-center gap-1 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* THE INTEGRATED BOOK DETAIL DIALOG POPUP MODAL */}
      <BookDetailModal
        isOpen={isDetailOpen}
        book={selectedBook}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedBook(null); // Keep this safely here ONLY for standard manual modal exits
        }}
        onEditTrigger={() => {
          // CRITICAL FIX: Close the detail overlay window, but DO NOT nullify selectedBook!
          setIsDetailOpen(false);
          setIsFormOpen(true);
        }}
        onDeleteTrigger={() => {
          if (selectedBook) {
            deleteBookMutation.mutate(selectedBook.id);
            setIsDetailOpen(false);
          }
        }}
      />

      {/* OVERLAY CONFIGURATION/ADD FORM DIALOG LAYER */}
      <BookModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedBook(null); // Cleans up after form submission/cancellation
        }}
        onSubmit={(vals) => saveBookMutation.mutate(vals)}
        categories={categories}
        editingBook={selectedBook}
      />
    </div>
  );
};