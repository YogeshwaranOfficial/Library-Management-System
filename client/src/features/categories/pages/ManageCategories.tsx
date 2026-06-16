import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { axiosClient } from "../../../api/axiosClient";
import { CategoryDetailsModal } from "../components/CategoryDetailsModal";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/authStore";
import type { CategoryMetrics } from "../types/category.types";
import { AddCategoryModal } from "../components/AddCategoryModal";
import {
  Plus,
  Search,
  RotateCcw,
  X,
  Layers
} from "lucide-react";

// Local structural shape handling the layout requirements of the table columns
interface DisplayCategory {
  category_id: string;
  category_name: string;
  code: string;
  description: string;
  booksCount: number;
  lendingCount: number;
  isParent: boolean;
  totalCopies: number;
  parentName: string;
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

export const ManageCategories = () => {
  const queryClient = useQueryClient();

  // Search filter parameters
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "ACTIVE" | "INACTIVE"
  const [typeFilter, setTypeFilter] = useState(""); // "PARENT" | "SUB"

  // Clean UI state parameters
  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<"type" | "status" | null>(null);

  // Modal control triggers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryMetrics | null>(null);

  const token = useAuthStore((state) => state.token);
  
  // Refs for tracking outside dropdown clicks
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);

  const createCategoryMutation = useMutation({
    mutationFn: async (newName: string) => {
      // Change 'name' to 'category_name' to pass backend Zod validation
      const response = await axiosClient.post("/categories", {
        category_name: newName, 
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categoriesListFeed"] });
      toast.success("Category registered successfully!");
    },
    onError: (error: unknown) => {
      let errorMsg = "Failed to register category.";
      if (error instanceof AxiosError) {
        errorMsg = error.response?.data?.message || errorMsg;
      }
      toast.error(errorMsg);
      console.error("Category creation error:", error);
    },
  });

  const handleCreateCategory = async (newName: string) => {
    try {
      await createCategoryMutation.mutateAsync(newName);
    } catch {
      // Intentionally empty: error handled globally inside mutation onError config
    }
  };

  // Close interactive headers if clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        activeHeaderDropdown === "type" && 
        typeDropdownRef.current && 
        !typeDropdownRef.current.contains(event.target as Node)
      ) {
        setActiveHeaderDropdown(null);
      }
      if (
        activeHeaderDropdown === "status" && 
        statusDropdownRef.current && 
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setActiveHeaderDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [activeHeaderDropdown]);

  // Core background querying pipeline matching data schema rows
  const { data: categoriesPayload, isLoading } = useQuery<{
    total: number;
    globalActive: number;
    globalInactive: number;
    data: DisplayCategory[];
  }>({
    queryKey: ["categoriesListFeed", token, currentPage, searchTerm, typeFilter, statusFilter],
    queryFn: async () => {
      const res = await axiosClient.get("/categories/metrics", {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          type: typeFilter || undefined,
          status: statusFilter || undefined,
        },
      });

      const rootData = res.data?.data || res.data;
      const rawRecords = rootData?.rows || [];
      const totalCount = rootData?.totalCount || 0;
      
      const globalActiveCount = rootData?.globalActive ?? "-"; 
      const globalInactiveCount = rootData?.globalInactive ?? "-";

      const transformed = Array.isArray(rawRecords)
        ? rawRecords.map((dbRow: unknown): DisplayCategory => {
            const row = dbRow as Record<string, unknown>;
            const parentObj = (row.parent_category || {}) as Record<string, unknown>;

            return {
              category_id: String(row.category_id || row.id || ""),
              category_name: String(row.name || row.category_name || "Unnamed Category"),
              code: String(row.code || row.slug || "—"),
              description: String(row.description || "No description provided."),
              booksCount: Number(row.booksCount || row.book_count || 0),
              totalCopies: Number(row.totalCopies || row.total_copies || 0),
              lendingCount: Number(row.lendingCount || row.lending_count || 0),
              isParent: !row.parent_id,
              parentName: String(parentObj.name || "—"),
              isActive: row.status === "ACTIVE" || row.is_active === true,
              created_at: String(row.created_at || row.createdAt || new Date().toISOString()),
              updated_at: String(row.updated_at || row.updatedAt || new Date().toISOString()),
            };
          })
        : [];

      return { 
        total: totalCount, 
        globalActive: globalActiveCount, 
        globalInactive: globalInactiveCount, 
        data: transformed 
      };
    },
    enabled: !!token,
  });

