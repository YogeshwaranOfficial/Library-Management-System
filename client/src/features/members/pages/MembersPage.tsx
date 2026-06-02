import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { MemberModal } from "../components/MemberModal";
import { DeleteConfirmationModal } from "../components/DeleteConfirmationModal";
import type { LibraryMember, SystemUser, MembershipPlan } from "../../../types/members";
import type { MemberFormValues } from "../schemas/memberSchema";
import { toast } from "sonner";

export const MembersPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  
  // Modal tracking configurations
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<LibraryMember | null>(null);

  // 1. Fetch data feeds from backend routes
  const { data: members, isLoading } = useQuery<LibraryMember[]>({
    queryKey: ["membersListFeed"],
    queryFn: async () => (await axiosClient.get("/members")).data
  });

  const { data: users = [] } = useQuery<SystemUser[]>({
    queryKey: ["systemUsersDropdownFeed"],
    queryFn: async () => (await axiosClient.get("/users/available-for-membership")).data
  });

  const { data: plans = [] } = useQuery<MembershipPlan[]>({
    queryKey: ["membershipPlansFeed"],
    queryFn: async () => (await axiosClient.get("/membership-plans")).data
  });

  // 2. Data Mutation Handlers
  const saveMutation = useMutation({
    mutationFn: async (payload: MemberFormValues) => {
      if (selectedMember) {
        return await axiosClient.put(`/members/${selectedMember.id}`, payload);
      }
      return await axiosClient.post("/members", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membersListFeed"] });
      toast.success("Member record synced successfully!");
      setIsFormOpen(false);
    },
    onError: () => toast.error("Database operation failed.")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await axiosClient.delete(`/members/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membersListFeed"] });
      toast.success("Membership profiles cleared cleanly.");
      setIsDeleteOpen(false);
    }
  });

  // 3. Search and filter parsing logic
  const filteredMembers = members?.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = planFilter === "" || m.membershipPlanId === planFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">System Membership Registry CRM</h2>
          <p className="text-xs text-gray-500">Create, upgrade, renew, and terminate active member accounts.</p>
        </div>
        <button
          onClick={() => { setSelectedMember(null); setIsFormOpen(true); }}
          className="px-4 py-2.5 bg-teal-brand hover:bg-teal-hover text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          ➕ Register New Member Profile
        </button>
      </div>

      {/* Filter and search utilities controls line */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <input
          type="text"
          placeholder="🔎 Lookup member accounts by profile name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:col-span-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand"
        />
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand"
        >
          <option value="">-- Filter By Plan Duration Tier --</option>
          {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Master Content Ledger Table Grid */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-gray-400 font-semibold animate-pulse">Syncing Membership Ledger Records...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase bg-gray-50/70">
                  <th className="py-3.5 px-4">Member ID</th>
                  <th className="py-3.5 px-4">Account Holder Name</th>
                  <th className="py-3.5 px-4">Allocated Tier Plan</th>
                  <th className="py-3.5 px-4">Validation Term Cycle (Expiry)</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action Management</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
                {filteredMembers?.map(member => (
                  <tr key={member.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-500 font-bold">#{member.id.substring(0, 8)}</td>
                    <td className="py-3.5 px-4 font-medium text-gray-900">
                      <div>{member.name}</div>
                      <div className="text-xs text-gray-400 font-normal">{member.email}</div>
                    </td>
                    <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">{member.membershipPlanName}</span></td>
                    <td className="py-3.5 px-4 font-medium text-gray-600">Until: {member.expiryDate}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${member.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                        {member.isActive ? "Active Log" : "Terminated"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button onClick={() => { setSelectedMember(member); setIsFormOpen(true); }} className="text-xs font-bold text-teal-brand hover:text-teal-hover transition-colors cursor-pointer">Edit Profile</button>
                      <button onClick={() => { setSelectedMember(member); setIsDeleteOpen(true); }} className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer">Disconnect</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <MemberModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={(vals) => saveMutation.mutate(vals)} users={users} plans={plans} editingMember={selectedMember} />
      <DeleteConfirmationModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={() => selectedMember && deleteMutation.mutate(selectedMember.id)} memberName={selectedMember?.name || ""} />
    </div>
  );
};