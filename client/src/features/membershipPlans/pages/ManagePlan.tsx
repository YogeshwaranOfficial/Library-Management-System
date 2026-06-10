import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";

// Component Modules
import { PlanModal } from "../components/PlanModal";
import { PlanDetailsModal } from "../components/PlanDetailsModal";

// Lucide Icons
import { Search, Filter, ChevronLeft, ChevronRight, Plus, RotateCcw, Award, BookOpen } from "lucide-react";

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
    <div className="space-y-6 animate-fade-in pb-12 text-left bg-slate-900 min-h-screen p-1">
      
      {/* Header Deck View */}
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Manage Membership Plans</h2>
          <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
            Configure available registration tiers, duration indexes, and checkout limits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest bg-white hover:bg-slate-100 text-slate-950 rounded-md transition-all cursor-pointer self-stretch sm:self-auto justify-center"
        >
          <Plus size={14} className="stroke-3" /> Add New Plan
        </button>
      </div>

      {/* Control Grid Pipeline Filters */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative w-full md:flex-1">
          <input
            type="text"
            placeholder="Search plan schemes by profile names..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-md text-xs font-semibold text-white placeholder:text-slate-600 outline-none focus:border-slate-400 transition-all"
          />
          <Search size={14} className="text-slate-600 absolute left-3.5 top-3.5" />
        </div>

        <div className="w-full md:w-48 relative">
          <select
            value={durationFilter}
            onChange={(e) => { setDurationFilter(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-8 py-2.5 bg-slate-900 border border-slate-800 rounded-md text-xs font-black uppercase tracking-wider text-white appearance-none outline-none focus:border-slate-400 transition-all cursor-pointer"
          >
            <option value="" className="bg-slate-950 text-slate-500">All Durations</option>
            <option value="30" className="bg-slate-950">30 Days</option>
            <option value="90" className="bg-slate-950">90 Days</option>
            <option value="180" className="bg-slate-950">180 Days</option>
            <option value="365" className="bg-slate-950">365 Days</option>
          </select>
          <Filter size={14} className="text-slate-600 absolute left-3.5 top-3.5 pointer-events-none" />
          <div className="absolute right-3.5 top-4.5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-400 w-0 h-0" />
        </div>

        <div className="w-full md:w-48 relative">
          <select
            value={priceSortFilter}
            onChange={(e) => { setPriceSortFilter(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-8 py-2.5 bg-slate-900 border border-slate-800 rounded-md text-xs font-black uppercase tracking-wider text-white appearance-none outline-none focus:border-slate-400 transition-all cursor-pointer"
          >
            <option value="" className="bg-slate-950 text-slate-500">Price Order</option>
            <option value="low-to-high" className="bg-slate-950">Price: Low to High</option>
            <option value="high-to-low" className="bg-slate-950">Price: High to Low</option>
          </select>
          <Filter size={14} className="text-slate-600 absolute left-3.5 top-3.5 pointer-events-none" />
          <div className="absolute right-3.5 top-4.5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-400 w-0 h-0" />
        </div>

        <button
          type="button"
          onClick={handleClearFilters}
          className="w-full md:w-auto px-4 py-2.5 text-[10px] font-black uppercase tracking-widest bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 rounded-md transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Central Interactive Data Core Grid Matrix */}
      {isLoading ? (
        <div className="text-center py-24 text-[10px] font-black uppercase tracking-widest text-slate-500 animate-pulse font-mono">
          Streaming Active Membership Matrix Configuration Tiers...
        </div>
      ) : (
        <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase bg-slate-900/40 tracking-wider">
                  <th className="py-4 px-5">Plan ID</th>
                  <th className="py-4 px-5">Plan Name</th>
                  <th className="py-4 px-5 text-center">Duration</th>
                  <th className="py-4 px-5 text-center">Max Borrow Limit</th>
                  <th className="py-4 px-5 text-right">Price</th>
                  <th className="py-4 px-5 text-right">Date Created</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-900 text-slate-300">
                {paginatedRowsData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-xs text-slate-500 font-medium font-sans">
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
                        className="hover:bg-slate-900/50 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-5 font-mono font-bold text-slate-500 tracking-wider group-hover:text-slate-400">
                          PLAN-{humanId}
                        </td>
                        <td className="py-4 px-5 font-bold text-white uppercase tracking-wide">
                          <div className="flex items-center gap-2">
                            <Award size={13} className="text-white shrink-0" />
                            <span>{plan.plan_name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-center font-mono">
                          <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-slate-300 font-bold">
                            {plan.duration_days} Days
                          </span>
                        </td>
                        <td className="py-4 px-5 text-center">
                          <div className="flex items-center justify-center gap-1.5 font-mono font-bold text-slate-300">
                            <BookOpen size={11} className="text-slate-600" />
                            <span>{plan.max_books_allowed} Vols</span>
                          </div>
                        </td>
                        <td className="py-4 px-5 font-mono font-black text-white text-right text-sm">
                          ₹{plan.price}
                        </td>
                        <td className="py-4 px-5 font-mono font-medium text-slate-500 text-right">
                          {new Date(plan.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-900/20 border-t border-slate-900 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">
            <span>
              Page {currentPage} / {totalPagesCount} <span className="text-slate-700 font-sans mx-1">|</span> Total {totalItemsCount} Records
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={(e) => { e.stopPropagation(); setCurrentPage((p) => p - 1); }}
                className="p-2 border border-slate-800 bg-slate-900 hover:bg-slate-850 text-white rounded-md disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft size={12} className="stroke-3" />
              </button>
              <button
                type="button"
                disabled={currentPage === totalPagesCount}
                onClick={(e) => { e.stopPropagation(); setCurrentPage((p) => p + 1); }}
                className="p-2 border border-slate-800 bg-slate-900 hover:bg-slate-850 text-white rounded-md disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronRight size={12} className="stroke-3" />
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