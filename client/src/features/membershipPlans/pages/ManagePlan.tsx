import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";

// Component Modules
import { PlanModal } from "../components/PlanModal";
import { PlanDetailsModal } from "../components/PlanDetailsModal";

// Lucide Icons
import { Search, ChevronLeft, ChevronRight, Plus, RotateCcw, Award, BookOpen } from "lucide-react";

export interface MembershipPlan {
  membership_plan_id: string;
  plan_name: string;
  price: number;
  duration_days: number;
  max_books_allowed: number;
  created_at: string;
  updated_at: string;
}

export const ManagePlan = () => {
  // Modals Core Management States
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Search & Metric Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [durationFilter, setDurationFilter] = useState("");
  const [priceSortFilter, setPriceSortFilter] = useState("");

  // Pagination Controls State
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Fetch Data Stream from Database
  const { data: plansFeedPayload = [], isLoading } = useQuery<MembershipPlan[]>({
    queryKey: ["membershipPlansMasterFeed"],
    queryFn: async () => {
      const response = await axiosClient.get("/plan");
      return response.data?.data || response.data || [];
    }
  });

  // Clear Filters Pipeline
  const handleClearFilters = () => {
    setSearchQuery("");
    setDurationFilter("");
    setPriceSortFilter("");
    setCurrentPage(1);
  };

  // Multi-tier filtering context pipeline logic
  const filteredPlans = plansFeedPayload
    .filter((plan) => {
      const term = searchQuery.toLowerCase().trim();
      const nameMatch = (plan?.plan_name || "").toLowerCase().includes(term);
      const passesSearch = term === "" || nameMatch;

      let passesDuration = true;
      if (durationFilter) {
        passesDuration = plan.duration_days === Number(durationFilter);
      }

      return passesSearch && passesDuration;
    })
    .sort((a, b) => {
      if (priceSortFilter === "low-to-high") return a.price - b.price;
      if (priceSortFilter === "high-to-low") return b.price - a.price;
      return 0;
    });

  // Inline dynamic pagination offsets
  const totalItemsCount = filteredPlans.length;
  const totalPagesCount = Math.ceil(totalItemsCount / rowsPerPage) || 1;
  const paginatedRowsData = filteredPlans.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-left bg-[#fafafa] min-h-screen font-sans text-xs sm:text-sm text-slate-700">
      
      {/* Header Deck View */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Membership Plans Management Desk</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
            Configure available registration tiers, duration indexes, and checkout limits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all cursor-pointer self-stretch sm:self-auto justify-center shadow-xs"
        >
          <Plus size={14} /> Add New Plan
        </button>
      </div>

      {/* Control Grid Pipeline Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-1">
          <input
            type="text"
            placeholder="Search plan schemes by profile names..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-hidden focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 focus:bg-white transition-all"
          />
          <Search size={16} className="text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>

        <div className="w-full md:w-48 relative">
          <select
            value={durationFilter}
            onChange={(e) => { setDurationFilter(e.target.value); setCurrentPage(1); }}
            className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 appearance-none outline-hidden focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 focus:bg-white cursor-pointer"
          >
            <option value="">All Durations</option>
            <option value="30">30 Days</option>
            <option value="90">90 Days</option>
            <option value="180">180 Days</option>
            <option value="365">365 Days</option>
          </select>
        </div>

        <div className="w-full md:w-48 relative">
          <select
            value={priceSortFilter}
            onChange={(e) => { setPriceSortFilter(e.target.value); setCurrentPage(1); }}
            className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 appearance-none outline-hidden focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 focus:bg-white cursor-pointer"
          >
            <option value="">Price Order</option>
            <option value="low-to-high">Price: Low to High</option>
            <option value="high-to-low">Price: High to Low</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleClearFilters}
          className="w-full md:w-auto px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* Central Interactive Data Core Grid Matrix */}
      {isLoading ? (
        <div className="text-center py-24 text-xs font-bold uppercase tracking-widest text-slate-400 animate-pulse">
          Streaming Active Membership Matrix Configuration Tiers...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] sm:text-xs font-bold text-slate-400 uppercase bg-slate-50/50 tracking-wider">
                  <th className="py-4 px-6">Plan ID</th>
                  <th className="py-4 px-6">Plan Name</th>
                  <th className="py-4 px-6 text-center">Duration</th>
                  <th className="py-4 px-6 text-center">Max Borrow Limit</th>
                  <th className="py-4 px-6 text-right">Price</th>
                  <th className="py-4 px-6 text-right">Date Created</th>
                </tr>
              </thead>
              <tbody className="text-xs sm:text-sm divide-y divide-slate-100 text-slate-700">
                {paginatedRowsData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-20 text-xs text-slate-500 font-medium">
                      Operational Clear View. Zero matching membership target layouts found.
                    </td>
                  </tr>
                ) : (
                  paginatedRowsData.map((plan) => {
                    const humanId = plan.membership_plan_id?.slice(-4).toUpperCase() || "0000";
                    return (
                      <tr 
                        key={plan.membership_plan_id} 
                        onClick={() => setSelectedPlan(plan)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer group select-none"
                      >
                        <td className="py-4 px-6 font-mono font-bold text-slate-400 tracking-wider text-[11px] sm:text-xs">
                          PLAN-{humanId}
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900">
                          <div className="flex items-center gap-3">
                            <Award size={16} className="text-amber-500 shrink-0" />
                            <span>{plan.plan_name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center font-bold">
                          <span className="bg-slate-100 px-2.5 py-0.5 rounded-lg text-slate-700 text-[11px] sm:text-xs">
                            {plan.duration_days} Days
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5 font-bold text-slate-700">
                            <BookOpen size={14} className="text-slate-400" />
                            <span>{plan.max_books_allowed} Vols</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900 text-right">
                          ₹{plan.price}
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-500 text-right text-[11px] sm:text-xs">
                          {new Date(plan.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>
              Page {currentPage} / {totalPagesCount} <span className="text-slate-300 mx-2">|</span> Total {totalItemsCount} Plans
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
                disabled={currentPage === totalPagesCount}
                onClick={(e) => { e.stopPropagation(); setCurrentPage((p) => Math.min(totalPagesCount, p + 1)); }}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg disabled:opacity-30 cursor-pointer transition-colors shadow-xs"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <PlanModal 
          isOpen={showCreateModal} 
          mode="create" 
          plan={null} 
          onClose={() => setShowCreateModal(false)} 
        />
      )}

      {selectedPlan && (
        <PlanDetailsModal 
          isOpen={!!selectedPlan} 
          plan={selectedPlan} 
          onClose={() => setSelectedPlan(null)} 
        />
      )}

    </div>
  );
};