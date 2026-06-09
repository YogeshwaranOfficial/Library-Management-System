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
    <div className="space-y-6 animate-fade-in font-sans text-slate-secondary">
      
      {/* Top Deck Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-light/10 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-secondary tracking-tight">Manage Catalog Categories</h2>
          <p className="text-xs text-slate-light mt-0.5 font-medium">Control library book categories, analyze category engagement volumes, and manage inventory segments.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-sage-primary hover:bg-sage-primary/90 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap uppercase tracking-wider"
        >
          ＋ Add New Category
        </button>
      </div>

      {/* Control Filtering Deck */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-white p-4 rounded-xl border border-slate-light/10 shadow-2xs">
        
        {/* Search Input Box Container */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Filter down table rows by category name..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); 
            }}
            className="w-full pl-3 pr-10 py-2 bg-canvas-dominant border border-slate-light/10 text-slate-secondary rounded-xl text-sm font-semibold outline-hidden focus:bg-white focus:ring-4 focus:ring-sage-primary/10 focus:border-sage-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-light hover:text-slate-secondary text-xs font-bold cursor-pointer transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters Grouping Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 lg:flex-none lg:w-[55%]">
          <select
            value={bookSort}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setBookSort(e.target.value as "NONE" | "HIGH_TO_LOW" | "LOW_TO_HIGH");
              setBorrowSort("NONE"); 
              setCurrentPage(1); 
            }}
            className="px-3 py-2 bg-canvas-dominant border border-slate-light/10 text-slate-secondary rounded-xl text-sm font-semibold outline-hidden focus:bg-white cursor-pointer transition-all"
          >
            <option value="NONE">Sort by Owned Count: Default (ABC)</option>
            <option value="HIGH_TO_LOW">Owned Count: Highest to Lowest</option>
            <option value="LOW_TO_HIGH">Owned Count: Lowest to Highest</option>
          </select>

          <select
            value={borrowSort}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setBorrowSort(e.target.value as "NONE" | "HIGH_TO_LOW" | "LOW_TO_HIGH");
              setBookSort("NONE"); 
              setCurrentPage(1); 
            }}
            className="px-3 py-2 bg-canvas-dominant border border-slate-light/10 text-slate-secondary rounded-xl text-sm font-semibold outline-hidden focus:bg-white cursor-pointer transition-all"
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
            className="px-4 py-2 text-xs font-bold text-slate-light bg-canvas-dominant border border-slate-light/10 hover:text-slate-secondary rounded-xl shadow-3xs cursor-pointer transition-all animate-fade-in text-center whitespace-nowrap"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Main Grid Render Table Section */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-slate-light font-bold animate-pulse tracking-wide">
          Compiling catalog taxonomy architecture indices...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-light/10 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-light/10 text-xs font-bold text-slate-light uppercase bg-canvas-dominant tracking-wider">
                    <th className="py-4 px-5">Category Name Listing</th>
                    <th className="py-4 px-5">Total Volume Stack</th>
                    <th className="py-4 px-5">Active Circulation Borrow Count</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-light/5 text-slate-secondary">
                  {categoriesList.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-sm text-slate-light font-medium">
                        No library category profiles matches the search key terms.
                      </td>
                    </tr>
                  ) : (
                    categoriesList.map((cat: CategoryMetrics) => (
                      <tr
                        key={cat.category_id}
                        onClick={() => { setSelectedCategory(cat); setIsDetailsOpen(true); }}
                        className="hover:bg-canvas-dominant/60 transition-colors cursor-pointer group select-none animate-fade-in"
                      >
                        <td className="py-4 px-5 font-bold text-slate-secondary group-hover:text-sage-primary transition-colors">
                          {cat.category_name}
                        </td>
                        <td className="py-4 px-5 font-bold text-slate-light font-data">
                          {cat.booksCount} books
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-data tracking-wider border ${
                            cat.lendingCount > 15 
                              ? "bg-sage-primary/10 text-sage-primary border-sage-primary/10"
                              : "bg-canvas-dominant text-slate-light border-slate-light/10"
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

          {/* Pagination Controls Block UI Section */}
          <div className="flex justify-between items-center bg-white px-5 py-4 rounded-xl border border-slate-light/10 shadow-2xs">
            <span className="text-xs font-medium text-slate-light">
              Showing page <b className="text-slate-secondary font-data">{currentPage}</b> of <b className="text-slate-secondary font-data">{totalPages}</b> (<span className="font-data">{totalRecordsCount}</span> Archives)
            </span>
            <div className="flex gap-2 text-xs font-bold">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-1.5 bg-white border border-slate-light/10 rounded-lg shadow-3xs text-slate-light hover:text-slate-secondary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                ◀ Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-1.5 bg-white border border-slate-light/10 rounded-lg shadow-3xs text-slate-light hover:text-slate-secondary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Next ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal A: Pop-up Form for Quick Add Creation */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-secondary/40 backdrop-blur-xs" onClick={() => setIsCreateOpen(false)} />
          <form 
            onSubmit={handleExecuteCreate} 
            className="relative z-10 w-full max-w-md bg-white rounded-2xl p-6 border border-slate-light/10 shadow-xl space-y-4 text-slate-secondary"
          >
            <div>
              <h3 className="text-base font-bold text-slate-secondary tracking-tight">Add New Category Classification</h3>
              <p className="text-xs text-slate-light mt-0.5 font-medium">Input a unique classification name to initialize shelf tags mapping slots.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-light uppercase tracking-wider">Category Name</label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Science Fiction, Biography, History"
                value={newCatName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCatName(e.target.value)}
                className="w-full px-3.5 py-2 bg-canvas-dominant border border-slate-light/10 text-slate-secondary rounded-xl text-sm font-semibold focus:bg-white outline-hidden focus:ring-4 focus:ring-sage-primary/10 focus:border-sage-primary transition-all"
              />
              {createValidationError && <p className="text-xs text-utility-crimson font-medium mt-1">{createValidationError}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 border border-slate-light/10 text-slate-light rounded-xl hover:text-slate-secondary transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-sage-primary hover:bg-sage-primary/90 text-white disabled:bg-slate-light/20 disabled:text-slate-light/50 rounded-xl cursor-pointer transition-all"
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