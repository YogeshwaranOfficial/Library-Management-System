import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
    queryKey: ["systemUsersDropdownFeed", token],
    queryFn: async () => {
      const res = await axiosClient.get("/members/available-users");
      return res.data?.data || res.data || [];
    },
    enabled: !!token,
  });

  // Create or Update Membership Master Pipeline Mutation
  const saveMemberMutation = useMutation({
    mutationFn: async (payload: MemberFormValues) => {
      if (selectedMember) {
        return await axiosClient.put(`/members/${selectedMember.id}`, payload);
      }
      return await axiosClient.post("/members", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membersListFeed"] });
      toast.success("Subscriber membership definition updated cleanly.");
      setIsFormOpen(false);
      setSelectedMember(null);
    },
    onError: () => {
      toast.error("Database schema validation failed on submission updates.");
    }
  });

  // RENEW SUBMISSION MUTATION (From the row info cards details panel directly)
  const renewMutation = useMutation({
    mutationFn: async ({ memberId, planId }: { memberId: string; planId: string }) => {
      return await axiosClient.put(`/members/${memberId}/renew`, {
        membershipPlanId: planId,
        start_date: new Date().toISOString().split("T")[0],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membersListFeed"] });
      toast.success("💥 Membership activated successfully!");
      setIsDetailsOpen(false);
      setSelectedMember(null);
    },
    onError: () => {
      toast.error("Database contract update failed.");
    }
  });

  // DELETE ACCOUNT PROFILES CLEARANCE MUTATION
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await axiosClient.delete(`/members/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membersListFeed"] });
      toast.success("Account profile cleared cleanly from matrix.");
      setIsDetailsOpen(false);
      setSelectedMember(null);
    },
    onError: () => toast.error("Purge operations rejected by database server.")
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
    <div className="space-y-6 animate-fade-in">
      {/* Page Core Header Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Library Members Registry</h2>
          <p className="text-xs text-gray-500 mt-0.5">Click any record row to manage tier tracking, view info cards, or extend membership renewals.</p>
        </div>
        <button
          onClick={() => { setSelectedMember(null); setIsFormOpen(true); }}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-all whitespace-nowrap cursor-pointer"
        >
          ➕ Add New Member
        </button>
      </div>

      {/* Control Utility Toolbar Filters Line */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="🔎 Search by member name..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand outline-hidden transition-all"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex gap-3">
          {/* 💡 UPDATED FILTER: Rendering real database options dynamically instead of static placeholders */}
          <select
            value={tierFilter}
            onChange={(e) => { setTierFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand outline-hidden cursor-pointer"
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
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand outline-hidden cursor-pointer"
          >
            <option value="">Status</option>
            <option value="ACTIVE">Active Plan</option>
            <option value="EXPIRED">Expired Plan</option>
          </select>

          <button
            onClick={handleClearFilters}
            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-all cursor-pointer col-span-2 sm:col-auto whitespace-nowrap"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Master Content Ledger Grid */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-gray-400 font-semibold animate-pulse">Syncing Library Membership Database...</div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-bold text-gray-400 uppercase bg-gray-50/60 tracking-wider">
                    <th className="py-4 px-5">Member Name</th>
                    <th className="py-4 px-5">Contact Details</th>
                    <th className="py-4 px-5">Current Plan</th>
                    <th className="py-4 px-5">Plan Expiry Date</th>
                    <th className="py-4 px-5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
                  {memberList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm text-gray-400 font-medium">
                        No active matching subscriber accounts found on server indexing.
                      </td>
                    </tr>
                  ) : (
                    memberList.map(member => (
                      <tr 
                        key={member.id} 
                        onClick={() => { setSelectedMember(member); setIsDetailsOpen(true); }}
                        className="hover:bg-teal-50/40 transition-colors cursor-pointer group select-none"
                      >
                        <td className="py-4 px-5 font-bold text-gray-900 group-hover:text-teal-900 transition-colors">
                          {member.name}
                        </td>
                        <td className="py-4 px-5">
                          <div className="font-medium text-gray-700">{member.email}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{member.phoneNumber || "No Phone Contact"}</div>
                        </td>
                        <td className="py-4 px-5">
                          <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-gray-100 text-gray-700 tracking-wide">
                            {member.membershipPlanName}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-medium text-gray-600">
                          {member.expiryDate}
                        </td>
                        <td className="py-4 px-5 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                            member.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
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
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-xs text-gray-500 font-medium">
              Showing Page <b>{currentPage}</b> of <b>{totalPages}</b> ({totalItems} Members Found)
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1 || totalPages <= 1}
                onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(prev - 1, 1)); }}
                className="px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-all cursor-pointer"
              >
                ◀ Previous
              </button>
              <button
                disabled={currentPage === totalPages || totalPages <= 1}
                onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(prev + 1, totalPages)); }}
                className="px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-all cursor-pointer"
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