import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/authStore";
import { CategoryDetailsModal } from "../components/CategoryDetailsModal";
import ConfirmationModal from "../../returnedbooks/components/ConfirmationModal";
import { categoryFormSchema } from "../validation/category.validation";
import type { CategoryMetrics } from "../types/category.types";

interface UpdateMutationResponse {
  data?: {
    category_name?: string;
  };
}

// 💡 Contract matching your backend paginated { rows, totalCount, totalPages, currentPage } schema
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
  const [currentPage, setCurrentPage] = useState(1); // 💡 New pagination state tracker
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
    // 💡 Appended pagination/filter keys to trigger auto-refetching
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

  // 💡 Safe extractions from our wrapper mapping contracts
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

  // Action: Open Create Modal and Ensure Form is Blank
  const handleOpenCreateModal = () => {
    setNewCatName("");
    setCreateValidationError("");
    setIsCreateOpen(true);
  };

  // Action: Reset all query parameters back to initial state
  const handleResetFilters = () => {
    setSearchQuery("");
    setBookSort("NONE");
    setBorrowSort("NONE");
    setCurrentPage(1); // Reset page indices
  };

  // Action: Add Button Submit Click Execution Handler
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
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Deck Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Manage Catalog Categories</h2>
          <p className="text-xs text-gray-500 mt-0.5">Control library book categories, analyze category engagement volumes, and manage inventory segments.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
        >
          ＋ Add New Category
        </button>
      </div>

      {/* Control Filtering Deck */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        
        {/* Search Input Box Container */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="🔎 Filter down table rows by category name..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // 💡 Reset page when applying a search filter
            }}
            className="w-full pl-3 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-slate-100 focus:border-slate-600"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold cursor-pointer transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters Grouping Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 lg:flex-none lg:w-[55%]">
          {/* Owned Books Count Sorting Filter */}
          <select
            value={bookSort}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setBookSort(e.target.value as "NONE" | "HIGH_TO_LOW" | "LOW_TO_HIGH");
              setBorrowSort("NONE"); 
              setCurrentPage(1); // 💡 Reset page when changing sort criteria
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white cursor-pointer text-gray-600 font-medium"
          >
            <option value="NONE">Sort by Owned Count: Default (ABC)</option>
            <option value="HIGH_TO_LOW">Owned Count: Highest to Lowest</option>
            <option value="LOW_TO_HIGH">Owned Count: Lowest to Highest</option>
          </select>

          {/* Borrowing Engagement / Lending Count Sorting Filter */}
          <select
            value={borrowSort}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setBorrowSort(e.target.value as "NONE" | "HIGH_TO_LOW" | "LOW_TO_HIGH");
              setBookSort("NONE"); 
              setCurrentPage(1); // 💡 Reset page when changing sort criteria
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white cursor-pointer text-gray-600 font-medium"
          >
            <option value="NONE">Sort by Borrows: Default (ABC)</option>
            <option value="HIGH_TO_LOW">Borrows Count: Highest to Lowest</option>
            <option value="LOW_TO_HIGH">Borrows Count: Lowest to Highest</option>
          </select>
        </div>

        {/* Global Reset Action Trigger */}
        {isFilterActive && (
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl shadow-3xs cursor-pointer transition-all animate-fade-in text-center whitespace-nowrap"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Main Grid Render Table Section */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-gray-400 font-semibold animate-pulse">
          Compiling catalog taxonomy architecture indices...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-bold text-gray-400 uppercase bg-gray-50/60 tracking-wider">
                    <th className="py-4 px-5">Category Name Listing</th>
                    <th className="py-4 px-5">Total Volume Stack</th>
                    <th className="py-4 px-5">Active Circulation Borrow Count</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
                  {categoriesList.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-sm text-gray-400 font-medium">
                        No library category profiles matches the search key terms.
                      </td>
                    </tr>
                  ) : (
                    categoriesList.map((cat: CategoryMetrics) => (
                      <tr
                        key={cat.category_id}
                        onClick={() => { setSelectedCategory(cat); setIsDetailsOpen(true); }}
                        className="hover:bg-slate-50 transition-colors cursor-pointer group select-none animate-fade-in"
                      >
                        <td className="py-4 px-5 font-bold text-gray-900 group-hover:text-slate-950">
                          {cat.category_name}
                        </td>
                        <td className="py-4 px-5 font-semibold text-gray-500 font-mono">
                          {cat.booksCount} books
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-3xs font-extrabold font-mono tracking-wider ${
                            cat.lendingCount > 15 
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : "bg-slate-50 text-slate-500 border border-slate-100"
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
          </div>

          {/* 💡 Pagination Controls Block UI Section */}
          <div className="flex justify-between items-center bg-white px-5 py-4 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-xs font-medium text-gray-500">
              Showing page <b>{currentPage}</b> of <b>{totalPages}</b> ({totalRecordsCount} Archives)
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg shadow-3xs text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                ◀ Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg shadow-3xs text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal A: Pop-up Form for Quick Add Creation */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsCreateOpen(false)} />
          <form 
            onSubmit={handleExecuteCreate} 
            className="relative z-10 w-full max-w-md bg-white rounded-2xl p-6 border border-slate-100 shadow-xl m-4 space-y-4"
          >
            <div>
              <h3 className="text-base font-bold text-slate-900">Add New Category Classification</h3>
              <p className="text-3xs text-slate-400 mt-0.5">Input a unique classification name to initialize shelf tags mapping slots.</p>
            </div>

            <div className="space-y-1">
              <label className="block text-3xs font-bold text-slate-400 uppercase tracking-wide">Category Name</label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Science Fiction, Biography, History"
                value={newCatName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCatName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-100 focus:border-slate-600 outline-hidden"
              />
              {createValidationError && <p className="text-3xs font-bold text-rose-500">{createValidationError}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white disabled:opacity-50 text-xs font-bold rounded-xl cursor-pointer"
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