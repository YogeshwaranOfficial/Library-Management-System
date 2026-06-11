import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/authStore";
import { CategoryDetailsModal } from "../components/CategoryDetailsModal";
import ConfirmationModal from "../../returnedbooks/components/ConfirmationModal";
import { categoryFormSchema } from "../validation/category.validation";
import type { CategoryMetrics } from "../types/category.types";

// Editorial Visual Assets
import { 
  Plus, 
  Search, 
  X, 
  ChevronDown, 
  RotateCcw, 
  Layers, 
  BookOpen, 
  RefreshCw, 
  AlertTriangle,
  FolderPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface UpdateMutationResponse {
  data?: {
    category_name?: string;
  };
}

interface ServerPaginationWrapper {
  rows: CategoryMetrics[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export const ManageCategories = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  // 🔎 Layout Control Parameters
  const [searchQuery, setSearchQuery] = useState("");
  const [bookSort, setBookSort] = useState<"NONE" | "HIGH_TO_LOW" | "LOW_TO_HIGH">("NONE");
  const [borrowSort, setBorrowSort] = useState<"NONE" | "HIGH_TO_LOW" | "LOW_TO_HIGH">("NONE");
  const [currentPage, setCurrentPage] = useState(1); 
  const rowsPerPage = 10;

  // 📝 Creation Dialog Variables
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [createValidationError, setCreateValidationError] = useState("");

  // 📊 Detail Display Management State
  const [selectedCategory, setSelectedCategory] = useState<CategoryMetrics | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // 🚨 Deletion Reconfirmation Setup State
  const [deleteConfirmConfig, setDeleteConfirmConfig] = useState<{ isOpen: boolean; targetCat: CategoryMetrics | null }>({
    isOpen: false,
    targetCat: null,
  });

  // Query: Fetch structured aggregation framework from server
  const { data: serverPayload, isLoading } = useQuery<ServerPaginationWrapper>({
    queryKey: ["libraryCategoriesAggregationFeed", token, currentPage, searchQuery, bookSort, borrowSort],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
        bookSort,
        borrowSort,
        ...(searchQuery.trim() && { search: searchQuery.trim() })
      });
      const res = await axiosClient.get(`/categories/metrics?${params.toString()}`);
      return res.data?.data || res.data;
    },
    enabled: !!token,
  });

  const categoriesList = serverPayload?.rows || [];
  const totalRecordsCount = serverPayload?.totalCount || 0;
  const totalPages = serverPayload?.totalPages || 1;

  // Mutation: Store New Row Asset
  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      return await axiosClient.post("/categories", { category_name: name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["libraryCategoriesAggregationFeed"] });
      toast.success("New category added successfully.");
      setIsCreateOpen(false);
      setNewCatName("");
    },
    onError: () => toast.error("Server baseline engine rejected insertion pipeline."),
  });

  // Mutation: Save Partial Update Edits
  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      return await axiosClient.patch(`/categories/${id}`, { category_name: name });
    },
    onSuccess: (res) => {
      const responseData = res.data as UpdateMutationResponse | undefined;
      queryClient.invalidateQueries({ queryKey: ["libraryCategoriesAggregationFeed"] });
      toast.success("Category name updated successfully.");
      
      if (selectedCategory) {
        setSelectedCategory((prev) => 
          prev ? { ...prev, category_name: responseData?.data?.category_name || prev.category_name } : null
        );
      }
    },
    onError: () => toast.error("Failed to alter category reference values safely."),
  });

  // Mutation: Permanent Row Cascade Purging
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await axiosClient.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["libraryCategoriesAggregationFeed"] });
      toast.success("Categories deleted successfully and Books under the category also removed.");
      setIsDetailsOpen(false);
      setSelectedCategory(null);
      setDeleteConfirmConfig({ isOpen: false, targetCat: null });
    },
    onError: () => toast.error("Database constraint rejected Delete transaction profile."),
  });

  const handleOpenCreateModal = () => {
    setNewCatName("");
    setCreateValidationError("");
    setIsCreateOpen(true);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setBookSort("NONE");
    setBorrowSort("NONE");
    setCurrentPage(1);
  };

  const handleExecuteCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeNames = categoriesList.map(c => c.category_name);
    const validator = categoryFormSchema(activeNames).safeParse({ categoryName: newCatName });

    if (!validator.success) {
      setCreateValidationError(validator.error.issues[0].message);
      return;
    }

    setCreateValidationError("");
    createMutation.mutate(newCatName.trim());
  };

  const handleTriggerDeleteSequence = (cat: CategoryMetrics) => {
    setDeleteConfirmConfig({ isOpen: true, targetCat: cat });
  };

  const isGlobalProcessing = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const isFilterActive = searchQuery.trim() !== "" || bookSort !== "NONE" || borrowSort !== "NONE";

  return (
    <div className="space-y-6 animate-fade-in font-sans text-xs sm:text-sm text-slate-700 text-left">
      
      {/* Top Deck Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Categories Management Desk</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Control library book categories, analyze category engagement volumes, and manage inventory segments.</p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap uppercase tracking-wider flex items-center gap-2"
        >
          <Plus size={14} /> Add New Category
        </button>
      </div>

      {/* Control Filtering Deck */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        
        {/* Search Input Box Container */}
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Filter down table rows by category name..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); 
            }}
            className="w-full pl-11 pr-11 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs sm:text-sm font-medium outline-hidden focus:bg-white focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all placeholder-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 p-1 cursor-pointer transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters Grouping Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 lg:flex-none lg:w-[55%]">
          <div className="relative">
            <select
              value={bookSort}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setBookSort(e.target.value as "NONE" | "HIGH_TO_LOW" | "LOW_TO_HIGH");
                setBorrowSort("NONE"); 
                setCurrentPage(1); 
              }}
              className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-bold outline-hidden focus:bg-white cursor-pointer transition-all appearance-none"
            >
              <option value="NONE">Sort by Owned Count: Default</option>
              <option value="HIGH_TO_LOW">Owned Count: High to Low</option>
              <option value="LOW_TO_HIGH">Owned Count: Low to High</option>
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <ChevronDown size={14} />
            </span>
          </div>

          <div className="relative">
            <select
              value={borrowSort}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setBorrowSort(e.target.value as "NONE" | "HIGH_TO_LOW" | "LOW_TO_HIGH");
                setBookSort("NONE"); 
                setCurrentPage(1); 
              }}
              className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-bold outline-hidden focus:bg-white cursor-pointer transition-all appearance-none"
            >
              <option value="NONE">Sort by Borrows: Default</option>
              <option value="HIGH_TO_LOW">Borrows Count: High to Low</option>
              <option value="LOW_TO_HIGH">Borrows Count: Low to High</option>
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <ChevronDown size={14} />
            </span>
          </div>
        </div>

        {/* Global Reset Action Trigger */}
        {isFilterActive && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 rounded-xl cursor-pointer transition-all animate-fade-in text-center whitespace-nowrap flex items-center justify-center gap-1.5"
          >
            <RotateCcw size={12} /> Reset Filters
          </button>
        )}
      </div>

      {/* Main Grid Render Table Section */}
      {isLoading ? (
        <div className="text-center py-24 text-xs sm:text-sm text-slate-400 font-bold animate-pulse tracking-wide flex flex-col items-center justify-center gap-3">
          <RefreshCw size={20} className="animate-spin text-slate-300" />
          Compiling catalog taxonomy architecture indices...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] sm:text-xs font-bold text-slate-400 uppercase bg-slate-50 tracking-wider">
                    <th className="py-4 px-6 flex items-center gap-1.5"><Layers size={12} /> Category Name Listing</th>
                    <th className="py-4 px-6"><BookOpen size={12} className="inline mr-1.5" />Total Volume Stack</th>
                    <th className="py-4 px-6">Active Circulation Borrow Count</th>
                  </tr>
                </thead>
                <tbody className="text-xs sm:text-sm divide-y divide-slate-100 text-slate-700">
                  {categoriesList.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-16 text-center text-slate-400 font-medium">
                        No library category profiles match the search key terms.
                      </td>
                    </tr>
                  ) : (
                    categoriesList.map((cat: CategoryMetrics) => (
                      <tr
                        key={cat.category_id}
                        onClick={() => { setSelectedCategory(cat); setIsDetailsOpen(true); }}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group select-none animate-fade-in"
                      >
                        <td className="py-4 px-6 font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                          {cat.category_name}
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-500 font-mono text-[11px] sm:text-xs">
                          {cat.booksCount} books
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold font-mono tracking-wide border ${
                            cat.lendingCount > 15 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}>
                            {cat.lendingCount} times
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

           {totalPages > 0 && (
                        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                          <span>
                            Page {currentPage} / {totalPages} <span className="text-slate-300 mx-2">|</span> Total {totalRecordsCount} Categories
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={currentPage === 1}
                              onClick={(e) => { e.stopPropagation(); setCurrentPage((p) => Math.max(1, p - 1)); }}
                              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg disabled:opacity-30 cursor-pointer transition-colors shadow-xs"
                            >
                              <ChevronLeft size={14} />
                            </button>
                            <button
                              type="button"
                              disabled={currentPage === totalPages}
                              onClick={(e) => { e.stopPropagation(); setCurrentPage((p) => Math.min(totalPages, p + 1)); }}
                              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg disabled:opacity-30 cursor-pointer transition-colors shadow-xs"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                      )}
          </div>

          {/* Pagination Controls Block UI Section */}
          {/* <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs sm:text-sm font-medium text-slate-500">
              Showing page <b className="text-slate-900 font-mono">{currentPage}</b> of <b className="text-slate-900 font-mono">{totalPages}</b> (<span className="font-mono">{totalRecordsCount}</span> Archives)
            </span>
            <div className="flex gap-3 text-xs font-bold uppercase tracking-wider">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 hover:border-slate-300 disabled:opacity-40 disabled:hover:text-slate-400 disabled:hover:border-slate-200 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                ◀ Previous
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 hover:border-slate-300 disabled:opacity-40 disabled:hover:text-slate-400 disabled:hover:border-slate-200 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Next ▶
              </button>
            </div>
          </div> */}


          
        </div>
      )}

      {/* Modal A: Pop-up Form for Quick Add Creation */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsCreateOpen(false)} />
          <form 
            onSubmit={handleExecuteCreate} 
            className="relative z-10 w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl space-y-5 text-slate-700 animate-scale-up"
          >
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FolderPlus size={18} className="text-slate-500" /> Add Category Classification
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Input a unique classification name to initialize shelf tags mapping slots.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Category Name</label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Science Fiction, Biography, History"
                value={newCatName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCatName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs sm:text-sm font-bold focus:bg-white outline-hidden focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all placeholder-slate-400"
              />
              {createValidationError && (
                <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertTriangle size={12} /> {createValidationError}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2 text-xs font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl hover:text-slate-900 hover:border-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white disabled:bg-slate-100 disabled:text-slate-400 rounded-xl cursor-pointer transition-all shadow-md"
              >
                {createMutation.isPending ? "Creating..." : "Add Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal B: In-depth Asset Details View & Inline Edit Overlay Panel */}
      <CategoryDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        category={selectedCategory}
        onUpdateName={async (id, name) => { await updateMutation.mutateAsync({ id, name }); }}
        onDeleteCategory={(cat) => handleTriggerDeleteSequence(cat)}
        isMutating={isGlobalProcessing}
      />

      {/* Modal C: Strict Structural Safeguard Cascade Deletion Popup */}
      <ConfirmationModal
        isOpen={deleteConfirmConfig.isOpen}
        onClose={() => setDeleteConfirmConfig({ isOpen: false, targetCat: null })}
        onConfirm={() => {
          if (deleteConfirmConfig.targetCat) {
            deleteMutation.mutate(deleteConfirmConfig.targetCat.category_id);
          }
        }}
        title={`⚠️ Remove ${deleteConfirmConfig.targetCat?.category_name || "Category"} Catalog Cluster?`}
        description={`CRITICAL SAFEGUARD WARNING: This operation will permanently delete this category profile along with ALL (${deleteConfirmConfig.targetCat?.booksCount || 0}) underlying book rows and historical circulation logs linked to this ID across the library database! This cannot be undone.`}
        confirmText="Confirm Cascade Purge"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};