import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { ReturnedDetailsModal } from "../components/ReturnedDetailsModal";
import type { BookIssueRecord } from "../../../types/transactions";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/authStore";
import ConfirmationModal from "../components/ConfirmationModal";

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

  // 1. Declare state trackers for managing the confirmation modal interface
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

  // 2. Refactored interactive triggers to dynamically feed parameters directly to the modal
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
    <div className="space-y-6 animate-fade-in">
      
      {/* Control Layout Top-deck */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Returns Audit History Logs</h2>
          <p className="text-xs text-gray-500 mt-0.5">Review completed book returns, manage archiving, and track overdue fine status ledgers.</p>
        </div>
        {totalRecordsCount > 0 && (
          <button
            onClick={handleClearAllHistory}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            🚨 Wipe Entire Completed Log History
          </button>
        )}
      </div>

      {/* Interactive Operational Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <input
          type="text"
          placeholder="🔎 Query history by book, author, or borrower name..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-slate-100 focus:border-slate-600"
        />
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-slate-100 focus:border-slate-600 cursor-pointer text-gray-600"
          />
          <button
            onClick={handleClearFilters}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-xs text-gray-400 font-semibold animate-pulse">
          Accessing historical records archives...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-bold text-gray-400 uppercase bg-gray-50/60 tracking-wider">
                    <th className="py-4 px-5">Issued Book Title</th>
                    <th className="py-4 px-5">Borrower Name</th>
                    <th className="py-4 px-5">Issued On</th>
                    <th className="py-4 px-5">Target Due</th>
                    <th className="py-4 px-5">Returned On</th>
                    <th className="py-4 px-5 text-center">Fines Ledger</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-gray-400 font-medium">
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
                          className="hover:bg-slate-50 transition-colors cursor-pointer group select-none animate-fade-in"
                        >
                          <td className="py-4 px-5 font-bold text-gray-900 group-hover:text-slate-900">
                            <div>{record.bookTitle}</div>
                            <span className="text-3xs font-medium text-gray-400 tracking-tight font-sans block">By {record.bookAuthor}</span>
                          </td>
                          <td className="py-4 px-5 font-medium text-gray-700">{record.memberName}</td>
                          <td className="py-4 px-5 text-xs font-mono text-gray-400">{record.borrowedDate}</td>
                          <td className="py-4 px-5 text-xs font-mono text-gray-400">{record.dueDate}</td>
                          <td className="py-4 px-5 text-xs font-mono font-bold text-emerald-600 bg-emerald-50/20">{record.returnedDate}</td>
                          <td className="py-4 px-5 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-3xs font-extrabold tracking-wider uppercase border ${
                              isOverdueDrop 
                                ? "bg-amber-50 text-amber-700 border-amber-100" 
                                : "bg-slate-50 text-slate-500 border-slate-100"
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

          {/* Pagination Controls Block */}
          <div className="flex justify-between items-center bg-white px-5 py-4 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-xs font-medium text-gray-500">
              Showing page <b>{safeCurrentPage}</b> of <b>{totalPages}</b> ({totalRecordsCount} Archives)
            </span>
            <div className="flex gap-2">
              <button
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg shadow-3xs text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                ◀ Previous
              </button>
              <button
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg shadow-3xs text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next ▶
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

      {/* Render the unified confirmation modal element */}
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