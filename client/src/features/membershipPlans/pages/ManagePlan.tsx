import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { PlanModal } from "../components/PlanModal";
import { PlanDetailsModal } from "../components/PlanDetailsModal";
import type { MembershipPlan } from "../../../types/members";
import { useAuthStore } from "../../../store/authStore";
import {
  Plus,
  Search,
  RotateCcw,
  X,
  Layers
} from "lucide-react";

export interface ExtendedPlan extends MembershipPlan {
  infoText?: string;
  isPlanActive?: boolean;
  activeMembersCount: number;
  inactiveMembersCount: number;
  max_books_allowed:number;
}

export const ManagePlan = () => {
  const queryClient = useQueryClient();

  // Filter and pagination parameters
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal controllers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ExtendedPlan | null>(null);

  const token = useAuthStore((state) => state.token);

  // Core background querying pipeline matching data schema rows
  const { data: plansPayload, isLoading } = useQuery<{
    total: number;
    globalActiveMembers: number;
    globalInactiveMembers: number;
    data: ExtendedPlan[];
  }>({
    queryKey: ["membershipPlansFeed", token, currentPage, searchTerm],
    queryFn: async () => {
      const res = await axiosClient.get("/members/plans", {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
        },
      });

      const rootData = res.data?.data || res.data;
      const rawRecords = Array.isArray(rootData) ? rootData : (rootData?.data || []);
      const totalCount = rootData?.meta?.total || rawRecords.length || 0;
      
      const transformed = rawRecords.map((dbRow: unknown): ExtendedPlan => {
        const row = dbRow as Record<string, unknown>;
        
        const activeCount = Number(row.active_members_count ?? row.active_members ?? row.activeMembers ?? 0);
        const inactiveCount = Number(row.inactive_members_count ?? row.inactive_members ?? row.inactiveMembers ?? 0);

        return {
          membership_plan_id: String(row.membership_plan_id || row.id || ""),
          plan_name: String(row.plan_name || row.name || "Unnamed Tier Plan"),
          price: Number(row.price || 0),
          duration_days: Number(row.duration_days || row.duration || 0),
          max_books_allowed: Number(row.max_books_allowed || row.maxBooks || 0),
          infoText: String(row.description || row.infoText || "No plan description outlined."),
          isPlanActive: row.is_active === true || row.membership_status === "ACTIVE" || row.status === "ACTIVE",
          activeMembersCount: activeCount,
          inactiveMembersCount: inactiveCount,
        };
      });

      const globalActiveMembersCount = rootData?.meta?.globalActiveMembers ?? transformed.reduce((acc: number, p: ExtendedPlan) => acc + p.activeMembersCount, 0);
      const globalInactiveMembersCount = rootData?.meta?.globalInactiveMembers ?? transformed.reduce((acc: number, p: ExtendedPlan) => acc + p.inactiveMembersCount, 0);

      return { 
        total: totalCount, 
        globalActiveMembers: globalActiveMembersCount, 
        globalInactiveMembers: globalInactiveMembersCount, 
        data: transformed 
      };
    },
    enabled: !!token,
  });

  const rawPlanList = plansPayload?.data || [];
  
  const planList = rawPlanList.filter(plan => {
    return plan.plan_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const hasActiveFilters = Boolean(searchTerm);
  const displayTotal = planList.length;

  const totalPages = Math.ceil(planList.length / 10) || 1;

  const handleClearFilters = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const getInitials = (name: string) => (name ? name.charAt(0).toUpperCase() : "P");

  const handleRowClick = (plan: ExtendedPlan) => {
    setSelectedPlan(plan);
    setIsDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-[#2D3748] antialiased pb-16 pt-10 px-8 lg:px-14 font-sans select-none">
      
      {/* ==================== ZONES A & B: HEADER & METRICS DASHBOARD ==================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#718096] text-[11px] font-bold uppercase tracking-widest mb-1.5">
            <Layers size={13} className="stroke-[2.5]" /> Setup
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A365D]">
            Membsership Plans
          </h1>
        </div>

        {/* Dynamic Metric Dashboard Tracker Section */}
        <div className="flex items-center gap-10 select-none pb-0.5">
          <div>
            <span className="block text-2xl font-bold text-[#1A365D] tracking-tight leading-none text-right">
              {displayTotal}
            </span>
            <span className="text-[10px] font-semibold text-[#718096] uppercase tracking-wider mt-2 block">
              {hasActiveFilters ? "Matched Plans" : "Total Plans"}
            </span>
          </div>
          <div className="w-px h-6 bg-gray-200 self-end mb-0.5" />
          <div>
            <span className="block text-2xl font-bold text-emerald-600 tracking-tight leading-none text-right">
              {plansPayload?.globalActiveMembers ?? 0}
            </span>
            <span className="text-[10px] font-semibold text-[#718096] uppercase tracking-wider mt-2 block">
              Active Plans
            </span>
          </div>
          <div className="w-px h-6 bg-gray-200 self-end mb-0.5" />
          <div>
            <span className="block text-2xl font-bold text-rose-600 tracking-tight leading-none text-right">
              {plansPayload?.globalInactiveMembers ?? 0}
            </span>
            <span className="text-[10px] font-semibold text-[#718096] uppercase tracking-wider mt-2 block">
              Inactive Plans
            </span>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200 w-full mb-6" />

      {/* ==================== ZONE C: UTILITIES ==================== */}
      <div className="flex items-center justify-between gap-4 mb-4 h-9">
        <div className="text-[10px] font-bold tracking-widest text-[#1A365D] uppercase">
          Plans Matrix
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-sm focus-within:border-gray-300 focus-within:bg-white transition-all w-48">
            <Search size={13} className="text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search tiers..."
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
            className={`p-1.5 rounded-full transition-colors ${hasActiveFilters ? "text-rose-600 hover:bg-rose-50" : "text-gray-400 hover:bg-gray-100"}`}
            title="Reset Filters"
          >
            <RotateCcw size={15} />
          </button>

          <div className="w-px h-4 bg-gray-200 mx-0.5" />

          <button
            onClick={() => { setSelectedPlan(null); setIsFormOpen(true); }}
            className="flex items-center justify-center p-1.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white rounded-full transition-all cursor-pointer shadow-2xs shrink-0"
            title="Create Plan Tier"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ==================== ZONE D: GRID/TABLE FLEX DISPLAY ==================== */}
      <div className="flex items-start w-full border-t border-gray-100 pt-4 gap-0">
        
        {/* Main Plans Table Column - Static Clean Width */}
        <div className="w-full">
          {isLoading ? (
            <div className="py-24 text-xs font-semibold text-[#718096] tracking-widest uppercase animate-pulse">
              Syncing active subscription structure sequences...
            </div>
          ) : (
            <div className="w-full">
              <div className="overflow-visible w-full">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="border-b border-gray-200 text-[11px] font-bold text-[#718096] uppercase tracking-widest bg-transparent select-none">
                      <th className="pb-3 pr-4 font-bold tracking-widest w-[40%] pl-3">Plan Tier</th>
                      <th className="pb-3 px-4 font-bold tracking-widest w-[25%]">Duration</th>
                      <th className="pb-3 px-4 font-bold tracking-widest w-[20%]">Rate Pricing</th>
                      <th className="pb-3 px-4 font-bold tracking-widest w-[15%] text-right">Active Members</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100 font-medium text-[#2D3748]">
                    {planList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-20 text-left text-sm text-[#718096] font-medium pl-3">
                          No customized plans matching this data parameters inside architecture view.
                        </td>
                      </tr>
                    ) : (
                      planList.map((plan) => {
                        return (
                          <tr
                            key={plan.membership_plan_id}
                            onClick={() => handleRowClick(plan)}
                            className="transition-all duration-150 cursor-pointer hover:bg-blue-50/40"
                          >
                            <td className="py-4 pr-4 pl-3 text-[#1A365D] truncate">
                              <div className="flex items-center gap-3 truncate">
                                <div className="w-7 h-7 bg-slate-100 text-[#1A365D] font-semibold text-xs rounded-md flex items-center justify-center shrink-0">
                                  {getInitials(plan.plan_name)}
                                </div>
                                <div className="font-semibold tracking-tight text-sm truncate text-[#1A365D]">
                                  {plan.plan_name}
                                </div>
                              </div>
                            </td>
                            
                            <td className="py-4 px-4 truncate">
                              <div className="font-medium text-gray-700 text-sm truncate">{plan.duration_days} Days</div>
                            </td>

                            <td className="py-4 px-4 truncate">
                              <div className="font-semibold text-[#2D3748] tracking-tight text-sm truncate">
                                ₹{plan.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </td>

                            <td className="py-4 px-4 truncate text-right font-semibold text-gray-800 pr-4">
                              {plan.activeMembersCount}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

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
                      ← Previous
                    </button>
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={(e) => { e.stopPropagation(); setCurrentPage((p) => Math.min(p + 1, totalPages)); }}
                      className="text-gray-600 font-semibold tracking-wider disabled:opacity-20 cursor-pointer hover:text-[#2B6CB0] flex items-center gap-1 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Global Form Context Modal */}
      <PlanModal
        isOpen={isFormOpen}
        mode={selectedPlan ? "edit" : "create"}
        plan={selectedPlan}
        onClose={() => {
          setIsFormOpen(false);
          // Invalidate cache immediately on close to catch newly created plans perfectly
          queryClient.invalidateQueries({ queryKey: ["membershipPlansFeed"] });
        }}
      />

      {/* Centered Details Layer Engine Overlay */}
      <PlanDetailsModal
        isOpen={isDetailsOpen}
        plan={selectedPlan}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedPlan(null);
          queryClient.invalidateQueries({ queryKey: ["membershipPlansFeed"] });
        }}
      />
    </div>
  );
};