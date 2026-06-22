import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { axiosClient } from "../../../api/axiosClient";
import { BookModal } from "../components/BookModal";
import { BookDetailModal } from "../components/BookDetailModal";
import { DeleteBookModal } from "../components/DeleteBookModal";
import type { BookInventoryItem, BookCategory, LanguageCategory } from "../../../types/books";
import type { BookFormValues } from "../schemas/bookSchema";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/authStore";
import { 
  Plus, Search, RotateCcw, X, BookOpen, ChevronDown, 
  Edit3, Trash2, ListChecks, CheckSquare, Square 
} from "lucide-react";

type RawLanguageResponse = string;

export const BooksPage = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  // Search, filter, sorting & dynamic pagination parameters
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [searchInput, setSearchInput] = useState(""); 
  const [searchTerm, setSearchTerm] = useState("");   
  const [categoryFilter, setCategoryFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [sortField, setSortField] = useState<string>(""); 
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC" | "">("");

  // UI state tracking for active header filter menus
  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<"name" | "category" | "language" | null>(null);

  // Modal open states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  
  // Selection and Bulk Actions state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [deleteTargetBooks, setDeleteTargetBooks] = useState<{ ids: string[]; displayTitle: string } | null>(null);

  // Refs for tracking outside dropdown menu clicks
  const nameDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  // Debounce logic for search field input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 350);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Click Outside Dropdowns Handler
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (nameDropdownRef.current && !nameDropdownRef.current.contains(target)) {
        setActiveHeaderDropdown((prev) => (prev === "name" ? null : prev));
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(target)) {
        setActiveHeaderDropdown((prev) => (prev === "category" ? null : prev));
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(target)) {
        setActiveHeaderDropdown((prev) => (prev === "language" ? null : prev));
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Primary Paginated Catalog Feed
  const { data: booksPayload, isLoading } = useQuery({
    queryKey: ["libraryBooksCatalogFeed", token, currentPage, itemsPerPage, searchTerm, categoryFilter, languageFilter, sortField, sortOrder],
    queryFn: async () => {
      const res = await axiosClient.get("/books", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm || undefined,
          category_id: categoryFilter || undefined,
          language: languageFilter || undefined,
          sort_by: sortField || "created_at",
          order: sortOrder || "DESC",
        },
      });

      const rootData = res.data?.data || res.data;
      const rawRecords = rootData?.rows || rootData?.data || [];
      const totalCount = Number(rootData?.count || rootData?.meta?.total || 0);

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
              isbn: String(row.isbn || "Not Found"),
            };
          })
        : [];

      return {
        total: totalCount,
        globalTotal: rootData?.meta?.globalTotalCopies ?? 0,
        globalAvailable: rootData?.meta?.globalAvailableCopies ?? 0,
        data: transformed,
      };
    },
    enabled: !!token,
  });

  // Fetch individual deep details
  const { data: detailedBook = null, isLoading: isDetailLoading } = useQuery({
    queryKey: ["bookDeepDetailRecord", selectedBookId],
    queryFn: async () => {
      if (!selectedBookId) return null;
      const res = await axiosClient.get(`/books/${selectedBookId}`);
      return res.data?.data || null;
    },
    enabled: !!selectedBookId && (isDetailOpen || isFormOpen),
  });


  // Category list dropdown feed 
  const { data: categories = [] } = useQuery<BookCategory[]>({
    queryKey: ["bookCategoriesDropdownFeed", token],
    queryFn: async () => {
      const res = await axiosClient.get("/books/categories");
      return res.data?.data || res.data || [];
    },
    enabled: !!token,
  });

  // Language list dropdown feed
  const { data: languages = [] } = useQuery<RawLanguageResponse[], Error, LanguageCategory[]>({
    queryKey: ["bookLanguageDropdownFeed", token],
    queryFn: async () => {
      const res = await axiosClient.get("/books/languages");
      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
    select: (rawData) => rawData.map((lang) => ({ id: lang, name: lang })),
    enabled: !!token,
  });

  // Mutate Save / Updates
  const saveBookMutation = useMutation({
    mutationFn: async (payload: BookFormValues) => {
      const processedPayload = {
        book_name: payload.title,
        book_author: payload.author,
        language: payload.language,
        total_copies: Number(payload.totalCopies),
        category_id: payload.categoryId,
        isbn: payload.isbn,
      };

      return selectedBookId
        ? await axiosClient.patch(`/books/${selectedBookId}`, processedPayload)
        : await axiosClient.post("/books", processedPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["libraryBooksCatalogFeed"] });
      queryClient.invalidateQueries({ queryKey: ["bookLanguageDropdownFeed"] });
      toast.success(selectedBookId ? "Book metrics updated successfully." : "New title appended to index safely!");
      setIsFormOpen(false);
      setSelectedBookId(null);
    },
    onError: (error: unknown) => {
      let msg = "Database validation failure.";
      if (error instanceof AxiosError) msg = error.response?.data?.message || msg;
      toast.error(msg);
    },
  });

  // Consolidated Single & Multi Purge Mutation Matrix
  const deleteBooksMutation = useMutation({
    mutationFn: async (bookIds: string[]) => {
      const deletionPromises = bookIds.map((id) => axiosClient.delete(`/books/${id}`));
      return await Promise.all(deletionPromises);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["libraryBooksCatalogFeed"] });
      queryClient.invalidateQueries({ queryKey: ["bookLanguageDropdownFeed"] });
      
      if (variables.length > 1) {
        toast.success(`${variables.length} volume profiles purged from catalog repository.`);
      } else {
        toast.success("Volume profile purged from repository catalog.");
      }

      setSelectedBookId(null);
      setDeleteTargetBooks(null);
      setSelectedBookIds([]);
      setIsSelectionMode(false);
    },
    onError: () => toast.error("Unable to execute target ledger deletion contracts."),
  });

  const bookList = booksPayload?.data || [];
  const hasActiveFilters = Boolean(searchInput || categoryFilter || languageFilter || sortField);
  const displayTotal = booksPayload?.total ?? 0;
  const displayGlobalTotal = booksPayload?.globalTotal ?? 0;
  const displayGlobalAvailable = booksPayload?.globalAvailable ?? 0;
  const totalPages = Math.ceil(displayTotal / itemsPerPage) || 1;

  // Multi-Selection Logic Helper Operations
  const isAllSelected = bookList.length > 0 && bookList.every((b) => selectedBookIds.includes(b.id));

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedBookIds([]);
    } else {
      setSelectedBookIds(bookList.map((b) => b.id));
    }
  };

  const handleRowCheckboxToggle = (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation(); 
    setSelectedBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setCategoryFilter("");
    setLanguageFilter("");
    setSortField("");
    setSortOrder("");
    setSelectedBookIds([]);
    setIsSelectionMode(false);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-white text-[#2D3748] antialiased pb-16 pt-10 px-8 lg:px-14 font-sans select-none">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#718096] text-[11px] font-bold uppercase tracking-widest mb-1.5">
            <BookOpen size={13} className="stroke-[2.5]" /> Inventory
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A365D]">Books Management Desk</h1>
        </div>

        <div className="flex items-center gap-10 select-none pb-0.5">
          <div>
            <span className="block text-2xl font-bold text-[#1A365D] tracking-tight leading-none text-right">{displayTotal}</span>
            <span className="text-[10px] font-semibold text-[#718096] uppercase tracking-wider mt-2 block">
              {hasActiveFilters ? "Matched Books" : "Total Books"}
            </span>
          </div>
          <div className="w-px h-6 bg-gray-200 self-end mb-0.5" />
          <div>
            <span className="block text-2xl font-bold text-emerald-600 tracking-tight leading-none text-right">{displayGlobalAvailable}</span>
            <span className="text-[10px] font-semibold text-[#718096] uppercase tracking-wider mt-2 block">On-Shelf Available</span>
          </div>
          <div className="w-px h-6 bg-gray-200 self-end mb-0.5" />
          <div>
            <span className="block text-2xl font-bold text-[#2B6CB0] tracking-tight leading-none text-right">{displayGlobalTotal}</span>
            <span className="text-[10px] font-semibold text-[#718096] uppercase tracking-wider mt-2 block">Total Managed Copies</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200 w-full mb-6" />

      <div className="flex items-center justify-between gap-4 mb-4 h-9">
        <div className="text-[10px] font-bold tracking-widest text-[#1A365D] uppercase">Volumes Ledger</div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-sm focus-within:border-gray-300 focus-within:bg-white transition-all w-48">
            <Search size={13} className="text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-transparent border-0 outline-hidden w-full text-xs font-medium text-[#1A365D] placeholder-[#A0AEC0] p-0 focus:ring-0 focus:outline-hidden"
            />
            {searchInput && (
              <button type="button" onClick={() => setSearchInput("")} className="text-gray-400 hover:text-gray-600 ml-1 shrink-0">
                <X size={11} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleClearFilters}
            className={`p-1.5 rounded-full transition-colors ${hasActiveFilters || selectedBookIds.length > 0 ? "text-rose-600 hover:bg-rose-50" : "text-gray-400 hover:bg-gray-100"}`}
            title="Reset Filters & Selections"
          >
            <RotateCcw size={15} />
          </button>

          <div className="w-px h-4 bg-gray-200 mx-0.5" />

          <button
            type="button"
            onClick={() => {
              if (!isSelectionMode) {
                setIsSelectionMode(true);
              } else if (selectedBookIds.length > 0) {
                setDeleteTargetBooks({
                  ids: selectedBookIds,
                  displayTitle: `${selectedBookIds.length} selected book volumes`,
                });
              } else {
                setIsSelectionMode(false);
              }
            }}
            className={`flex items-center justify-center p-1.5 rounded-full transition-all cursor-pointer shadow-2xs shrink-0 ${
              isSelectionMode 
                ? selectedBookIds.length > 0 
                  ? "bg-rose-600 hover:bg-rose-700 text-white" 
                  : "bg-amber-500 text-white hover:bg-amber-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title={
              isSelectionMode 
                ? selectedBookIds.length > 0 
                  ? `Click to delete selected (${selectedBookIds.length})` 
                  : "No rows selected (Click to turn off selection)"
                : "Enable Selection Mode"
            }
          >
            {isSelectionMode && selectedBookIds.length > 0 ? (
              <Trash2 size={16} strokeWidth={2.2} />
            ) : (
              <ListChecks size={16} strokeWidth={2.2} />
            )}
          </button>

          {isSelectionMode && (
            <button
              type="button"
              onClick={handleSelectAllToggle}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                isAllSelected 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
              title={isAllSelected ? "Deselect All Books" : "Select All Visible Books"}
            >
              {isAllSelected ? <CheckSquare size={13} className="text-emerald-600" /> : <Square size={13} />}
              <span>{isAllSelected ? "All Selected" : "Select All"}</span>
            </button>
          )}

          <div className="w-px h-4 bg-gray-200 mx-0.5" />

          <button
            onClick={() => {
              setSelectedBookId(null);
              setIsFormOpen(true);
            }}
            className="flex items-center justify-center p-1.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white rounded-full transition-all cursor-pointer shadow-2xs shrink-0"
            title="Add New Book"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

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
                      {isSelectionMode && <th className="pb-3 pl-3 w-[5%]" />}
                      <th className={`pb-3 pr-4 font-bold tracking-widest w-[32%] relative ${!isSelectionMode ? "pl-3" : ""}`}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveHeaderDropdown(activeHeaderDropdown === "name" ? null : "name");
                          }}
                          className={`inline-flex items-center gap-1 hover:text-[#1A365D] transition-colors uppercase tracking-widest text-[11px] font-bold ${sortField === "book_name" ? "text-[#2B6CB0]" : ""}`}
                        >
                          Book Title {sortField === "book_name" ? `(${sortOrder === "ASC" ? "A-Z" : "Z-A"})` : ""}
                          <ChevronDown size={11} className={`transition-transform duration-200 ${activeHeaderDropdown === "name" ? "rotate-180" : ""}`} />
                        </button>
                        
                        {activeHeaderDropdown === "name" && (
                          <div 
                            ref={nameDropdownRef} 
                            onClick={(e) => e.stopPropagation()}
                            className="absolute left-0 top-7 z-50 w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-1.5 text-xs text-[#2D3748] font-medium normal-case tracking-normal font-sans"
                          >
                            <button
                              type="button"
                              onClick={() => { setSortField(""); setSortOrder(""); setActiveHeaderDropdown(null); setCurrentPage(1); }}
                              className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${!sortField ? "bg-slate-50/80 text-[#2B6CB0] font-semibold" : ""}`}
                            >
                              Default (Newly Added)
                            </button>
                            <button
                              type="button"
                              onClick={() => { setSortField("book_name"); setSortOrder("ASC"); setActiveHeaderDropdown(null); setCurrentPage(1); }}
                              className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${sortField === "book_name" && sortOrder === "ASC" ? "bg-slate-50/80 text-[#2B6CB0] font-semibold" : ""}`}
                            >
                              Alphabetical (A &rarr; Z)
                            </button>
                            <button
                              type="button"
                              onClick={() => { setSortField("book_name"); setSortOrder("DESC"); setActiveHeaderDropdown(null); setCurrentPage(1); }}
                              className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${sortField === "book_name" && sortOrder === "DESC" ? "bg-slate-50/80 text-[#2B6CB0] font-semibold" : ""}`}
                            >
                              Alphabetical (Z &rarr; A)
                            </button>
                          </div>
                        )}
                      </th>
                      
                      <th className="pb-3 px-4 font-bold tracking-widest w-[16%] relative">
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
                              onClick={() => {
                                setLanguageFilter("");
                                setActiveHeaderDropdown(null);
                                setCurrentPage(1);
                              }}
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

                      <th className="pb-3 px-4 font-bold tracking-widest w-[18%] relative">
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
                              onClick={() => {
                                setCategoryFilter("");
                                setActiveHeaderDropdown(null);
                                setCurrentPage(1);
                              }}
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

                      <th className="pb-3 px-4 font-bold tracking-widest w-[18%] text-right">Availability</th>
                      <th className="pb-3 pr-3 font-bold tracking-widest w-[16%] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100 font-medium text-[#2D3748]">
                    {bookList.length === 0 ? (
                      <tr>
                        <td colSpan={isSelectionMode ? 6 : 5} className="py-20 text-left text-sm text-[#718096] font-medium pl-3">
                          No matching records currently indexed inside this filtered view.
                        </td>
                      </tr>
                    ) : (
                      bookList.map((book) => {
                        const isCurrentSelection = selectedBookId === book.id && isDetailOpen;
                        const isRowChecked = selectedBookIds.includes(book.id);
                        
                        return (
                          <tr
                            key={book.id}
                            onClick={() => {
                              if (isSelectionMode) {
                                setSelectedBookIds((prev) =>
                                  prev.includes(book.id) ? prev.filter((id) => id !== book.id) : [...prev, book.id]
                                );
                              } else {
                                setSelectedBookId(book.id);
                                setIsDetailOpen(true);
                              }
                            }}
                            className={`transition-all duration-150 cursor-pointer border-l-4 ${
                              isRowChecked ? "bg-blue-50/30 border-l-[#2B6CB0]" : isCurrentSelection ? "bg-slate-50/80 border-l-blue-500" : "hover:bg-blue-50/40 border-l-transparent"
                            }`}
                          >
                            {isSelectionMode && (
                              <td className="py-3.5 pl-3 text-center">
                                <button
                                  type="button"
                                  onClick={(e) => handleRowCheckboxToggle(e, book.id)}
                                  className="text-gray-400 hover:text-[#2B6CB0] transition-colors duration-150"
                                >
                                  {isRowChecked ? (
                                    <CheckSquare size={16} className="text-[#2B6CB0]" />
                                  ) : (
                                    <Square size={16} />
                                  )}
                                </button>
                              </td>
                            )}
                            <td className={`py-3.5 pr-4 font-semibold text-[#1A365D] truncate ${!isSelectionMode ? "pl-3" : ""}`}>
                              <div className="truncate">
                                <div className={`font-semibold tracking-tight text-sm truncate ${isCurrentSelection ? "text-[#2B6CB0]" : "text-[#1A365D]"}`}>
                                  {book.title}
                                </div>
                                <div className="text-[11px] text-[#718096] font-normal mt-0.5 truncate">By {book.author}</div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 truncate">
                              <span className="text-xs uppercase font-bold tracking-wider text-gray-700">{book.language}</span>
                            </td>
                            <td className="py-3.5 px-4 truncate">
                              <div className="font-semibold text-[#2D3748] tracking-tight text-xs truncate uppercase">{book.categoryName}</div>
                            </td>
                            <td className="py-3.5 px-4 text-right truncate">
                              <span className="inline-flex items-center gap-1.5 font-semibold text-xs select-none">
                                <span className={`w-1.5 h-1.5 rounded-full ${book.availableCopies > 0 ? "bg-emerald-500" : "bg-rose-500"}`} />
                                <span className={book.availableCopies > 0 ? "text-emerald-700" : "text-rose-700"}>
                                  {book.availableCopies} / {book.totalCopies} Left
                                </span>
                              </span>
                            </td>
                            <td className="py-3.5 pr-3 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBookId(book.id);
                                    setIsFormOpen(true);
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                                  title="Edit Volume"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteTargetBooks({ ids: [book.id], displayTitle: book.title });
                                  }}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                                  title="Purge Volume"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Dynamic Rows Pagination Footer block */}
              {totalPages > 0 && (
                <div className="py-4 border-t border-gray-100 flex justify-between items-center text-xs text-[#718096] tracking-wide mt-2 select-none pl-3">
                  <div className="flex items-center gap-2">
                    <span>Showing</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1); 
                      }}
                      className="bg-gray-50 border border-gray-200 text-gray-700 py-1 px-2 rounded-md text-xs font-semibold focus:outline-hidden focus:border-gray-300 cursor-pointer"
                    >
                      <option value={5}>5 rows</option>
                      <option value={10}>10 rows</option>
                      <option value={20}>20 rows</option>
                      <option value={50}>50 rows</option>
                      {displayTotal > 0 && (
                        <option value={displayTotal}>All ({displayTotal})</option>
                      )}
                    </select>
                    <span>of <span className="font-semibold text-gray-800">{displayTotal}</span> records</span>
                  </div>

                  {itemsPerPage < displayTotal && (
                    <div className="flex gap-4">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={(e) => { e.stopPropagation(); setCurrentPage((p) => Math.max(p - 1, 1)); }}
                        className="text-gray-600 font-semibold tracking-wider disabled:opacity-20 cursor-pointer hover:text-[#2B6CB0] flex items-center gap-1 transition-colors"
                      >
                        &larr; Previous
                      </button>
                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={(e) => { e.stopPropagation(); setCurrentPage((p) => Math.min(p + 1, totalPages)); }}
                        className="text-gray-600 font-semibold tracking-wider disabled:opacity-20 cursor-pointer hover:text-[#2B6CB0] flex items-center gap-1 transition-colors"
                      >
                        Next &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <BookDetailModal
        isOpen={isDetailOpen}
        bookDetails={detailedBook}
        isLoading={isDetailLoading}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedBookId(null);
        }}
        onEditTrigger={() => {
          setIsDetailOpen(false);
          setIsFormOpen(true);
        }}
        onDeleteTrigger={() => {
          if (selectedBookId) {
            deleteBooksMutation.mutate([selectedBookId]);
            setIsDetailOpen(false);
          }
        }}
      />

      <BookModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedBookId(null);
        }}
        onSubmit={(vals) => saveBookMutation.mutate(vals)}
        categories={categories}
        editingBook={detailedBook} 
      />

      <DeleteBookModal
        isOpen={!!deleteTargetBooks}
        onClose={() => setDeleteTargetBooks(null)}
        onConfirm={() => {
          if (deleteTargetBooks) {
            deleteBooksMutation.mutate(deleteTargetBooks.ids);
          }
        }}
        bookTitle={deleteTargetBooks?.displayTitle || ""}
      />
    </div>
  );
};