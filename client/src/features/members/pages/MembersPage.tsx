import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { axiosClient } from "../../../api/axiosClient";
import { MemberModal } from "../components/MemberModal";
import { MemberDetailsPage } from "../components/MemberDetailsModal"; 
import type { LibraryMember, MembershipPlan, SystemUser } from "../../../types/members";
import { DeleteConfirmationModal } from "../components/DeleteConfirmationModal";
import type { MemberFormValues } from "../schemas/memberSchema";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/authStore";
import {
  Plus,
  Search,
  RotateCcw,
  X,
  Users,
  ChevronDown,
  ListChecks,
  Trash2,
  Edit3,
  CheckSquare,
  Square
} from "lucide-react";

export const MembersPage = () => {
  const queryClient = useQueryClient();

  // Search filter parameters
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); 
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // ✅ New Sorting parameters matching theme architecture
  const [sortField, setSortField] = useState<"name" | "contact" | "">(""); 
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC" | "">("");

  // ✅ Expanded interactive UI state parameters
  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<"name" | "contact" | "plan" | "status" | null>(null);

  // Row selection tracking maps
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  // Track specific single items slated for removal dynamically
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);

  // Modal controllers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null); // For deep ledger viewing
  const [editingMember, setEditingMember] = useState<LibraryMember | null>(null); // Keeps your Form Modal working cleanly   
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const token = useAuthStore((state) => state.token);
  
  // ✅ Refs for tracking outside dropdown clicks
  const nameDropdownRef = useRef<HTMLDivElement>(null);
  const contactDropdownRef = useRef<HTMLDivElement>(null);
  const planDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close interactive headers if clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        activeHeaderDropdown === "name" && 
        nameDropdownRef.current && 
        !nameDropdownRef.current.contains(event.target as Node)
      ) {
        setActiveHeaderDropdown(null);
      }
      if (
        activeHeaderDropdown === "contact" && 
        contactDropdownRef.current && 
        !contactDropdownRef.current.contains(event.target as Node)
      ) {
        setActiveHeaderDropdown(null);
      }
      if (
        activeHeaderDropdown === "plan" && 
        planDropdownRef.current && 
        !planDropdownRef.current.contains(event.target as Node)
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
  const { data: membersPayload, isLoading } = useQuery<{
    total: number;
    globalActive: number;
    globalExpired: number;
    data: LibraryMember[];
  }>({
    // ✅ Updated queryKey mapping sequence to watch sort values
    queryKey: ["membersListFeed", token, currentPage, itemsPerPage, searchTerm, tierFilter, statusFilter, sortField, sortOrder],
    queryFn: async () => {
      const res = await axiosClient.get("/members", {
        params: {
          page: currentPage,
          limit: itemsPerPage, 
          search: searchTerm || undefined,
          plan: tierFilter || undefined,
          status: statusFilter || undefined,
          sort_by: sortField || undefined,
          order: sortOrder || undefined,
        },
      });

      const rootData = res.data?.data || res.data;
      const rawRecords = rootData?.data || [];
      const totalCount = rootData?.meta?.total || 0;
      
      const globalActiveCount = rootData?.meta?.globalActive ?? "-"; 
      const globalExpiredCount = rootData?.meta?.globalExpired ?? "-";

      const transformed = Array.isArray(rawRecords)
        ? rawRecords.map((dbRow: unknown): LibraryMember => {
            const row = dbRow as Record<string, unknown>;
            const userObj = (row.user || {}) as Record<string, unknown>;
            const planObj = (row.membership_plan || {}) as Record<string, unknown>;

            return {
              id: String(row.member_id || row.id || ""),
              userId: String(row.user_id || row.userId || ""),
              name: String(userObj.name || "Unknown Member"),
              email: String(userObj.gmail || "No Email Registered"),
              phoneNumber: String(userObj.phone_number || row.phoneNumber || ""),
              membershipPlanId: String(row.membership_plan_id || row.membershipPlanId || ""),
              membershipPlanName: String(planObj.plan_name || "No Plan Tier Assigned"),
              activationDate: String(row.activation_date || row.start_date || row.activationDate || ""),
              expiryDate: String(row.expiry_date || row.expiryDate || "N/A"),
              isActive: row.membership_status === "ACTIVE" || row.is_active === true,
            };
          })
        : [];

      return { total: totalCount, globalActive: globalActiveCount, globalExpired: globalExpiredCount, data: transformed };
    },
    enabled: !!token,
  });

  // Safe destructuring with fallback array
  const { data: rawPlans } = useQuery<MembershipPlan[]>({
    queryKey: ["membershipPlansFeed", token],
    queryFn: async () => {
      const res = await axiosClient.get("/members/dropdown");
      return res.data?.data || res.data || [];
    },
    enabled: !!token,
  });

  // Add this hook to pull heavy structural data from GET /api/members/:id
  const { data: deepMemberDetails } = useQuery({
    queryKey: ["memberDetailRecord", selectedMemberId, token],
    queryFn: async () => {
      if (!selectedMemberId) return null;
      const res = await axiosClient.get(`/members/${selectedMemberId}`);
      return res.data?.data || res.data;
    },
    enabled: !!selectedMemberId && !!token,
  });

  // Safe destructuring with fallback array
  const { data: rawUsers } = useQuery<SystemUser[]>({
    queryKey: ["eligibleUsersList", token],
    queryFn: async () => {
      const res = await axiosClient.get("/members/available-users");
      return res.data?.data || res.data || [];
    },
    enabled: !!token,
  });

  const plans = Array.isArray(rawPlans) ? rawPlans : [];
  const users = Array.isArray(rawUsers) ? rawUsers : [];

  const memberList = membersPayload?.data || [];
  const hasActiveFilters = Boolean(searchTerm || tierFilter || statusFilter || sortField || sortOrder);
  const displayTotal = membersPayload?.total ?? 0;

  let displayActive: number | string = membersPayload?.globalActive ?? 0;
  let displayExpired: number | string = membersPayload?.globalExpired ?? 0;

  if (statusFilter === "ACTIVE") displayExpired = "-";
  if (statusFilter === "EXPIRED") displayActive = "-";

  const totalPages = Math.ceil(displayTotal / itemsPerPage) || 1;

  // SELECTION UTILITY ENGINE HANDLERS
  const isAllSelected = memberList.length > 0 && selectedRowIds.length === memberList.length;
  
  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(memberList.map((m) => m.id));
    }
  };

  const handleSelectRowToggle = (id: string) => {
    setSelectedRowIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const saveMemberMutation = useMutation({
    mutationFn: async (payload: MemberFormValues) => {
      const processedPayload = {
        user_id: payload.userId,
        membership_plan_id: payload.membershipPlanId,
        is_active: payload.isActive ?? true,
      };

      if (editingMember) {
        return await axiosClient.patch(`/members/${editingMember.id}`, processedPayload);
      }
      return await axiosClient.post("/members", processedPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membersListFeed"] });
      toast.success(editingMember ? "Membership updated cleanly." : "New library member created!");
      setIsFormOpen(false);
      setEditingMember(null);
    },
    onError: (error: unknown) => {
      let msg = "Database mutation failure.";
      if (error instanceof AxiosError) msg = error.response?.data?.message || msg;
      toast.error(msg);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (idsToDelete: string[]) => {
      const deletePromises = idsToDelete.map((id) =>
        axiosClient.delete(`/members/${id}`)
      );
      return await Promise.all(deletePromises);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["membersListFeed"] });
      toast.success(`Successfully purged ${variables.length} member profile records.`);
      setSelectedRowIds([]); 
    },
    onError: () => {
      toast.error("Error executing server batch record deletions.");
    }
  });

  const handleClearFilters = () => {
    setTierFilter("");
    setStatusFilter("");
    // ✅ Clear sorting states completely back to default configuration layout
    setSortField("");
    setSortOrder("");
    setItemsPerPage(10);
    setCurrentPage(1);
    setSelectedRowIds([]);
    setIsSelectionMode(false);
  };

  const getInitials = (name: string) => (name ? name.charAt(0).toUpperCase() : "M");

  return (
    <div className="min-h-screen bg-white text-[#2D3748] antialiased pb-16 pt-10 px-8 lg:px-14 font-sans select-none">
      
      {/* ==================== ZONES A & B: HEADER & TRACKER ==================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#718096] text-[11px] font-bold uppercase tracking-widest mb-1.5">
            <Users size={13} className="stroke-[2.5]" /> Directory
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A365D]">
            Members Registry
          </h1>
        </div>

        <div className="flex items-center gap-10 select-none pb-0.5">
          <div>
            <span className="block text-2xl font-bold text-[#1A365D] tracking-tight leading-none text-right">
              {displayTotal}
            </span>
            <span className="text-[10px] font-semibold text-[#718096] uppercase tracking-wider mt-2 block">
              {hasActiveFilters ? "Matched" : "Total Members"}
            </span>
          </div>
          <div className="w-px h-6 bg-gray-200 self-end mb-0.5" />
          <div>
            <span className="block text-2xl font-bold text-emerald-600 tracking-tight leading-none text-right">
              {displayActive}
            </span>
            <span className="text-[10px] font-semibold text-[#718096] uppercase tracking-wider mt-2 block">
              Active Plans
            </span>
          </div>
          <div className="w-px h-6 bg-gray-200 self-end mb-0.5" />
          <div>
            <span className="block text-2xl font-bold text-rose-600 tracking-tight leading-none text-right">
              {displayExpired}
            </span>
            <span className="text-[10px] font-semibold text-[#718096] uppercase tracking-wider mt-2 block">
              Expired Plans
            </span>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200 w-full mb-6" />

      {/* ==================== ZONE C: UTILITIES HEADER ==================== */}
      <div className="flex items-center justify-between gap-4 mb-4 h-9">
        <div className="text-[10px] font-bold tracking-widest text-[#1A365D] uppercase">
          Members Ledger {selectedRowIds.length > 0 && `(${selectedRowIds.length} Selected)`}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-sm focus-within:border-gray-300 focus-within:bg-white transition-all w-48">
            <Search size={13} className="text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search Members..."
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
            className={`p-1.5 rounded-full transition-colors ${hasActiveFilters || selectedRowIds.length > 0 ? "text-rose-600 hover:bg-rose-50" : "text-gray-400 hover:bg-gray-100"}`}
            title="Reset Filters & Selections"
          >
            <RotateCcw size={15} />
          </button>

          <div className="w-px h-4 bg-gray-200 mx-0.5" />

          {/* Action to Toggle/Execute Multi-Selection */}
          <button
            type="button"
            onClick={() => {
              if (!isSelectionMode) {
                setIsSelectionMode(true);
              } else if (selectedRowIds.length > 0) {
                setSingleDeleteId(null); 
                setIsDeleteModalOpen(true);
              } else {
                setIsSelectionMode(false);
              }
            }}
            className={`flex items-center justify-center p-1.5 rounded-full transition-all cursor-pointer shadow-2xs shrink-0 ${
              isSelectionMode 
                ? selectedRowIds.length > 0 
                  ? "bg-rose-600 hover:bg-rose-700 text-white" 
                  : "bg-amber-500 text-white hover:bg-amber-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title={
              isSelectionMode 
                ? selectedRowIds.length > 0 
                  ? `Click to delete selected (${selectedRowIds.length})` 
                  : "No rows selected (Click to turn off selection)"
                : "Enable Selection Mode"
            }
          >
            {isSelectionMode && selectedRowIds.length > 0 ? (
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
              title={isAllSelected ? "Deselect All Members" : "Select All Visible Members"}
            >
              {isAllSelected ? <CheckSquare size={13} className="text-emerald-600" /> : <Square size={13} />}
              <span>{isAllSelected ? "All Selected" : "Select All"}</span>
            </button>
          )}

          <div className="w-px h-4 bg-gray-200 mx-0.5" />

          <button
            type="button"
            onClick={() => { setEditingMember(null); setIsFormOpen(true); }}
            className="flex items-center justify-center p-1.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white rounded-full transition-all cursor-pointer shadow-2xs shrink-0"
            title="Add New Member"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ==================== ZONE D: GRID DISPLAY VIEW ==================== */}
      <div className="w-full transition-all duration-300">
        <div className="w-full">
          {isLoading ? (
            <div className="py-24 text-xs font-semibold text-[#718096] tracking-widest uppercase animate-pulse">
              Syncing active data ledger sequences...
            </div>
          ) : (
            <div className="w-full">
              <div className="overflow-visible w-full">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="border-b border-gray-200 text-[11px] font-bold text-[#718096] uppercase tracking-widest bg-transparent select-none">
                      {isSelectionMode && (
                        <th className="pb-3 pl-3 w-[6%] text-left animate-in fade-in duration-200">
                          Index
                        </th>
                      )}
                      
                      {/* ✅ Member Header Dropdown Filtering Setup */}
                      <th className="pb-3 pr-4 font-bold tracking-widest w-[31%] pl-2 relative">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setActiveHeaderDropdown(activeHeaderDropdown === "name" ? null : "name"); }}
                          className={`inline-flex items-center gap-1 hover:text-[#1A365D] transition-colors uppercase tracking-widest text-[11px] font-bold ${sortField === "name" ? "text-[#2B6CB0]" : ""}`}
                        >
                          Member {sortField === "name" ? `(${sortOrder === "ASC" ? "A-Z" : "Z-A"})` : ""}
                          <ChevronDown size={11} className={`transition-transform duration-200 ${activeHeaderDropdown === "name" ? "rotate-180" : ""}`} />
                        </button>
                        
                        {activeHeaderDropdown === "name" && (
                          <div ref={nameDropdownRef} className="absolute left-2 top-7 z-50 w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-1.5 text-xs text-[#2D3748] font-medium normal-case tracking-normal">
                            <button
                              type="button"
                              onClick={() => { setSortField(""); setSortOrder(""); setActiveHeaderDropdown(null); setCurrentPage(1); }}
                              className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${!sortField ? "bg-slate-50/80 text-[#2B6CB0] font-semibold" : ""}`}
                            >
                              Default (Newly Added)
                            </button>
                            <button
                              type="button"
                              onClick={() => { setSortField("name"); setSortOrder("ASC"); setActiveHeaderDropdown(null); setCurrentPage(1); }}
                              className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${sortField === "name" && sortOrder === "ASC" ? "bg-slate-50/80 text-[#2B6CB0] font-semibold" : ""}`}
                            >
                              Alphabetical (A → Z)
                            </button>
                            <button
                              type="button"
                              onClick={() => { setSortField("name"); setSortOrder("DESC"); setActiveHeaderDropdown(null); setCurrentPage(1); }}
                              className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${sortField === "name" && sortOrder === "DESC" ? "bg-slate-50/80 text-[#2B6CB0] font-semibold" : ""}`}
                            >
                              Alphabetical (Z → A)
                            </button>
                          </div>
                        )}
                      </th>

                      {/* ✅ Contact Header Dropdown Filtering Setup */}
                      <th className="pb-3 px-4 font-bold tracking-widest w-[27%] relative">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setActiveHeaderDropdown(activeHeaderDropdown === "contact" ? null : "contact"); }}
                          className={`inline-flex items-center gap-1 hover:text-[#1A365D] transition-colors uppercase tracking-widest text-[11px] font-bold ${sortField === "contact" ? "text-[#2B6CB0]" : ""}`}
                        >
                          Contact {sortField === "contact" ? `(${sortOrder === "ASC" ? "A-Z" : "Z-A"})` : ""}
                          <ChevronDown size={11} className={`transition-transform duration-200 ${activeHeaderDropdown === "contact" ? "rotate-180" : ""}`} />
                        </button>
                        
                        {activeHeaderDropdown === "contact" && (
                          <div ref={contactDropdownRef} className="absolute left-4 top-7 z-50 w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-1.5 text-xs text-[#2D3748] font-medium normal-case tracking-normal">
                            <button
                              type="button"
                              onClick={() => { setSortField(""); setSortOrder(""); setActiveHeaderDropdown(null); setCurrentPage(1); }}
                              className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${!sortField ? "bg-slate-50/80 text-[#2B6CB0] font-semibold" : ""}`}
                            >
                              Default (Newly Added)
                            </button>
                            <button
                              type="button"
                              onClick={() => { setSortField("contact"); setSortOrder("ASC"); setActiveHeaderDropdown(null); setCurrentPage(1); }}
                              className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${sortField === "contact" && sortOrder === "ASC" ? "bg-slate-50/80 text-[#2B6CB0] font-semibold" : ""}`}
                            >
                              Alphabetical (A → Z)
                            </button>
                            <button
                              type="button"
                              onClick={() => { setSortField("contact"); setSortOrder("DESC"); setActiveHeaderDropdown(null); setCurrentPage(1); }}
                              className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${sortField === "contact" && sortOrder === "DESC" ? "bg-slate-50/80 text-[#2B6CB0] font-semibold" : ""}`}
                            >
                              Alphabetical (Z → A)
                            </button>
                          </div>
                        )}
                      </th>

                      <th className="pb-3 px-4 font-bold tracking-widest w-[18%] relative">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setActiveHeaderDropdown(activeHeaderDropdown === "plan" ? null : "plan"); }}
                          className={`inline-flex items-center gap-1 hover:text-[#1A365D] transition-colors uppercase tracking-widest text-[11px] font-bold ${tierFilter ? "text-[#2B6CB0]" : ""}`}
                        >
                          Plan {tierFilter ? `(${tierFilter})` : ""}
                          <ChevronDown size={11} className={`transition-transform duration-200 ${activeHeaderDropdown === "plan" ? "rotate-180" : ""}`} />
                        </button>
                        
                        {activeHeaderDropdown === "plan" && (
                          <div ref={planDropdownRef} className="absolute left-4 top-7 z-50 w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-1.5 text-xs text-[#2D3748] font-medium normal-case tracking-normal">
                            <button
                              type="button"
                              onClick={() => { setTierFilter(""); setActiveHeaderDropdown(null); setCurrentPage(1); }}
                              className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${!tierFilter ? "bg-slate-50/80 text-[#2B6CB0] font-semibold" : ""}`}
                            >
                              All Plans
                            </button>
                            {plans.map((p) => (
                              <button
                                key={p.membership_plan_id}
                                type="button"
                                onClick={() => { setTierFilter(p.plan_name); setActiveHeaderDropdown(null); setCurrentPage(1); }}
                                className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors truncate ${tierFilter === p.plan_name ? "bg-slate-50/80 text-[#2B6CB0] font-semibold" : ""}`}
                              >
                                {p.plan_name}
                              </button>
                            ))}
                          </div>
                        )}
                      </th>

                      <th className="pb-3 px-4 font-bold tracking-widest w-[12%] relative">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setActiveHeaderDropdown(activeHeaderDropdown === "status" ? null : "status"); }}
                          className={`inline-flex items-center gap-1 hover:text-[#1A365D] transition-colors uppercase tracking-widest text-[11px] font-bold ${statusFilter ? "text-[#2B6CB0]" : ""}`}
                        >
                          Status {statusFilter ? `(${statusFilter})` : ""}
                          <ChevronDown size={11} className={`transition-transform duration-200 ${activeHeaderDropdown === "status" ? "rotate-180" : ""}`} />
                        </button>

                        {activeHeaderDropdown === "status" && (
                          <div ref={statusDropdownRef} className="absolute left-4 top-7 z-50 w-36 bg-white border border-gray-200 rounded-lg shadow-xl py-1.5 text-xs text-[#2D3748] font-medium normal-case tracking-normal">
                            <button
                              type="button"
                              onClick={() => { setStatusFilter(""); setActiveHeaderDropdown(null); setCurrentPage(1); }}
                              className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${!statusFilter ? "bg-slate-50/80 text-[#2B6CB0] font-semibold" : ""}`}
                            >
                              All Statuses
                            </button>
                            <button
                              type="button"
                              onClick={() => { setStatusFilter("ACTIVE"); setActiveHeaderDropdown(null); setCurrentPage(1); }}
                              className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${statusFilter === "ACTIVE" ? "bg-slate-50/80 text-[#2B6CB0] font-semibold" : ""}`}
                            >
                              Active
                            </button>
                            <button
                              type="button"
                              onClick={() => { setStatusFilter("EXPIRED"); setActiveHeaderDropdown(null); setCurrentPage(1); }}
                              className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${statusFilter === "EXPIRED" ? "bg-slate-50/80 text-[#2B6CB0] font-semibold" : ""}`}
                            >
                              Expired
                            </button>
                          </div>
                        )}
                      </th>
                      <th className="pb-3 pr-3 text-right w-[10%]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100 font-medium text-[#2D3748]">
                    {memberList.length === 0 ? (
                      <tr>
                        <td colSpan={isSelectionMode ? 6 : 5} className="py-20 text-left text-sm text-[#718096] font-medium pl-3">
                          No matching records currently indexed inside this filtered view.
                        </td>
                      </tr>
                    ) : (
                      memberList.map((member) => {
                        const isRowChecked = selectedRowIds.includes(member.id);
                        return (
                          <tr
                            key={member.id}
                            onClick={() => { 
                              setSelectedMemberId(member.id); 
                            }}
                            className={`transition-all duration-150 cursor-pointer border-l-4 ${
                              isRowChecked 
                                ? 'bg-[#2B6CB0]/5 border-l-4 border-l-[#2B6CB0]' 
                                : 'hover:bg-blue-50/40 border-l-4 border-l-transparent'
                            }`}
                          >
                            {isSelectionMode && (
                              <td className="py-3.5 pl-3 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
                                <input 
                                  type="checkbox"
                                  checked={isRowChecked}
                                  onChange={() => handleSelectRowToggle(member.id)}
                                  className="w-3.5 h-3.5 rounded-sm border-gray-300 text-[#2B6CB0] focus:ring-[#2B6CB0] cursor-pointer"
                                />
                              </td>
                            )}

                            <td className="py-3.5 pr-4 pl-2 font-semibold text-[#1A365D] truncate">
                              <div className="flex items-center gap-3 truncate">
                                <div className="w-7 h-7 bg-slate-100 text-[#1A365D] font-semibold text-xs rounded-md flex items-center justify-center shrink-0">
                                  {getInitials(member.name)}
                                </div>
                                <div className="truncate">
                                  <div className={`font-semibold tracking-tight text-sm truncate ${isRowChecked ? "text-[#2B6CB0]" : "text-[#1A365D]"}`}>{member.name}</div>
                                  <div className="text-[11px] text-[#718096] font-normal mt-0.5 truncate">Active Since: {member.activationDate || "N/A"}</div>
                                </div>
                              </div>
                            </td>
                            
                            <td className="py-3.5 px-4 truncate">
                              <div className="font-medium text-gray-700 text-sm truncate">{member.email}</div>
                              <div className="text-[11px] text-[#718096] font-normal mt-0.5 truncate">{member.phoneNumber || "—"}</div>
                            </td>

                            <td className="py-3.5 px-4 truncate">
                              <div className="font-semibold text-[#2D3748] tracking-tight text-sm truncate">{member.membershipPlanName}</div>
                              <div className="text-[11px] text-[#718096] font-normal mt-0.5 truncate">Standard Pipeline</div>
                            </td>

                            <td className="py-3.5 px-4 truncate">
                              <span className="inline-flex items-center gap-1.5 font-semibold text-xs select-none">
                                <span className={`w-1.5 h-1.5 rounded-full ${member.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                                <span className={member.isActive ? "text-emerald-700" : "text-rose-700"}>{member.isActive ? "Active" : "Expired"}</span>
                              </span>
                            </td>

                            <td className="py-3.5 pr-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="inline-flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingMember(member);
                                    setIsFormOpen(true);
                                  }}
                                  className="p-1 text-blue-600 hover:bg-blue-50 transition-colors rounded-md table-cell"
                                  title="Edit Row"
                                >
                                  <Edit3 size={13} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSingleDeleteId(member.id);
                                    setIsDeleteModalOpen(true);
                                  }}
                                  className="p-1 text-rose-600 hover:bg-rose-50 transition-colors rounded-md table-cell"
                                  title="Delete Member"
                                >
                                  <Trash2 size={13} />
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

              {/* Stabilized Pagination Navigation Footer */}
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

      {/* ==================== GLOBAL OVERLAY MODALS ==================== */}
      {selectedMemberId && (
        <MemberDetailsPage
          onClose={() => setSelectedMemberId(null)}
          member={deepMemberDetails || null}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        selectedCount={singleDeleteId ? 1 : selectedRowIds.length}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSingleDeleteId(null);
        }}
        onConfirm={() => {
          const targets = singleDeleteId ? [singleDeleteId] : selectedRowIds;
          
          bulkDeleteMutation.mutate(targets, {
            onSuccess: () => {
              setIsDeleteModalOpen(false);
              setSingleDeleteId(null);
              if (!singleDeleteId) {
                setIsSelectionMode(false); 
              }
            }
          });
        }}
      />

    {isFormOpen && (
  <MemberModal
    isOpen={isFormOpen}
    onClose={() => { 
      setIsFormOpen(false); 
      setEditingMember(null); 
    }}
    onSubmit={(vals) => saveMemberMutation.mutate(vals)}
    // ✅ Passed your state directly using the exact interface key
    editingMember={editingMember} 
    users={users}
    plans={plans}
  />
)}
  </div>
  );
};