  // Mutation for updating category name inside the dynamic slider modal view
  // Mutation for updating category name inside the dynamic slider modal view
  const updateNameMutation = useMutation({
    mutationFn: async ({ id, newName }: { id: string; newName: string }) => {
      // Changed 'name' to 'category_name' to pass backend Zod validation
      return await axiosClient.patch(`/categories/${id}`, { category_name: newName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categoriesListFeed"] });
      toast.success("Category name updated successfully.");
      setIsModalOpen(false);
      setSelectedCategory(null);
    },
    onError: (error: unknown) => {
      let msg = "Failed to rewrite classification name.";
      if (error instanceof AxiosError) msg = error.response?.data?.message || msg;
      toast.error(msg);
    },
  });

  // Mutation for handling category records purge transactions
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return await axiosClient.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categoriesListFeed"] });
      toast.success("Category record successfully dropped from ledger.");
      setIsModalOpen(false);
      setSelectedCategory(null);
    },
    onError: (error: unknown) => {
      let msg = "Failed to drop targeted category registry stack.";
      if (error instanceof AxiosError) msg = error.response?.data?.message || msg;
      toast.error(msg);
    },
  });

  const handleUpdateName = async (id: string, newName: string): Promise<void> => {
    await updateNameMutation.mutateAsync({ id, newName });
  };

  const handleDeleteCategory = (category: CategoryMetrics) => {
    deleteCategoryMutation.mutate(category.category_id);
  };

  const categoryList = categoriesPayload?.data || [];
  const hasActiveFilters = Boolean(searchTerm || typeFilter || statusFilter);
  const displayTotal = categoriesPayload?.total ?? 0;

  const totalPages = Math.ceil(categoryList.length / 10) || 1;

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  const getInitials = (name: string) => (name ? name.charAt(0).toUpperCase() : "C");

  return (
    <div className="min-h-screen bg-white text-[#2D3748] antialiased pb-16 pt-10 px-8 lg:px-14 font-sans select-none">
      
      {/* ==================== ZONES A & B: ALIGNED HEADER WITH METRIC STRIP ==================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#718096] text-[11px] font-bold uppercase tracking-widest mb-1.5">
            <Layers size={13} className="stroke-[2.5]" /> Catalog Management
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A365D]">
            Book Categories
          </h1>
        </div>

        {/* Metric Tracker Stack */}
        <div className="flex items-center gap-10 select-none pb-0.5">
          <div>
            <span className="block text-2xl font-bold text-[#1A365D] tracking-tight leading-none text-right">
              {displayTotal}
            </span>
            <span className="text-[10px] font-semibold text-[#718096] uppercase tracking-wider mt-2 block">
              {hasActiveFilters ? "Matched" : "Total Categories"}
            </span>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200 w-full mb-6" />

      {/* ==================== ZONE C: MINIMALIST UTILITIES SUB HEADER ==================== */}
      <div className="flex items-center justify-between gap-4 mb-4 h-9">
        <div className="text-[10px] font-bold tracking-widest text-[#1A365D] uppercase">
          Classification Ledger
        </div>

        {/* Compact Right-Aligned Control Blocks */}
        <div className="flex items-center gap-3">
          
          {/* Always-On Static Rounded Search Input Field Frame */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-sm focus-within:border-gray-300 focus-within:bg-white transition-all w-48">
            <Search size={13} className="text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search components..."
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

          {/* Always-On Persistent Filters Clear Action Icon Trigger */}
          <button
            type="button"
            onClick={handleClearFilters}
            className={`p-1.5 rounded-full transition-colors ${hasActiveFilters ? "text-rose-600 hover:bg-rose-50" : "text-gray-400 hover:bg-gray-100"}`}
            title="Reset Filters"
          >
            <RotateCcw size={15} />
          </button>

          <div className="w-px h-4 bg-gray-200 mx-0.5" />

          {/* Streamlined Action Core Button */}
          {/* Update your Plus Button in ManageCategories.tsx to look exactly like this: */}
          <button
            onClick={(e) => { 
              e.stopPropagation(); // 👈 Stops the click from bleeding down into the table row!
              setIsModalOpen(false); // 👈 Explicitly turn off the details modal safety layer
              setSelectedCategory(null);
              setIsAddOpen(true); 
            }}
            className="flex items-center justify-center p-1.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white rounded-full transition-all cursor-pointer shadow-2xs shrink-0"
            title="Add New Category"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ==================== ZONE D: STATIC FULL-WIDTH TABLE DISPLAY ==================== */}
      <div className="flex items-start gap-10 w-full transition-all duration-300">
        <div className="w-full">
          {isLoading ? (
            <div className="py-24 text-xs font-semibold text-[#718096] tracking-widest uppercase animate-pulse">
              Syncing active structural taxonomy layers...
            </div>
          ) : (
            <div className="w-full">
              <div className="overflow-visible w-full">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="border-b border-gray-200 text-[11px] font-bold text-[#718096] uppercase tracking-widest bg-transparent select-none">
                      <th className="pb-3 pr-4 font-bold tracking-widest pl-3 w-[33.3%]">Category Name</th>
                      <th className="pb-3 px-4 font-bold tracking-widest text-center w-[33.3%]">Total Books</th>
                      <th className="pb-3 px-4 font-bold tracking-widest text-center w-[33.3%]">Total Copies</th>    
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100 font-medium text-[#2D3748]">
                    {categoryList.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-20 text-left text-sm text-[#718096] font-medium pl-3">
                          No matching category keys found inside this targeted segment.
                        </td>
                      </tr>
                    ) : (
                      categoryList.map((category) => {
                        return (
                          <tr
                            key={category.category_id}
                            onClick={() => {
                              setSelectedCategory({
                                category_id: category.category_id,
                                category_name: category.category_name,
                                created_at: category.created_at,
                                booksCount: category.booksCount,
                                totalCopies: category.totalCopies,
                                lendingCount: category.lendingCount
                              } as CategoryMetrics);
                              setIsModalOpen(true);
                            }}
                            className="transition-all duration-150 cursor-pointer border-l-4 hover:bg-blue-50/40 border-l-transparent"
                          >
                            {/* Column 1: Core Profile Info */}
                            <td className="py-3.5 pl-3 font-semibold text-[#1A365D] truncate">
                              <div className="flex items-center gap-3 truncate">
                                <div className="w-7 h-7 bg-slate-100 text-[#1A365D] font-semibold text-xs rounded-md flex items-center justify-center shrink-0">
                                  {getInitials(category.category_name)}
                                </div>
                                <div className="truncate">
                                  <div className="font-semibold tracking-tight text-sm truncate text-[#1A365D]">
                                    {category.category_name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            
                            {/* Column 2: Total Books */}
                            <td className="py-3.5 px-4 text-center truncate">
                              <div className="font-semibold text-gray-700 text-sm">{category.booksCount}</div>
                            </td>

                            {/* Column 3: Total Copies */}
                            <td className="py-3.5 px-4 text-center truncate">
                              <div className="font-semibold text-gray-700 text-sm">{category.totalCopies}</div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Minimal Pagination Elements */}
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add New Category Custom Overlay Popup */}
      <AddCategoryModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        existingCategories={categoriesPayload?.data || []} 
        onCreateCategory={handleCreateCategory}
        isMutating={createCategoryMutation.isPending} 
      />

      {/* Single Dynamic Integrated Modal Drawer Slide Overlay */}
      <CategoryDetailsModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedCategory(null); }}
        category={selectedCategory}
        onUpdateName={handleUpdateName}
        onDeleteCategory={handleDeleteCategory}
        isMutating={updateNameMutation.isPending || deleteCategoryMutation.isPending}
      />
    </div>
  );
};