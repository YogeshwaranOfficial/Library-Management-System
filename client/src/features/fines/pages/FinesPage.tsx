import { useState, useEffect, useRef } from "react"; 
import { useLocation, useNavigate } from "react-router-dom"; 
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
  ShieldAlert,
  ChevronDown,
  History,
  BookOpen,
  RefreshCw,
  RotateCcw,
  User,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const FinePage = () => {
  const queryClient = useQueryClient();
  const location = useLocation(); 
  const navigate = useNavigate(); 

  const [selectedFine, setSelectedFine] = useState<FineRecord | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false); 
  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<"delay" | null>(null);

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

  // Ref tracking node for catching outside clicks on table header elements
  const delayDropdownRef = useRef<HTMLDivElement>(null);

  // Global Outside Dropdown Click Catcher Hook
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        activeHeaderDropdown === "delay" &&
        delayDropdownRef.current &&
        !delayDropdownRef.current.contains(event.target as Node)
      ) {
        setActiveHeaderDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [activeHeaderDropdown]);

  // 🟢 NEW MUTATION NODE: Forces dynamic backend recalculation on mount
  const syncLedgerMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosClient.patch("/fines/recalculate-ledger");
      return response.data;
    },
    onSuccess: (res) => {
      console.log(`[Sync Engine] ${res.message || "Metrics synchronized successfully."}`, res.data);
      queryClient.invalidateQueries({ queryKey: ["finesMasterLedgerFeed"] });
    },
    onError: () => {
      toast.error("Fine sync ledger recalculation engine structural warning.");
    }
  });

  // 🟢 MOUNT LIFECYCLE ENGINE: Triggers every single time a clerk opens or views this page
  useEffect(() => {
    console.log("⚡ Fines Management Desk Mounted. Dispatching master calculation tool...");
    syncLedgerMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // 1. Fetch Data Stream conditionally depending on active tab view layouts
  const { data: finesFeedPayload = [], isLoading: isQueryLoading } = useQuery<FineRecord[]>({
    queryKey: ["finesMasterLedgerFeed", activeTab],
    queryFn: async () => {
      const endpoint = activeTab === "active" ? "/fines/pending" : "/fines/collected";
      const response = await axiosClient.get(endpoint);
      return response.data?.data || response.data || [];
    },
  });

  // 🟢 COMBINED LOADING EVALUATION: Keeps the pulse screen running until the sync finishes
  const isLoading = isQueryLoading || syncLedgerMutation.isPending;

  // Intercept incoming routing state redirect signatures safely
  useEffect(() => {
    const routeState = location.state as { autoOpenIssueId?: string; autoOpenSettlement?: boolean } | null;

    if (routeState) {
      console.log("======== [DEBUG RECEIVER] ROUTE STATE DETECTED ========");
      console.log("Received routeState:", routeState);
    }

    if (routeState?.autoOpenIssueId && finesFeedPayload.length > 0) {
      const incomingId = routeState.autoOpenIssueId;

      const matchingFine = finesFeedPayload.find((fine) => {
        if (!fine) return false;
        return (
          fine.issue_id === incomingId ||
          fine.fine_id === incomingId 
        );
      });

      if (matchingFine) {
        console.log("✅ SUCCESS: Found a matching fine record object!", matchingFine);
        
        const timeoutId = setTimeout(() => {
          if (routeState.autoOpenSettlement) {
            setSelectedFineForSettlement(matchingFine);
            setActiveTab("active");
          } else {
            setSelectedFine(matchingFine);
            setActiveTab("active");
          }

          navigate(location.pathname, { replace: true, state: null });
        }, 0);

        return () => clearTimeout(timeoutId);
      } else {
        console.error(
          `❌ MATCH FAIL: Checked all ${finesFeedPayload.length} ledger entries but found no matching ID for "${incomingId}".`
        );
      }
    }
  }, [location.state, finesFeedPayload, navigate, location.pathname]); 

  const restoreFineMutation = useMutation({
    mutationFn: async (id: string) => await axiosClient.patch(`/fines/restore/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finesMasterLedgerFeed"] });
      setShowRestoreModal(false);
      setSelectedFine(null);

      toast.success("Entry restored to active ledger!", {
        description:
          "💡 ACTION REQUIRED: Remember to go to the 'Returned Books' page to mark this volume as unreturned if needed.",
        duration: 6000,
      });
    },
  });

  // 2. Process payment settlement transaction payload map
  const processPaymentMutation = useMutation({
    mutationFn: async ({
      id,
      paidDate,
      paymentMethod,
    }: {
      id: string;
      paidDate: string;
      paymentMethod: "CASH" | "CARD" | "UPI";
    }) => {
      return await axiosClient.patch("/fines/pay", {
        fine_id: id,
        paidDate: paidDate,
        paymentMethod: paymentMethod,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finesMasterLedgerFeed"] });
      setSelectedFineForSettlement(null);
      toast.success("💸 Invoice Ledger Balanced Successfully!", {
        description: "Transaction finalized. This record has moved safely to Collected History.",
        duration: 4000,
      });
    },
    onError: (err: AxiosErrorResponse) => {
      toast.error(
        err?.response?.data?.message || "Execution engine rejected settlement input parameters."
      );
    },
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
    },
  });

  const filteredFines = finesFeedPayload.filter((fine) => {
    if (!fine) return false;

    const term = searchQuery.toLowerCase().trim();
    
    const nameMatch = String(fine.memberName || "").toLowerCase().includes(term);
    const titleMatch = String(fine.bookTitle || "").toLowerCase().includes(term);
    const passesSearch = term === "" || nameMatch || titleMatch;

    let passesDelayRange = true;
    if (activeTab === "active" && delayIntervalFilter && typeof fine.delayed_days === 'number') {
      const days = fine.delayed_days;
      if (delayIntervalFilter === "7") passesDelayRange = days > 7;
      if (delayIntervalFilter === "14") passesDelayRange = days > 14;
      if (delayIntervalFilter === "30") passesDelayRange = days > 30;
    }

    return passesSearch && passesDelayRange;
  });

  // 5. Aggregate metrics computation logic blocks
  const totalUnpaidInvoicesCount = activeTab === "active" ? finesFeedPayload.length : 0;
  const aggregateAccruedSumVal = filteredFines.reduce(
    (sum, current) => sum + (current.fine_amount || 0),
    0
  );

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

  const handleClearFilters = () => {
    setSearchQuery("");
    setDelayIntervalFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-white text-[#2D3748] antialiased pb-16 pt-10 px-8 lg:px-14 font-sans select-none">
      {/* Dynamic Header View Deck */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-1.5">
            Fines Management Desk
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1A365D]">Fines Management Desk</h2>
          <p className="text-sm text-[#718096] mt-1">
            Active Plans (₹10/day) | Expired Plans (₹20/day).
          </p>
        </div>

        {/* Tab Selection Pill Elements */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-stretch sm:self-auto border border-border-main">
          <button
            type="button"
            onClick={() => handleTabChange("active")}
            className={`flex items-center gap-1.5 px-3.5 py-4 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === "active" ? "bg-white shadow-xs text-[#1A365D]" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldAlert size={14} /> Active Fines
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("history")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-white shadow-xs text-[#1A365D]"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <History size={14} /> Collected Fines
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
        <div className="bg-emerald-600 p-5 rounded-2xl text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
          <div>
            <div className="text-[11px] uppercase font-bold tracking-widest text-emerald-100">
              Total Audited Balance Collected
            </div>
            <div className="text-2xl font-bold mt-0.5">₹{aggregateAccruedSumVal}.00</div>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-500/40 px-3.5 py-1.5 rounded-xl border border-emerald-400/20 inline-flex items-center gap-1.5">
              <CheckCircle2 size={12} /> {totalItemsCount} Settled Invoices In Archive Ledger
            </span>
          </div>
        </div>
      )}

      {/* Search Filter Control Grid */}
      <div className="flex items-center justify-between gap-4 mb-4 mt-4 h-9">
        <div></div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-sm focus-within:border-gray-300 focus-within:bg-white transition-all w-56">
            <span className="text-gray-400 mr-2 shrink-0">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder={
                activeTab === "active"
                  ? "Search by book or member..."
                  : "Search historical collections..."
              }
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-0 outline-hidden w-full text-xs font-medium text-[#1A365D] placeholder-[#A0AEC0] p-0 focus:ring-0 focus:outline-hidden"
            />
          </div>

          <div className="w-px h-4 bg-gray-200" />
          <button
            type="button"
            onClick={handleClearFilters}
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="Reset Filters"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Central Interactive Data Core Grid Matrix */}
      {isLoading ? (
        <div className="text-center py-20 text-xs sm:text-sm text-slate-400 font-semibold animate-pulse flex flex-col items-center justify-center gap-2">
          <RefreshCw size={20} className="animate-spin text-slate-300" />
          Syncing Master Banking Ledger Channels...
        </div>
      ) : (
        <div className="w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] font-bold text-[#718096] uppercase tracking-widest bg-transparent">
                  <th className="py-3 px-4 w-[25%]">
                    <User size={12} className="inline mr-1" />
                    Member info
                  </th>
                  <th className="py-3 px-4 w-[30%]">
                    <BookOpen size={12} className="inline mr-1" />
                    Media Asset Context
                  </th>
                  <th className="py-3 px-4 text-center relative w-[18%]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveHeaderDropdown(
                          activeHeaderDropdown === "delay" ? null : "delay"
                        );
                      }}
                      className={`inline-flex items-center justify-center gap-1 transition-colors uppercase tracking-widest text-[11px] font-bold hover:text-[#1A365D] ${
                        delayIntervalFilter ? "text-[#2B6CB0]" : "text-[#718096]"
                      }`}
                    >
                      Delayed Days
                      {delayIntervalFilter ? ` (${delayIntervalFilter}+)` : ""}
                      <ChevronDown
                        size={11}
                        className={`transition-transform duration-200 ${
                          activeHeaderDropdown === "delay" ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {activeHeaderDropdown === "delay" && (
                      <div
                        ref={delayDropdownRef}
                        className="absolute left-1/2 -translate-x-1/2 top-7 z-50 w-52 bg-white border border-gray-200 rounded-lg shadow-xl py-1.5 text-xs text-[#2D3748] font-medium normal-case tracking-normal text-left"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setDelayIntervalFilter("");
                            setActiveHeaderDropdown(null);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${
                            !delayIntervalFilter ? "bg-slate-50/80 text-[#2B6CB0] font-semibold" : ""
                          }`}
                        >
                          All Delays
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDelayIntervalFilter("7");
                            setActiveHeaderDropdown(null);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${
                            delayIntervalFilter === "7" ? "bg-slate-50/80 text-[#2B6CB0] font-semibold" : ""
                          }`}
                        >
                          Critical (&gt; 7 Days)
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDelayIntervalFilter("14");
                            setActiveHeaderDropdown(null);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${
                            delayIntervalFilter === "14" ? "bg-slate-50/80 text-[#2B6CB0] font-semibold" : ""
                          }`}
                        >
                          Severe (&gt; 14 Days)
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDelayIntervalFilter("30");
                            setActiveHeaderDropdown(null);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${
                            delayIntervalFilter === "30" ? "bg-slate-50/80 text-[#2B6CB0] font-semibold" : ""
                          }`}
                        >
                          High Delinquency (&gt; 30 Days)
                        </button>
                      </div>
                    )}
                  </th>
                  <th className="py-3 px-4 text-center w-[12%]">Fine Amount</th>
                  <th className="py-3 px-4 text-center w-[15%]">Plan Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100 font-medium text-[#2D3748]">
                {paginatedRowsData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-slate-400 font-medium">
                      Operational Clear View. Zero matching layout targets found.
                    </td>
                  </tr>
                ) : (
                  paginatedRowsData.map((fine) => (
                    <tr
                      key={fine.fine_id}
                      onClick={() => {
                        setSelectedFine(fine);
                        if (activeTab === "history") {
                          setShowRestoreModal(true); 
                        }
                      }}
                      className="transition-all duration-150 cursor-pointer border-l-4 border-l-transparent hover:bg-blue-50/40"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#1A365D]">{fine.memberName}</div>
                        <div className="text-xs font-mono text-slate-400 mt-0.5">
                          {fine.memberEmail}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <BookOpen size={12} className="text-slate-400 shrink-0" />
                          <span>{fine.bookTitle}</span>
                        </div>
                        <span className="block text-[11px] text-[#718096]">
                          Due Date: {fine.actualReturnDueDate || fine.actualReturnDate || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {activeTab === "active" ? (
                          <span className="text-amber-800 px-2 py-0.5 font-bold text-xs">
                            {fine.delayed_days} Days Overdue
                          </span>
                        ) : (
                          <span className="text-emerald-700 text-xs bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wide border border-emerald-100">
                            Paid ({fine.paidDate || fine.paid_date || "Settled"})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center text-text-main text-xs sm:text-sm">
                        ₹{fine.fine_amount}.00
                        {fine.paymentMethod && (
                          <span className="justify-center text-xs text-slate-400 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                            <CreditCard size={12} /> via {fine.paymentMethod}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-xs select-none">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              fine.membershipActive ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          <span
                            className={`px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase ${
                              fine.membershipActive ? "text-emerald-700" : "text-rose-700"
                            }`}
                          >
                            {fine.membershipActive ? "Active Plan" : "Plan Expired"}
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Command Module */}
          <div className="py-4 border-t border-gray-100 flex justify-between items-center text-xs text-[#718096] tracking-wide mt-2">
            <span>
              Page {currentPage} / {totalPagesCount} <span className="text-slate-300 mx-2">|</span>{" "}
              Total {totalItemsCount} Fines
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPage((p) => Math.max(p - 1, 1));
                }}
                className="text-gray-600 font-semibold tracking-wider disabled:opacity-20 cursor-pointer hover:text-[#2B6CB0] flex items-center gap-1 transition-colors"
              >
                &larr; Previous
              </button>
              <button
                type="button"
                disabled={currentPage === totalPagesCount}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPage((p) => Math.min(p + 1, totalPagesCount));
                }}
                className="text-gray-600 font-semibold tracking-wider disabled:opacity-20 cursor-pointer hover:text-[#2B6CB0] flex items-center gap-1 transition-colors"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL MOUNTING PORTALS & LAYOUTS           */}
      {/* ========================================== */}

      {/* 1. Active Tab Details Modal */}
      {activeTab === "active" && (
        <FineDetailsModal
          isOpen={!!selectedFine}
          fine={selectedFine}
          onClose={() => setSelectedFine(null)}
          onSettle={(fine) => {
            setSelectedFine(null);
            setSelectedFineForSettlement(fine);
          }}
          onDelete={(id) => {
            purgeFineMutation.mutate(id);
          }}
        />
      )}

      {/* 2. Collected History Tab Restoration Modal */}
      <RestoreFineModal
        isOpen={activeTab === "history" && showRestoreModal && !!selectedFine} 
        fine={selectedFine}
        onClose={() => {
          setSelectedFine(null);
          setShowRestoreModal(false);
        }}
        onConfirm={(id) => restoreFineMutation.mutate(id)}
      />

      {/* 3. Settlement Processing Invoice Form Portal */}
      <SettleFinePaymentModal
        isOpen={!!selectedFineForSettlement}
        fine={selectedFineForSettlement}
        onClose={() => setSelectedFineForSettlement(null)}
        onConfirmSettlement={(payload) => {
          const resolvedMethod =
            payload.paymentMethod === "CARD" || payload.paymentMethod === "UPI"
              ? payload.paymentMethod
              : "CASH";

          processPaymentMutation.mutate({
            id: payload.id,
            paidDate: payload.paidDate,
            paymentMethod: resolvedMethod,
          });
        }}
      />
    </div>
  );
};