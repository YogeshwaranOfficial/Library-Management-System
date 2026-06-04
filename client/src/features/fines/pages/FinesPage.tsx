import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import type { FineRecord } from "../../../types/fines";
import { toast } from "sonner";

// Component Modules
import { FinesNotificationBanner } from "../components/FinesNotificationBanner";
import { FineDetailsModal } from "../components/FineDetailsModal";
import { SettleFinePaymentModal } from "../components/SettleFinePaymentModal";

// Lucide Icons
import { Search, Filter, RefreshCw, Eye, Landmark, ChevronLeft, ChevronRight } from "lucide-react";

export const FinesPage = () => {
  const queryClient = useQueryClient();

  // Search & Metric Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [delayIntervalFilter, setDelayIntervalFilter] = useState(""); // "", "7", "14", "30"

  // Pagination Controls State
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Modals Core Management States
  const [selectedFineForDetails, setSelectedFineForDetails] = useState<FineRecord | null>(null);
  const [selectedFineForSettlement, setSelectedFineForSettlement] = useState<FineRecord | null>(null);

  // 1. Fetch PENDING Fines (Excludes paid_status = true records natively)
  const { data: activeFinesList = [], isLoading } = useQuery<FineRecord[]>({
    queryKey: ["finesMasterLedgerFeed", "pending"],
    queryFn: async () => {
      const response = await axiosClient.get("/fines/pending");
      return response.data?.data || response.data || [];
    }
  });

  // 2. Patch Action Mutation Pipeline matching route specifications
  // Route: PATCH /fines/pay
  const processPaymentMutation = useMutation({
    mutationFn: async ({ id, paidDate }: { id: string; paidDate: string }) => {
      return await axiosClient.patch("/fines/pay", {
        fineId: id,
        paidDate: paidDate
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finesMasterLedgerFeed"] });
      setSelectedFineForSettlement(null);
      toast.success("💸 Invoice Ledger Balanced Successfully!", {
        description: "Transaction finalized. This file has moved safely to Collected Ledger records.",
        duration: 4000
      });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || "Execution engine rejected settlement input data parameters.");
    }
  });

  // 3. Invoice Target Soft Delete Mutation Node
  const softDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await axiosClient.delete(`/fines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finesMasterLedgerFeed"] });
      setSelectedFineForSettlement(null);
      toast.info("Invoice instance removed safely from core operational stream processing view panels.");
    }
  });

  // 4. Client Side Clean Functional Filter Pipeline
  const filteredFines = activeFinesList.filter((fine) => {
    const term = searchQuery.toLowerCase().trim();
    const nameMatch = (fine?.memberName || "").toLowerCase().includes(term);
    const titleMatch = (fine?.bookTitle || "").toLowerCase().includes(term);
    const passesSearch = term === "" || nameMatch || titleMatch;

    let passesDelayRange = true;
    if (delayIntervalFilter === "7") passesDelayRange = fine.delayed_days > 7;
    if (delayIntervalFilter === "14") passesDelayRange = fine.delayed_days > 14;
    if (delayIntervalFilter === "30") passesDelayRange = fine.delayed_days > 30;

    return passesSearch && passesDelayRange;
  });

  // 5. Portfolio Meta Aggregators for Banner Nodes
  const totalUnpaidInvoicesToday = activeFinesList.length;
  const aggregateAccruedSumVal = activeFinesList.reduce((sum, current) => sum + (current.fine_amount || 0), 0);

  // 6. Pagination Slice Calculations
  const totalItemsCount = filteredFines.length;
  const totalPagesCount = Math.ceil(totalItemsCount / rowsPerPage) || 1;
  const paginatedRowsData = filteredFines.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Helper Reset Handler Node
  const handleClearFilters = () => {
    setSearchQuery("");
    setDelayIntervalFilter("");
    setCurrentPage(1);
    toast.info("All search entries and priority interval scopes flushed.");
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Structural Title Section Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Active Fine Ledger Console</h2>
          <p className="text-xs text-gray-500">
            Automated compliance engine updating at 12:00 AM nightly. Rates default to ₹10/day (Active Membership) and ₹20/day (Expired Windows).
          </p>
        </div>
      </div>

      {/* Real-time Business Analytics Banner Node */}
      <FinesNotificationBanner 
        totalCount={totalUnpaidInvoicesToday} 
        totalUnpaidAmount={aggregateAccruedSumVal} 
      />

      {/* Filter Toolbar Desk Controls Section */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative w-full md:flex-1">
          <input
            type="text"
            placeholder="Search pending invoices by member profile or title strings..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-600"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
        </div>

        <div className="flex w-full md:w-auto gap-2 items-center">
          <div className="relative flex-1 md:w-56">
            <select
              value={delayIntervalFilter}
              onChange={(e) => { setDelayIntervalFilter(e.target.value); setCurrentPage(1); }}
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 appearance-none outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100"
            >
              <option value="">All Overdue Invoices</option>
              <option value="7">⚠️ Critical (Over 1 Week Delayed)</option>
              <option value="14">🚨 Severe (Over 2 Weeks Delayed)</option>
              <option value="30">🔥 High Delinquency (Over 1 Month Delayed)</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3 pointer-events-none" />
          </div>

          {(searchQuery || delayIntervalFilter) && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 text-2xs font-extrabold border border-dashed border-gray-300 rounded-xl text-gray-500 bg-gray-50 hover:bg-gray-100 flex items-center gap-1 cursor-pointer transition-all shrink-0"
            >
              <RefreshCw className="w-3 h-3" /> Reset Desk
            </button>
          )}
        </div>
      </div>

      {/* Audit Data Table Element Grid */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-gray-400 font-semibold animate-pulse">Syncing Operational Ledger Channels...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase bg-gray-50/70">
                  <th className="py-3 px-4">Account Holder Member</th>
                  <th className="py-3 px-4">Overdue Media Asset</th>
                  <th className="py-3 px-4 text-center">Delayed Days</th>
                  <th className="py-3 px-4">Accrued Amount</th>
                  <th className="py-3 px-4 text-center">Plan Clause</th>
                  <th className="py-3 px-4 text-right">Actions Operations Desk</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-gray-100">
                {paginatedRowsData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-xs text-gray-400 font-medium">
                      Operational clear. Zero invoices currently match tracking configuration coordinates.
                    </td>
                  </tr>
                ) : (
                  paginatedRowsData.map((fine) => (
                    <tr key={fine.fine_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">{fine.memberName}</td>
                      <td className="py-3 px-4 font-medium text-gray-600">
                        📖 {fine.bookTitle}
                        <span className="block text-3xs font-mono text-gray-400">Issued: {fine.borrowedDate}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-amber-700 font-mono">
                        {fine.delayed_days} Days
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-gray-950 text-sm">
                        ₹{fine.fine_amount}.00
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-sm font-extrabold text-3xs tracking-wide uppercase ${
                          fine.membershipActive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100 animate-pulse"
                        }`}>
                          {fine.membershipActive ? "Active Plan" : "Plan Expired"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedFineForDetails(fine)}
                          className="p-1.5 text-gray-500 hover:text-slate-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all cursor-pointer inline-flex items-center"
                          title="View Ledger Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedFineForSettlement(fine)}
                          className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-3xs uppercase tracking-wide rounded-lg flex-inline items-center gap-1 shadow-xs cursor-pointer transition-colors"
                        >
                          <Landmark className="w-3 h-3 inline mr-1" /> Settle
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Command Module */}
          <div className="p-4 bg-gray-50/60 border-t border-gray-200 flex justify-between items-center text-2xs font-semibold text-gray-500">
            <span>
              Showing Page <strong className="text-gray-800">{currentPage}</strong> of <strong className="text-gray-800">{totalPagesCount}</strong> ({totalItemsCount} ledger entries)
            </span>
            <div className="flex gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={currentPage === totalPagesCount}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Embedded Render Channels for Modals */}
      <FineDetailsModal
        isOpen={!!selectedFineForDetails}
        fine={selectedFineForDetails}
        onClose={() => setSelectedFineForDetails(null)}
      />

      <SettleFinePaymentModal
        isOpen={!!selectedFineForSettlement}
        fine={selectedFineForSettlement}
        onClose={() => setSelectedFineForSettlement(null)}
        onConfirmSettlement={({ id, paidDate }) => {
          processPaymentMutation.mutate({ id, paidDate });
        }}
        onSoftDelete={(id) => {
          if (confirm("Are you sure you want to soft delete this pending invoice?")) {
            softDeleteMutation.mutate(id);
          }
        }}
      />

    </div>
  );
};