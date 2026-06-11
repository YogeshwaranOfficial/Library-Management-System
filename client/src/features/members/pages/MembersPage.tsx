import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { axiosClient } from "../../../api/axiosClient";
import { MemberDetailsModal } from "../components/MemberDetailsModal";
import { MemberModal } from "../components/MemberModal"; 
import type { LibraryMember, MembershipPlan, SystemUser } from "../../../types/members";
import type { MemberFormValues } from "../schemas/memberSchema";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/authStore";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";

export const MembersPage = () => {
  const queryClient = useQueryClient();
  
  // Server-driven lookup filter parameters
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Card Overlay state tracking management
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false); 
  const [selectedMember, setSelectedMember] = useState<LibraryMember | null>(null);

  const token = useAuthStore((state) => state.token);

  // Core background querying pipeline mapping directly to server indices
  const { data: membersPayload, isLoading } = useQuery<{ total: number; data: LibraryMember[] }>({
    queryKey: ["membersListFeed", token, currentPage, searchTerm, tierFilter, statusFilter],
    queryFn: async () => {
      const res = await axiosClient.get("/members", {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          plan: tierFilter || undefined,
          status: statusFilter || undefined
        }
      });

      const rootData = res.data?.data || res.data;
      const rawRecords = rootData?.data || [];
      const totalCount = rootData?.meta?.total || 0;

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
              activationDate: String(row.activation_date || row.activationDate || ""),
              expiryDate: String(row.expiry_date || row.expiryDate || "N/A"),
              isActive: row.membership_status === "ACTIVE",
            };
          })
        : [];

      return { total: totalCount, data: transformed };
    },
    enabled: !!token,
  });

  // Pull plan catalogs for layout dropdown filtering selectors
  const { data: plans = [] } = useQuery<MembershipPlan[]>({
    queryKey: ["membershipPlansFeed", token],
    queryFn: async () => {
      const res = await axiosClient.get("/members/plans");
      return res.data?.data || res.data || [];
    },
    enabled: !!token,
  });

  // Fetching profiles to load form modal registration selectors
  const { data: users = [] } = useQuery<SystemUser[]>({
    queryKey: ["eligibleUsersList", token], 
    queryFn: async () => {
      const res = await axiosClient.get("/members/available-users");
      return res.data?.data || res.data || [];
    },
    enabled: !!token,
  });

  // Create or Update Member Pipeline Mutation
  const saveMemberMutation = useMutation({
    mutationFn: async (payload: MemberFormValues) => {
      const processedPayload = {
        user_id: payload.userId,
        membership_plan_id: payload.membershipPlanId,
        is_active: payload.isActive ?? true
      };

      if (selectedMember) {
        return await axiosClient.patch(`/members/${selectedMember.id}`, processedPayload);
      }
      return await axiosClient.post("/members", processedPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membersListFeed"] });
      queryClient.invalidateQueries({ queryKey: ["eligibleUsersList"] });
      
      toast.success(selectedMember ? "Membership renewed cleanly." : "New library member created successfully!");
      setIsFormOpen(false);
      setSelectedMember(null);
    },
    onError: (error: unknown) => {
      let serverErrorMessage = "Database schema validation failed on submission updates.";
      if (error instanceof AxiosError) {
        serverErrorMessage = error.response?.data?.message || serverErrorMessage;
      }
      toast.error(serverErrorMessage);
    }
  });

  // Renew details card mutation mapping updates safely
  const renewMutation = useMutation({
    mutationFn: async ({ memberId, planId }: { memberId: string; planId: string }) => {
      return await axiosClient.patch(`/members/${memberId}`, {
        membership_plan_id: planId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membersListFeed"] });
      toast.success("Membership activated successfully!");
      setIsDetailsOpen(false);
      setSelectedMember(null);
    },
    onError: (error: unknown) => {
      let serverErrorMessage = "Database contract update failed.";
      if (error instanceof AxiosError) {
        serverErrorMessage = error.response?.data?.message || serverErrorMessage;
      }
      toast.error(serverErrorMessage);
    }
  });

  // Delete account profile dataset logs mutation
  const deleteMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return await axiosClient.delete(`/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membersListFeed"] });
      queryClient.invalidateQueries({ queryKey: ["eligibleUsersList"] });
      toast.success("Member record removed successfully.");
    },
    onError: () => {
      toast.error("Failed to delete member.");
    }
  });

  const memberList = membersPayload?.data || [];
  const totalItems = membersPayload?.total || 0;
  const totalPages = Math.ceil(totalItems / 10) || 1;

  const handleClearFilters = () => {
    setSearchTerm("");
    setTierFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in bg-transparent font-sans text-xs sm:text-sm text-slate-700 pb-12">
      
      {/* Page Core Header Block - Spacious Layout Ivory Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Members Management Desk</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
            Click any record row to manage tier tracking, view info cards, or extend membership renewals.
          </p>
        </div>
        <button
          onClick={() => { setSelectedMember(null); setIsFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap cursor-pointer shadow-xs self-stretch sm:self-auto justify-center"
        >
          <Plus size={14} />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Control Utility Filter Toolbar Line */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by member name..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs sm:text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:border-slate-900 outline-hidden focus:ring-4 focus:ring-slate-900/5 transition-all"
          />
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="grid grid-cols-2 sm:flex gap-3 w-full md:w-auto">
          <select
            value={tierFilter}
            onChange={(e) => { setTierFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider outline-hidden focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 focus:bg-white cursor-pointer"
          >
            <option value="">All Membership Plans</option>
            {plans.map((p) => (
              <option key={p.membership_plan_id} value={p.plan_name}>
                {p.plan_name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider outline-hidden focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 focus:bg-white cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Plan</option>
            <option value="EXPIRED">Expired Plan</option>
          </select>

          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer col-span-2 sm:col-auto whitespace-nowrap"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Master Content Ledger Grid Table */}
      {isLoading ? (
        <div className="text-center py-24 text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">
          Syncing Library Membership Database...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] sm:text-xs font-bold text-slate-400 uppercase bg-slate-50/50 tracking-wider">
                    <th className="py-4 px-6">Member Name</th>
                    <th className="py-4 px-6">Contact Details</th>
                    <th className="py-4 px-6">Current Plan</th>
                    <th className="py-4 px-6">Plan Expiry Date</th>
                    <th className="py-4 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs sm:text-sm divide-y divide-slate-100 text-slate-700">
                  {memberList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-xs text-slate-500 font-medium">
                        No active matching subscriber accounts found on server indexing.
                      </td>
                    </tr>
                  ) : (
                    memberList.map(member => (
                      <tr 
                        key={member.id} 
                        onClick={() => { setSelectedMember(member); setIsDetailsOpen(true); }}
                        className="hover:bg-slate-50 transition-colors cursor-pointer group select-none"
                      >
                        <td className="py-4 px-6 font-bold text-slate-900 transition-colors">
                          {member.name}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-800">{member.email}</div>
                          <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5 font-medium">{member.phoneNumber || "No Phone Contact"}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] sm:text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/40">
                            {member.membershipPlanName}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-500">
                          {member.expiryDate}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold border ${
                            member.isActive 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}>
                            {member.isActive ? "Active" : "Expired"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Navigation Footer Deck */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>
                 Page {currentPage} / {totalPages} <span className="text-slate-300 mx-2">|</span> Total {totalItems} Members
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1 || totalPages <= 1}
                  onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(prev - 1, 1)); }}
                  className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg disabled:opacity-30 cursor-pointer transition-colors shadow-xs"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages || totalPages <= 1}
                  onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(prev + 1, totalPages)); }}
                  className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg disabled:opacity-30 cursor-pointer transition-colors shadow-xs"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup Form Modals Layers */}
      <MemberModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={(vals) => saveMemberMutation.mutate(vals)}
        users={users}
        plans={plans}
        editingMember={selectedMember}
      />

      <MemberDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        member={selectedMember}
        plans={plans}
        onDelete={(id) => deleteMutation.mutate(id)}
        onRenew={(planId) => selectedMember && renewMutation.mutate({ memberId: selectedMember.id, planId })}
        isRenewing={renewMutation.isPending}
      />
    </div>
  );
};