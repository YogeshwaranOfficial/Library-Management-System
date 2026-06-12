import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";

// Component Modules
import { PlanModal } from "../components/PlanModal";
import { PlanDetailsModal } from "../components/PlanDetailsModal";

// Lucide Icons
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  RotateCcw,
  Award,
  BookOpen,
  X,
} from "lucide-react";

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
  const { data: plansFeedPayload = [], isLoading } = useQuery<MembershipPlan[]>(
    {
      queryKey: ["membershipPlansMasterFeed"],
      queryFn: async () => {
        const response = await axiosClient.get("/plan");
        return response.data?.data || response.data || [];
      },
    },
  );

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
    currentPage * rowsPerPage,
  );

  return (
    <div className="flex flex-col min-h-screen max-w-6xl relative animate-fade-in pb-12 font-sans text-xs sm:text-sm text-text-main text-left">
      {/* Header Deck View */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card-bg p-5 mb-5 rounded-2xl border border-border-main shadow-xs shrink-0">
        <div>
          <h2 className="text-xl font-bold text-text-main tracking-tight">
            Membership Plans Management Desk
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">
            Configure available registration tiers, duration indexes, and
            checkout limits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          <Plus size={14} /> Add New Plan
        </button>
      </div>

      {/* Control Grid Pipeline Filters (Synchronized inline form alignment layout) */}
      <div className="flex flex-col md:flex-row gap-3 bg-card-bg p-4 mb-5 rounded-2xl border border-border-main shadow-2xs shrink-0">
        {/* Search Field Anchor Box */}
        <div className="relative flex-1 w-full">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search plan schemes by profile names..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-border-main text-text-main rounded-xl text-xs sm:text-sm font-medium outline-hidden focus:bg-card-bg focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all placeholder-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-text-main p-0.5 cursor-pointer transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Action Select Dropdowns Group Container */}
        <div className="flex flex-wrap md:flex-nowrap gap-2.5 w-full md:w-auto items-center">
          {/* Duration Selector Block */}
          <div className="w-full md:w-44 relative">
            <select
              value={durationFilter}
              onChange={(e) => {
                setDurationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-border-main text-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider appearance-none outline-hidden focus:bg-card-bg focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all cursor-pointer"
            >
              <option value="">All Durations</option>
              <option value="30">30 Days</option>
              <option value="90">90 Days</option>
              <option value="180">180 Days</option>
              <option value="365">365 Days</option>
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <ChevronDown size={14} />
            </span>
          </div>

          {/* Pricing Sort Selector Block */}
          <div className="w-full md:w-44 relative">
            <select
              value={priceSortFilter}
              onChange={(e) => {
                setPriceSortFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-border-main text-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider appearance-none outline-hidden focus:bg-card-bg focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all cursor-pointer"
            >
              <option value="">Price Order</option>
              <option value="low-to-high">Low to High</option>
              <option value="high-to-low">High to Low</option>
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <ChevronDown size={14} />
            </span>
          </div>

          {/* Reset Action Control Trigger */}
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-4 py-2 h-8.5 text-xs font-bold text-slate-500 bg-slate-50 border border-border-main hover:bg-slate-100 hover:text-text-main rounded-xl cursor-pointer transition-all text-center whitespace-nowrap flex items-center justify-center gap-1.5 uppercase"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* Central Interactive Data Core Grid Matrix */}
      {isLoading ? (
        <div className="text-center py-20 text-xs sm:text-sm text-slate-400 font-semibold animate-pulse flex-1 flex flex-col items-center justify-center gap-2">
          Streaming Active Membership Matrix Configuration Tiers...
        </div>
      ) : (
        <div className="flex flex-col flex-1 space-y-5">
          <div className="bg-card-bg rounded-2xl border border-border-main shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-main text-[11px] font-bold text-slate-400 uppercase bg-slate-50 tracking-wider">
                    <th className="py-3.5 px-5">Plan ID</th>
                    <th className="py-3.5 px-5">Plan Name</th>
                    <th className="py-3.5 px-5 text-center">Duration</th>
                    <th className="py-3.5 px-5 text-center">
                      Max Borrow Limit
                    </th>
                    <th className="py-3.5 px-5 text-right">Price</th>
                    <th className="py-3.5 px-5 text-right">Date Created</th>
                  </tr>
                </thead>
                <tbody className="text-xs sm:text-sm divide-y divide-slate-100 text-text-main">
                  {paginatedRowsData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-20 text-xs text-slate-500 font-medium"
                      >
                        Operational Clear View. Zero matching membership target
                        layouts found.
                      </td>
                    </tr>
                  ) : (
                    paginatedRowsData.map((plan) => {
                      const humanId =
                        plan.membership_plan_id?.slice(-4).toUpperCase() ||
                        "0000";
                      return (
                        <tr
                          key={plan.membership_plan_id}
                          onClick={() => setSelectedPlan(plan)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group select-none"
                        >
                          <td className="py-3.5 px-5 font-mono font-bold text-slate-400 tracking-wider text-[11px] sm:text-xs">
                            PLAN-{humanId}
                          </td>
                          <td className="py-3.5 px-5 font-bold text-text-main">
                            <div className="flex items-center gap-2.5">
                              <Award
                                size={16}
                                className="text-amber-500 shrink-0"
                              />
                              <span>{plan.plan_name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-center font-bold">
                            <span className="bg-slate-50 px-2.5 py-0.5 rounded-lg text-text-main text-[11px] font-bold uppercase tracking-wider border border-slate-100">
                              {plan.duration_days} Days
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <div className="flex items-center justify-center gap-1.5 font-bold text-text-main">
                              <BookOpen size={13} className="text-slate-400" />
                              <span>{plan.max_books_allowed} Vols</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-5 font-mono font-bold text-text-main text-right">
                            ₹{plan.price}
                          </td>
                          <td className="py-3.5 px-5 font-medium text-slate-400 text-right text-[11px] sm:text-xs">
                            {new Date(plan.created_at)
                              .toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                              .toUpperCase()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer block */}
            {totalPagesCount > 0 && (
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>
                  Page {currentPage} / {totalPagesCount}{" "}
                  <span className="text-slate-300 mx-2">|</span> Total{" "}
                  {totalItemsCount} Plans
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPage((p) => Math.max(1, p - 1));
                    }}
                    className="p-2 border border-border-main bg-card-bg hover:bg-slate-50 text-slate-600 rounded-lg disabled:opacity-30 cursor-pointer transition-colors shadow-xs"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={currentPage === totalPagesCount}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPage((p) => Math.min(totalPagesCount, p + 1));
                    }}
                    className="p-2 border border-border-main bg-card-bg hover:bg-slate-50 text-slate-600 rounded-lg disabled:opacity-30 cursor-pointer transition-colors shadow-xs"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals Infrastructure Overlay Layer Blocks */}
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
