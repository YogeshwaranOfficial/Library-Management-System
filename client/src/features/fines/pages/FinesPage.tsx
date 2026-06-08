import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import type { FineRecord } from "../../../types/fines";
import { toast } from "sonner";

// Component Modules
import { FinesNotificationBanner } from "../components/FinesNotificationBanner";
import { FineDetailsModal } from "../components/FineDetailsModal";
import { SettleFinePaymentModal } from "../components/SettleFinePaymentModal";
import { RestoreFineModal } from "../components/RestoreFineModal";

// Lucide Icons
import { Search, Filter, ChevronLeft, ChevronRight, ShieldAlert, History } from "lucide-react";

interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const FinesPage = () => {
  
  const queryClient = useQueryClient();
  const [selectedFine, setSelectedFine] = useState<FineRecord | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  // Active View Tab Panel Layout Selector ("active" | "history")
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  // Search & Metric Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [delayIntervalFilter, setDelayIntervalFilter] = useState(""); // "", "7", "14", "30"

  // Pagination Controls State
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Modals Core Management States
  const [selectedFineForSettlement, setSelectedFineForSettlement] = useState<FineRecord | null>(null);

  // 1. Fetch Data Stream conditionally depending on active tab view layouts
  const { data: finesFeedPayload = [], isLoading } = useQuery<FineRecord[]>({
    queryKey: ["finesMasterLedgerFeed", activeTab],
    queryFn: async () => {
      const endpoint = activeTab === "active" ? "/fines/pending" : "/fines/collected";
      const response = await axiosClient.get(endpoint);
      return response.data?.data || response.data || [];
    }
  });
  

  const restoreFineMutation = useMutation({
    mutationFn: async (id: string) => await axiosClient.patch(`/fines/restore/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finesMasterLedgerFeed"] });
      setShowRestoreModal(false);
      setSelectedFine(null);
      toast.success("Entry restored to active ledger.");
    }
  });

  // 2. Process payment settlement transaction payload map
  const processPaymentMutation = useMutation({
    mutationFn: async ({ id, paidDate, paymentMethod }: { id: string; paidDate: string; paymentMethod: "CASH" | "CARD" | "UPI" }) => {
      return await axiosClient.patch("/fines/pay", {
        fine_id: id, // 🟢 FIXED: Changed from fineId to fine_id to pass your backend validation schema cleanly!
        paidDate: paidDate,
        paymentMethod: paymentMethod
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finesMasterLedgerFeed"] });
      setSelectedFineForSettlement(null);
      toast.success("💸 Invoice Ledger Balanced Successfully!", {
        description: "Transaction finalized. This record has moved safely to Collected History.",
        duration: 4000
      });
    },
    onError: (err: AxiosErrorResponse) => {
      toast.error(err?.response?.data?.message || "Execution engine rejected settlement input parameters.");
    }
  });

  // 3. Invoice Target Hard/Soft Delete Mutation Node (Triggered when adjusting ledger states manually)
  const purgeFineMutation = useMutation({
    mutationFn: async (id: string) => {
      return await axiosClient.delete(`/fines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finesMasterLedgerFeed"] });
      setSelectedFine(null); // Close the detail modal
      toast.info("Invoice purged from ledger.");
    }
  });

  // 4. Multi-tier filtering context pipeline logic
  const filteredFines = finesFeedPayload.filter((fine) => {
    const term = searchQuery.toLowerCase().trim();
    const nameMatch = (fine?.memberName || "").toLowerCase().includes(term);
    const titleMatch = (fine?.bookTitle || "").toLowerCase().includes(term);
    const passesSearch = term === "" || nameMatch || titleMatch;

    let passesDelayRange = true;
    if (activeTab === "active" && delayIntervalFilter) {
      if (delayIntervalFilter === "7") passesDelayRange = fine.delayed_days > 7;
      if (delayIntervalFilter === "14") passesDelayRange = fine.delayed_days > 14;
      if (delayIntervalFilter === "30") passesDelayRange = fine.delayed_days > 30;
    }

    return passesSearch && passesDelayRange;
  });

  // 5. Aggregate metrics computation logic blocks
  const totalUnpaidInvoicesCount = activeTab === "active" ? finesFeedPayload.length : 0;
  const aggregateAccruedSumVal = filteredFines.reduce((sum, current) => sum + (current.fine_amount || 0), 0);

  // 6. Inline dynamic pagination offsets
  const totalItemsCount = filteredFines.length;
  const totalPagesCount = Math.ceil(totalItemsCount / rowsPerPage) || 1;
  const paginatedRowsData = filteredFines.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleTabChange = (tab: "active" | "history") => {
    setActiveTab(tab);
    setSearchQuery("");
    setDelayIntervalFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Dynamic Header View Deck */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Institutional Fine Management Desk</h2>
          <p className="text-xs text-gray-500">
            Realtime data syncing. Automatic accrual rates apply dynamically at 12:00 AM nightly: Active Plans (₹10/day) | Expired Plans (₹20/day).
          </p>
        </div>

        {/* Tab Selection Pill Elements */}
        <div className="flex bg-gray-100 p-1 rounded-xl self-stretch sm:self-auto">
          <button
            onClick={() => handleTabChange("active")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "active" ? "bg-white text-teal-700 shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Active Defaulters
          </button>
          <button
            onClick={() => handleTabChange("history")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "history" ? "bg-white text-teal-700 shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <History className="w-3.5 h-3.5" /> Collected History
          </button>
        </div>
      </div>

      {/* Render Real-time Dashboard Summary Metrics when reading Active Invoices view state */}
      {activeTab === "active" && (
        <FinesNotificationBanner 
          totalCount={totalUnpaidInvoicesCount} 
          totalUnpaidAmount={aggregateAccruedSumVal} 
        />
      )}

      {/* Audit Metric Aggregates for Payment History Views */}
      {activeTab === "history" && (
        <div className="bg-emerald-600 p-4 rounded-xl text-white flex justify-between items-center shadow-md">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest opacity-75">Total Audited Balance Collected</div>
            <div className="text-2xl font-black font-mono mt-0.5">₹{aggregateAccruedSumVal}.00</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold bg-emerald-500/50 px-2.5 py-1 rounded-md border border-emerald-400/30">
              {totalItemsCount} Settled Invoices In Archive Ledger
            </span>
          </div>
        </div>
      )}

      {/* Search Filter Control Grid */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative w-full md:flex-1">
          <input
            type="text"
            placeholder={activeTab === "active" ? "Search active balances by name or title strings..." : "Search historical collections..."}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-600"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
        </div>

        {activeTab === "active" && (
          <div className="w-full md:w-56 relative">
            <select
              value={delayIntervalFilter}
              onChange={(e) => { setDelayIntervalFilter(e.target.value); setCurrentPage(1); }}
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 appearance-none outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100"
            >
              <option value="">All Overdue Invoices</option>
              <option value="7">⚠️ Critical (&gt; 7 Days)</option>
              <option value="14">🚨 Severe (&gt; 14 Days)</option>
              <option value="30">🔥 High Delinquency (&gt; 30 Days)</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Central Interactive Data Core Grid Matrix */}
      {isLoading ? (
  <div className="text-center py-20 text-xs text-gray-400 font-semibold animate-pulse">Syncing Master Banking Ledger Channels...</div>
) : (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase bg-gray-50/70">
            <th className="py-3 px-4">Account Holder Member</th>
            <th className="py-3 px-4">Media Asset Context</th>
            <th className="py-3 px-4 text-center">{activeTab === "active" ? "Delayed Days" : "Settled Scope"}</th>
            <th className="py-3 px-4">Accrued Amount</th>
            <th className="py-3 px-4 text-center">Plan Clause</th>
            {/* 🟢 Column removed for cleaner layout */}
          </tr>
        </thead>
        <tbody className="text-xs divide-y divide-gray-100">
          {paginatedRowsData.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-12 text-xs text-gray-400 font-medium">
                Operational Clear View. Zero matching layout targets found.
              </td>
            </tr>
          ) : (
            paginatedRowsData.map((fine) => (
              <tr 
                key={fine.fine_id} 
                onClick={() => setSelectedFine(fine)}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <td className="py-3 px-4">
                  <div className="font-bold text-gray-900">{fine.memberName}</div>
                  <div className="text-[10px] font-mono text-gray-400">{fine.memberEmail}</div>
                </td>
                <td className="py-3 px-4 font-medium text-gray-600">
                  📖 {fine.bookTitle}
                  <span className="block text-3xs font-mono text-gray-400">Due Date: {fine.actualReturnDueDate || fine.actualReturnDate || "N/A"}</span>
                </td>
                <td className="py-3 px-4 text-center font-bold font-mono">
                  {activeTab === "active" ? (
                    <span className="text-amber-700">{fine.delayed_days} Days Overdue</span>
                  ) : (
                    <span className="text-emerald-700 text-3xs font-bold bg-emerald-50 px-2 py-0.5 rounded-sm uppercase tracking-wide">Paid ({fine.paidDate || fine.paid_date || "Settled"})</span>
                  )}
                </td>
                <td className="py-3 px-4 font-mono font-black text-gray-950 text-sm">
                  ₹{fine.fine_amount}.00
                  {fine.paymentMethod && <span className="block text-3xs text-gray-400 uppercase font-sans font-medium">via {fine.paymentMethod}</span>}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-0.5 rounded-sm font-extrabold text-3xs tracking-wide uppercase ${
                    fine.membershipActive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                  }`}>
                    {fine.membershipActive ? "Active Plan" : "Plan Expired"}
                  </span>
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
              Showing Page {currentPage} of {totalPagesCount} ( Total {totalItemsCount} Fines)
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

      {/* Modals Rendering Layer Ports */}
     {/* Modals */}
    {/* Active View Logic */}
{activeTab === "active" && (
  <FineDetailsModal
    isOpen={!!selectedFine}
    fine={selectedFine}
    onClose={() => setSelectedFine(null)}
    onSettle={(fine) => { setSelectedFine(null); setSelectedFineForSettlement(fine); }}
    onDelete={(id) => { 
        purgeFineMutation.mutate(id)
    }}
  />
)}

{/* History View Logic */}
{/* History View Logic - Fixed Modal Implementation */}
{activeTab === "history" && selectedFine && (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
    <div className="bg-white p-6 rounded-2xl w-96 shadow-2xl border border-gray-100 animate-zoom-in">
      <h3 className="font-bold text-gray-900">Settled Record: {selectedFine.memberName}</h3>
      <p className="text-xs text-gray-500 mt-2 mb-6 leading-relaxed">
        This invoice was paid on <span className="font-bold">{selectedFine.paidDate || selectedFine.paid_date}</span>. 
        If this was marked as paid by accident, you can restore it to the active ledger to recalculate fines.
      </p>
      <div className="flex gap-2">
        <button 
          onClick={() => setSelectedFine(null)} 
          className="flex-1 py-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer"
        >
          Close
        </button>
        <button 
          onClick={() => {
            // Note: We keep the fine selected so RestoreFineModal can access it
            setShowRestoreModal(true);
          }} 
          className="flex-1 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm transition-all cursor-pointer"
        >
          Restore Entry
        </button>
      </div>
    </div>
  </div>
)}

{/* Restore and Settle Modals */}
<RestoreFineModal 
  isOpen={showRestoreModal}
  fine={selectedFine}
  onClose={() => setShowRestoreModal(false)}
  onConfirm={(id) => restoreFineMutation.mutate(id)}
/>




      <SettleFinePaymentModal
        isOpen={!!selectedFineForSettlement}
        fine={selectedFineForSettlement}
        onClose={() => setSelectedFineForSettlement(null)}
        onConfirmSettlement={(payload: { id: string; paidDate: string; paymentMethod?: string }) => {
          // Fallback parsing pattern to respect our refined validation structure
          const resolvedMethod = (payload.paymentMethod === "CARD" || payload.paymentMethod === "UPI") 
            ? payload.paymentMethod 
            : "CASH";

          processPaymentMutation.mutate({ 
            id: payload.id, 
            paidDate: payload.paidDate, 
            paymentMethod: resolvedMethod
          });
        }}
     
      />

    </div>
  );
};