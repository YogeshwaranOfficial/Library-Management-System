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

  // 💡 CORE QUERY ENGINE (Hooks searching & filtering strings directly to API limits)
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

  // Pull plan structural list catalogs for the dropdown selectors
  const { data: plans = [] } = useQuery<MembershipPlan[]>({
    queryKey: ["membershipPlansFeed", token],
    queryFn: async () => {
      const res = await axiosClient.get("/members/plans");
      return res.data?.data || res.data || [];
    },
    enabled: !!token,
  });

  // Fetching System Users to fill the profile dropdown target selectors
  const { data: users = [] } = useQuery<SystemUser[]>({
    queryKey: ["eligibleUsersList", token], 
    queryFn: async () => {
      const res = await axiosClient.get("/members/available-users");
      return res.data?.data || res.data || [];
    },
    enabled: !!token,
  });

  // Create or Update Membership Master Pipeline Mutation
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
        console.error("Validation Breakdown Details:", error.response?.data);
      } else {
        console.error("An unexpected system error occurred:", error);
      }
      toast.error(serverErrorMessage);
    }
  });

  // RENEW SUBMISSION MUTATION (From the row info cards details panel directly)
  const renewMutation = useMutation({
    mutationFn: async ({ memberId, planId }: { memberId: string; planId: string }) => {
      return await axiosClient.patch(`/members/${memberId}`, {
        membership_plan_id: planId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membersListFeed"] });
      toast.success("💥 Membership activated successfully!");
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

  // DELETE ACCOUNT PROFILES CLEARANCE MUTATION
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
    <div className="space-y-6 animate-fade-in bg-canvas-dominant font-sans text-slate-secondary">
      {/* Page Core Header Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-light/10 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-secondary tracking-tight">Library Members Registry</h2>
          <p className="text-xs text-slate-light mt-0.5">Click any record row to manage tier tracking, view info cards, or extend membership renewals.</p>
        </div>
        <button
          onClick={() => { setSelectedMember(null); setIsFormOpen(true); }}
          className="px-4 py-2.5 bg-sage-primary hover:bg-sage-primary/90 text-white text-sm font-bold rounded-xl shadow-xs transition-all whitespace-nowrap cursor-pointer"
        >
          ➕ Add New Member
        </button>
      </div>

      {/* Control Utility Toolbar Filters Line */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-light/10 shadow-2xs">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="🔎 Search by member name..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full px-3.5 py-2 bg-canvas-dominant border border-slate-light/10 text-slate-secondary rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-sage-primary/10 focus:border-sage-primary outline-hidden transition-all font-data"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex gap-3">
          <select
            value={tierFilter}
            onChange={(e) => { setTierFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-canvas-dominant border border-slate-light/10 text-slate-secondary rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-sage-primary/10 focus:border-sage-primary outline-hidden cursor-pointer font-sans font-semibold"
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
            className="px-3 py-2 bg-canvas-dominant border border-slate-light/10 text-slate-secondary rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-sage-primary/10 focus:border-sage-primary outline-hidden cursor-pointer font-sans font-semibold"
          >
            <option value="">Status</option>
            <option value="ACTIVE">Active Plan</option>
            <option value="EXPIRED">Expired Plan</option>
          </select>

          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-utility-crimson/10 hover:bg-utility-crimson/20 text-utility-crimson text-xs font-bold rounded-xl transition-all cursor-pointer col-span-2 sm:col-auto whitespace-nowrap"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Master Content Ledger Grid */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-slate-light font-bold uppercase tracking-wider animate-pulse">Syncing Library Membership Database...</div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-light/10 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-light/10 text-xs font-bold text-slate-light uppercase bg-canvas-dominant/60 tracking-wider font-sans">
                    <th className="py-4 px-5">Member Name</th>
                    <th className="py-4 px-5">Contact Details</th>
                    <th className="py-4 px-5">Current Plan</th>
                    <th className="py-4 px-5">Plan Expiry Date</th>
                    <th className="py-4 px-5网页 center text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-light/10 text-slate-secondary font-data">
                  {memberList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm text-slate-light font-medium font-sans">
                        No active matching subscriber accounts found on server indexing.
                      </td>
                    </tr>
                  ) : (
                    memberList.map(member => (
                      <tr 
                        key={member.id} 
                        onClick={() => { setSelectedMember(member); setIsDetailsOpen(true); }}
                        className="hover:bg-sage-primary/5 transition-colors cursor-pointer group select-none"
                      >
                        <td className="py-4 px-5 font-bold text-slate-secondary group-hover:text-sage-primary transition-colors font-sans">
                          {member.name}
                        </td>
                        <td className="py-4 px-5">
                          <div className="font-semibold text-slate-secondary">{member.email}</div>
                          <div className="text-xs text-slate-light mt-0.5 font-medium">{member.phoneNumber || "No Phone Contact"}</div>
                        </td>
                        <td className="py-4 px-5 font-sans">
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-canvas-dominant text-slate-secondary border border-slate-light/10 tracking-wide">
                            {member.membershipPlanName}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-semibold text-slate-light">
                          {member.expiryDate}
                        </td>
                        <td className="py-4 px-5 text-center font-sans">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                            member.isActive 
                              ? "bg-sage-primary/10 text-sage-primary border border-sage-primary/20" 
                              : "bg-utility-crimson/10 text-utility-crimson border border-utility-crimson/20"
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
          </div>

          {/* SERVER PAGINATION NAVIGATION FOOTER */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-light/10 shadow-2xs">
            <span className="text-xs text-slate-light font-semibold font-sans">
              Showing Page <b className="text-slate-secondary font-data">{currentPage}</b> of <b className="text-slate-secondary font-data">{totalPages}</b> ({totalItems} Members Found)
            </span>
            <div className="flex gap-2 font-sans">
              <button
                disabled={currentPage === 1 || totalPages <= 1}
                onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(prev - 1, 1)); }}
                className="px-3 py-1.5 bg-canvas-dominant text-slate-secondary border border-slate-light/10 rounded-lg text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-light/5 transition-all cursor-pointer"
              >
                ◀ Previous
              </button>
              <button
                disabled={currentPage === totalPages || totalPages <= 1}
                onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(prev + 1, totalPages)); }}
                className="px-3 py-1.5 bg-canvas-dominant text-slate-secondary border border-slate-light/10 rounded-lg text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-light/5 transition-all cursor-pointer"
              >
                Next ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Form Modal Layer */}
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