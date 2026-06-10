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
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert, 
  History, 
  BookOpen, 
  AlertCircle,
  AlertTriangle 
} from "lucide-react";

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
  const [delayIntervalFilter, setDelayIntervalFilter] = useState(""); 

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
      
      toast.success("Entry restored to active ledger!", {
        description: "💡 ACTION REQUIRED: Remember to go to the 'Returned Books' page to mark this volume as unreturned if needed.",
        duration: 6000
      });
    }
  });

  // 2. Process payment settlement transaction payload map
  const processPaymentMutation = useMutation({
    mutationFn: async ({ id, paidDate, paymentMethod }: { id: string; paidDate: string; paymentMethod: "CASH" | "CARD" | "UPI" }) => {
      return await axiosClient.patch("/fines/pay", {
        fine_id: id, 
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

  // 3. Invoice Target Hard/Soft Delete Mutation Node 
  const purgeFineMutation = useMutation({
    mutationFn: async (id: string) => {
      return await axiosClient.delete(`/fines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finesMasterLedgerFeed"] });
      setSelectedFine(null); 
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
    <div className="space-y-6 animate-fade-in pb-12 text-left">
      
      {/* Dynamic Header View Deck */}
      <div className="bg-white p-6 rounded-2xl border border-slate-light/10 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xs font-black text-slate-secondary uppercase tracking-wider">Institutional Fine Management Desk</h2>
          <p className="text-xs text-slate-light mt-1 font-medium">
            Realtime data syncing. Automatic accrual rates apply dynamically at 12:00 AM nightly: Active Plans (₹10/day) | Expired Plans (₹20/day).
          </p>
        </div>

        {/* Tab Selection Pill Elements */}
        <div className="flex bg-canvas-dominant p-1 rounded-xl self-stretch sm:self-auto border border-slate-light/5">
          <button
            type="button"
            onClick={() => handleTabChange("active")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === "active" ? "bg-white text-slate-secondary shadow-xs" : "text-slate-light hover:text-slate-secondary"
            }`}
          >
            <ShieldAlert size={14} /> Active Defaulters
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("history")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === "history" ? "bg-white text-slate-secondary shadow-xs" : "text-slate-light hover:text-slate-secondary"
            }`}
          >
            <History size={14} /> Collected History
          </button>
        </div>
      </div>

      {activeTab === "active" && (
        <FinesNotificationBanner 
          totalCount={totalUnpaidInvoicesCount} 
          totalUnpaidAmount={aggregateAccruedSumVal} 
        />
      )}

      {activeTab === "history" && (
        <div className="bg-emerald-600 p-5 rounded-2xl text-white flex justify-between items-center shadow-xs">
          <div>
            <div className="text-[9px] uppercase font-black tracking-widest opacity-80">Total Audited Balance Collected</div>
            <div className="text-2xl font-black font-data mt-1">₹{aggregateAccruedSumVal}.00</div>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/40 px-3 py-1.5 rounded-lg border border-emerald-400/20">
              {totalItemsCount} Settled Invoices In Archive Ledger
            </span>
          </div>
        </div>
      )}

      {/* Search Filter Control Grid */}
      <div className="bg-white p-4 rounded-2xl border border-slate-light/10 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative w-full md:flex-1">
          <input
            type="text"
            placeholder={activeTab === "active" ? "Search active balances by name or title strings..." : "Search historical collections..."}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 bg-canvas-dominant border border-slate-light/10 rounded-xl text-xs font-medium text-slate-secondary placeholder:text-slate-light outline-hidden focus:bg-white focus:border-slate-secondary transition-all"
          />
          <Search size={14} className="text-slate-light absolute left-3.5 top-3.5" />
        </div>

        {activeTab === "active" && (
          <div className="w-full md:w-64 relative">
            <select
              value={delayIntervalFilter}
              onChange={(e) => { setDelayIntervalFilter(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-8 py-2.5 bg-canvas-dominant border border-slate-light/10 rounded-xl text-xs font-black uppercase tracking-wider text-slate-secondary appearance-none outline-hidden focus:bg-white focus:border-slate-secondary transition-all cursor-pointer"
            >
              <option value="">All Overdue Invoices</option>
              <option value="7">Critical (&gt; 7 Days)</option>
              <option value="14">Severe (&gt; 14 Days)</option>
              <option value="30">High Delinquency (&gt; 30 Days)</option>
            </select>
            <Filter size={14} className="text-slate-light absolute left-3.5 top-3.5 pointer-events-none" />
            <div className="absolute right-3.5 top-4 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-secondary w-0 h-0" />
          </div>
        )}
      </div>

      {/* Central Interactive Data Core Grid Matrix */}
      {isLoading ? (
        <div className="text-center py-24 text-xs text-slate-light font-black uppercase tracking-widest animate-pulse font-data">Syncing Master Banking Ledger Channels...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-light/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-light/10 text-[10px] font-black text-slate-light uppercase bg-canvas-dominant/60 tracking-wider">
                  <th className="py-3.5 px-5">Account Holder Member</th>
                  <th className="py-3.5 px-5">Media Asset Context</th>
                  <th className="py-3.5 px-5 text-center">{activeTab === "active" ? "Delayed Days" : "Settled Scope"}</th>
                  <th className="py-3.5 px-5">Accrued Amount</th>
                  <th className="py-3.5 px-5 text-center">Plan Clause</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-light/5 text-slate-secondary">
                {paginatedRowsData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-xs text-slate-light font-medium">
                      Operational Clear View. Zero matching layout targets found.
                    </td>
                  </tr>
                ) : (
                  paginatedRowsData.map((fine) => (
                    <tr 
                      key={fine.fine_id} 
                      onClick={() => setSelectedFine(fine)}
                      className="hover:bg-canvas-dominant/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-secondary">{fine.memberName}</div>
                        <div className="text-[10px] font-data text-slate-light mt-0.5">{fine.memberEmail}</div>
                      </td>
                      <td className="py-3.5 px-5 font-medium">
                        <div className="flex items-center gap-1.5 text-slate-secondary">
                          <BookOpen size={12} className="text-slate-light shrink-0" />
                          <span>{fine.bookTitle}</span>
                        </div>
                        <span className="block text-[10px] font-data text-slate-light pl-4.5 mt-0.5">Due Date: {fine.actualReturnDueDate || fine.actualReturnDate || "N/A"}</span>
                      </td>
                      <td className="py-3.5 px-5 text-center font-bold font-data">
                        {activeTab === "active" ? (
                          <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md font-bold text-[10px]">{fine.delayed_days} Days Overdue</span>
                        ) : (
                          <span className="text-emerald-700 text-[9px] font-black bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wide border border-emerald-100/40">Paid ({fine.paidDate || fine.paid_date || "Settled"})</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 font-data font-black text-slate-secondary text-sm">
                        ₹{fine.fine_amount}.00
                        {fine.paymentMethod && <span className="block text-[9px] text-slate-light uppercase font-sans font-black tracking-wider mt-0.5">via {fine.paymentMethod}</span>}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className={`px-2 py-0.5 rounded-md font-black text-[9px] tracking-wider uppercase border ${
                          fine.membershipActive 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/40" 
                            : "bg-rose-50 text-rose-700 border-rose-200/40"
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
          <div className="p-4 bg-canvas-dominant/50 border-t border-slate-light/10 flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-light">
            <span>
              Showing Page {currentPage} of {totalPagesCount} (Total {totalItemsCount} Fines)
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={(e) => { e.stopPropagation(); setCurrentPage((p) => p - 1); }}
                className="p-1.5 border border-slate-light/10 bg-white hover:bg-canvas-dominant text-slate-secondary rounded-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                disabled={currentPage === totalPagesCount}
                onClick={(e) => { e.stopPropagation(); setCurrentPage((p) => p + 1); }}
                className="p-1.5 border border-slate-light/10 bg-white hover:bg-canvas-dominant text-slate-secondary rounded-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* History View Logic - Updated Modal Implementation with Explicit Reminder Notice */}
      {activeTab === "history" && selectedFine && (
        <div className="fixed inset-0 bg-slate-secondary/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in text-left">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-light/10 animate-zoom-in">
            <h3 className="text-xs font-black text-slate-secondary uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle size={14} className="text-amber-600" /> Restoration Warning
            </h3>
            <p className="text-[11px] font-bold text-slate-light mt-1 mb-3 font-data uppercase tracking-wider">{selectedFine.memberName}</p>
            
            {/* ENHANCED EXPLICIT INLINE INSTRUCTION REMINDER BOX FOR LIBRARIANS */}
            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/40 text-amber-900 text-xs space-y-2 leading-relaxed">
              <p className="font-black uppercase tracking-wider text-[10px] flex items-center gap-1.5 text-amber-800">
                <AlertTriangle size={12} /> Operational Reminder
              </p>
              <p className="font-medium text-slate-secondary">
                Restoring this fine resets it to unpaid status. This balance tracker is bound to a closed book loan.
              </p>
              <p className="font-bold text-amber-950">
                Please visit the <span className="underline decoration-amber-600/60 font-black">Returned Books</span> panel afterwards to manually click "Undo Return" if the physical asset is still out of the building.
              </p>
            </div>

            <div className="flex gap-2 mt-5 pt-3 border-t border-slate-light/5">
              <button 
                type="button"
                onClick={() => setSelectedFine(null)} 
                className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider bg-canvas-dominant hover:bg-slate-light/10 text-slate-light hover:text-slate-secondary rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowRestoreModal(true);
                }} 
                className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Confirm Desk
              </button>
            </div>
          </div>
        </div>
      )}

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