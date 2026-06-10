import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { ReturnedDetailsModal } from "../components/ReturnedDetailsModal";
import type { BookIssueRecord } from "../../../types/transactions";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/authStore";
import ConfirmationModal from "../components/ConfirmationModal";
import { Search, Calendar, RotateCcw, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

export const ReturnedBooks = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  // 🔎 Controls Parameters
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BookIssueRecord | null>(null);

  // Declare state trackers for managing the confirmation modal interface
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    variant: "info" | "warning" | "danger";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "",
    variant: "info",
    onConfirm: () => {},
  });

  const closeModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));

  // Query: Feed raw ledger (Fetches full table, filtered to "RETURNED" values below)
  const { data: rawIssues = [], isLoading } = useQuery<BookIssueRecord[]>({
    queryKey: ["circulationMasterRecordsFeed", token],
    queryFn: async () => {
      const res = await axiosClient.get("/issues");
      return res.data?.data || res.data || [];
    },
    enabled: !!token,
  });

  // Mutation: Reverse drop-off marker back to active desk tracking matrices
  const revertReturnMutation = useMutation({
    mutationFn: async (issueId: string) => {
      return await axiosClient.patch(`/issues/${issueId}`, {
        status: "BORROWED",
        returnedDate: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circulationMasterRecordsFeed"] });
      toast.success("Transaction log reset! Record moved back to Borrowing desk.");
      setIsDetailsOpen(false);
      setSelectedRecord(null);
    },
    onError: () => toast.error("Failed to alter server parameters mapping logs."),
  });

  // Mutation: Purge single historic ledger entry item permanently
  const deleteSingleMutation = useMutation({
    mutationFn: async (issueId: string) => {
      return await axiosClient.delete(`/issues/${issueId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circulationMasterRecordsFeed"] });
      toast.success("Log item purged permanently.");
      setIsDetailsOpen(false);
      setSelectedRecord(null);
    },
    onError: () => toast.error("Database constraint rejected execution pipeline."),
  });

  // Mutation: Purge ALL historical return items sequentially
  const clearAllHistoryMutation = useMutation({
    mutationFn: async () => {
      return await axiosClient.delete("/issues/clear-returned-history");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circulationMasterRecordsFeed"] });
      toast.success("Historical completions logs cleared completely!");
    },
    onError: () => toast.error("Failed to run full table ledger maintenance routine."),
  });

  // Reset Control Interfacing Actions
  const handleClearFilters = () => {
    setSearchQuery("");
    setDateFilter("");
    setCurrentPage(1);
  };

  // ⚙️ Filtering Engine: Limits stream to static "RETURNED" entries matching filter strings
  const auditedRecords = useMemo(() => {
    return rawIssues
      .filter((rec) => rec.status === "RETURNED" || rec.returnedDate !== null)
      .filter((rec) => {
        const term = searchQuery.toLowerCase();
        const nameMatch = rec.memberName?.toLowerCase().includes(term) || false;
        const titleMatch = rec.bookTitle?.toLowerCase().includes(term) || false;
        const authorMatch = rec.bookAuthor?.toLowerCase().includes(term) || false;
        const textCompliance = nameMatch || titleMatch || authorMatch;

        // Calendar Match Checking
        const matchesDate = dateFilter === "" || (rec.returnedDate && rec.returnedDate.includes(dateFilter));

        return textCompliance && matchesDate;
      })
      .sort((a, b) => new Date(b.returnedDate || 0).getTime() - new Date(a.returnedDate || 0).getTime());
  }, [rawIssues, searchQuery, dateFilter]);

  // Client-Side Chunking 
  const totalRecordsCount = auditedRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecordsCount / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRecords = useMemo(() => {
    return auditedRecords.slice(
      (safeCurrentPage - 1) * rowsPerPage,
      safeCurrentPage * rowsPerPage
    );
  }, [auditedRecords, safeCurrentPage, rowsPerPage]);

  // Refactored interactive triggers to dynamically feed parameters directly to the modal
  const handleUndoReturn = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: "Revert Transaction Status",
      description: "Are you sure you want to revert this book back to out-of-building status? This will reduce available warehouse inventory allocations and add it back to the borrower's active counts.",
      confirmText: "Restore Log",
      variant: "warning",
      onConfirm: () => {
        revertReturnMutation.mutate(id, { onSuccess: closeModal });
      },
    });
  };

  const handleDeleteSingle = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: "Delete Checkout Log Entries",
      description: "Are you sure you want to permanently delete this checkout log configuration? This structural history profile cannot be recovered afterwards.",
      confirmText: "Delete Record",
      variant: "danger",
      onConfirm: () => {
        deleteSingleMutation.mutate(id, { onSuccess: closeModal });
      },
    });
  };

  const handleClearAllHistory = () => {
    setModalConfig({
      isOpen: true,
      title: "⚠️ Clear Entire Historical Logs Ledger",
      description: "DANGER CONTROL: Are you completely sure you want to drop ALL returned history rows? This structural matrix action is immediate and completely purges all historical circulation files permanently.",
      confirmText: "Wipe All Records",
      variant: "danger",
      onConfirm: () => {
        clearAllHistoryMutation.mutate(undefined, { onSuccess: closeModal });
      },
    });
  };

  // Determine if any mutations are actively loading to show spinner feedback
  const isActionLoading = 
    revertReturnMutation.isPending || 
    deleteSingleMutation.isPending || 
    clearAllHistoryMutation.isPending;

  return (
    <div className="flex flex-col min-h-screen max-w-6xl relative animate-fade-in pb-12 space-y-6">
      
      {/* Control Layout Top-deck */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-light/10 shadow-xs shrink-0">
        <div>
          <h2 className="text-base font-black text-slate-secondary uppercase tracking-wider">Returns Audit History Logs</h2>
          <p className="text-xs text-slate-light font-medium mt-0.5">Review completed book returns, manage archiving, and track overdue fine status ledgers.</p>
        </div>
        {totalRecordsCount > 0 && (
          <button
            onClick={handleClearAllHistory}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Trash2 size={13} /> Clear Complete Log History
          </button>
        )}
      </div>

      {/* Interactive Operational Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-light/10 shadow-xs shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-light" size={16} />
          <input
            type="text"
            placeholder="Query history by book, author, or borrower name..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-canvas-dominant border border-slate-light/10 rounded-xl text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-sage-primary/10 focus:border-sage-primary outline-hidden transition-all"
          />
        </div>
        <div className="flex gap-2 min-w-xs">
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-2.5 text-slate-light pointer-events-none" size={15} />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-canvas-dominant border border-slate-light/10 rounded-xl text-sm font-semibold text-slate-secondary focus:bg-white focus:ring-4 focus:ring-sage-primary/10 focus:border-sage-primary outline-hidden transition-all cursor-pointer"
            />
          </div>
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            <RotateCcw size={13} /> Clear
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-xs text-slate-light font-bold animate-pulse flex-1">
          Accessing historical records archives...
        </div>
      ) : (
        <div className="flex flex-col flex-1 space-y-6">
          
          {/* INLINE NATURAL LAYOUT TABLE CONTAINER */}
          <div className="bg-white rounded-2xl border border-slate-light/10 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-light/10 text-[10px] font-bold text-slate-light uppercase bg-canvas-dominant tracking-wider">
                    <th className="py-4 px-5">Issued Book Title</th>
                    <th className="py-4 px-5">Borrower Name</th>
                    <th className="py-4 px-5">Issued On</th>
                    <th className="py-4 px-5">Target Due</th>
                    <th className="py-4 px-5">Returned On</th>
                    <th className="py-4 px-5 text-center">Fines Ledger</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-light/5 text-slate-secondary font-medium">
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-slate-light">
                        No historical book returns matching the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((record) => {
                      const isOverdueDrop = record.returnedDate && record.dueDate && record.returnedDate > record.dueDate;

                      return (
                        <tr
                          key={record.id}
                          onClick={() => { setSelectedRecord(record); setIsDetailsOpen(true); }}
                          className="hover:bg-canvas-dominant/60 transition-colors cursor-pointer group select-none"
                        >
                          <td className="py-4 px-5 font-bold text-slate-secondary">
                            <div>{record.bookTitle}</div>
                            <span className="text-[10px] font-medium text-slate-light tracking-tight font-sans block mt-0.5">By {record.bookAuthor}</span>
                          </td>
                          <td className="py-4 px-5 font-bold text-slate-secondary">{record.memberName}</td>
                          <td className="py-4 px-5 text-xs font-data text-slate-light">{record.borrowedDate}</td>
                          <td className="py-4 px-5 text-xs font-data text-slate-light">{record.dueDate}</td>
                          <td className="py-4 px-5 text-xs font-data font-bold text-emerald-600 bg-emerald-50/10">{record.returnedDate}</td>
                          <td className="py-4 px-5 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase border ${
                              isOverdueDrop 
                                ? "bg-amber-50 text-amber-700 border-amber-100/40" 
                                : "bg-slate-50 text-slate-400 border-slate-100"
                            }`}>
                              {isOverdueDrop ? "⚠️ Fine Accrued" : "✓ Settled"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* NATURAL FLOW INLINE PAGINATION BAR */}
          <div className="px-5 py-4 border border-slate-light/10 rounded-2xl bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs transition-all">
            <div className="text-xs text-slate-light font-medium">
              Showing page <span className="font-bold text-slate-secondary">{safeCurrentPage}</span> of <span className="font-bold text-slate-secondary">{totalPages}</span> (<span className="font-bold text-slate-secondary">{totalRecordsCount}</span> archives logged)
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 border border-slate-light/10 rounded-xl bg-white text-slate-secondary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-canvas-dominant cursor-pointer transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    safeCurrentPage === pageNum
                      ? "bg-sage-primary text-white shadow-xs"
                      : "bg-white border border-slate-light/10 text-slate-secondary hover:bg-canvas-dominant"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-2 border border-slate-light/10 rounded-xl bg-white text-slate-secondary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-canvas-dominant cursor-pointer transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* History Details Lookup Modal */}
      <ReturnedDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        record={selectedRecord}
        onUndoReturn={(id) => handleUndoReturn(id)}
        onDeletePermanent={(id) => handleDeleteSingle(id)}
      />

      {/* Unified Confirmation Modal Layer */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        description={modalConfig.description}
        confirmText={modalConfig.confirmText}
        variant={modalConfig.variant}
        isLoading={isActionLoading}
      />
    </div>
  );
};