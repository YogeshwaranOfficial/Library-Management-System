import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { ReturnedDetailsModal } from "../components/ReturnedDetailsModal";
import type { BookIssueRecord } from "../../../types/transactions";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/authStore";
import ConfirmationModal from "../components/ConfirmationModal";
import {
  Search,
  Calendar,
  RotateCcw,
  Trash2,
} from "lucide-react";

export const ReturnedBooks = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  // 🔎 Controls Parameters
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BookIssueRecord | null>(
    null,
  );

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

  const closeModal = () =>
    setModalConfig((prev) => ({ ...prev, isOpen: false }));

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
      queryClient.invalidateQueries({
        queryKey: ["circulationMasterRecordsFeed"],
      });
      toast.success(
        "Transaction log reset! Record moved back to Borrowing desk.",
      );
      setIsDetailsOpen(false);
      setSelectedRecord(null);
    },
    onError: () =>
      toast.error("Failed to alter server parameters mapping logs."),
  });

  // Mutation: Purge single historic ledger entry item permanently
  const deleteSingleMutation = useMutation({
    mutationFn: async (issueId: string) => {
      return await axiosClient.delete(`/issues/${issueId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["circulationMasterRecordsFeed"],
      });
      toast.success("Log item purged permanently.");
      setIsDetailsOpen(false);
      setSelectedRecord(null);
    },
    onError: () =>
      toast.error("Database constraint rejected execution pipeline."),
  });

  // Mutation: Purge ALL historical return items sequentially
  const clearAllHistoryMutation = useMutation({
    mutationFn: async () => {
      return await axiosClient.delete("/issues/clear-returned-history");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["circulationMasterRecordsFeed"],
      });
      toast.success("Historical completions logs cleared completely!");
    },
    onError: () =>
      toast.error("Failed to run full table ledger maintenance routine."),
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
        const authorMatch =
          rec.bookAuthor?.toLowerCase().includes(term) || false;
        const textCompliance = nameMatch || titleMatch || authorMatch;

        // Calendar Match Checking
        const matchesDate =
          dateFilter === "" ||
          (rec.returnedDate && rec.returnedDate.includes(dateFilter));

        return textCompliance && matchesDate;
      })
      .sort(
        (a, b) =>
          new Date(b.returnedDate || 0).getTime() -
          new Date(a.returnedDate || 0).getTime(),
      );
  }, [rawIssues, searchQuery, dateFilter]);

  // Client-Side Chunking
  const totalRecordsCount = auditedRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecordsCount / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRecords = useMemo(() => {
    return auditedRecords.slice(
      (safeCurrentPage - 1) * rowsPerPage,
      safeCurrentPage * rowsPerPage,
    );
  }, [auditedRecords, safeCurrentPage, rowsPerPage]);

  // Refactored interactive triggers to dynamically feed parameters directly to the modal
  const handleUndoReturn = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: "Revert Transaction Status",
      description:
        "Are you sure you want to revert this book back to out-of-building status? This will reduce available warehouse inventory allocations and add it back to the borrower's active counts.",
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
      description:
        "Are you sure you want to permanently delete this checkout log configuration? This structural history profile cannot be recovered afterwards.",
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
      description:
        "DANGER CONTROL: Are you completely sure you want to drop ALL returned history rows? This structural matrix action is immediate and completely purges all historical circulation files permanently.",
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
    <div className="flex flex-col min-h-screen w-full relative pb-16 pt-10 px-8 lg:px-14 font-sans select-none antialiased bg-white text-text-main text-left">
      
      {/* ==================== ZONE A & B: HEADER & GLOBAL CONTROLS ==================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        <div className="text-left">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-1.5">
            Returned Books Management Desk
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-main">
            Returned Books Management Desk
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1 max-w-2xl">
            Review completed book returns, manage archiving, and track overdue fine status ledgers.
          </p>
        </div>
        
        <div className="flex items-center self-start md:self-end shrink-0">
          {totalRecordsCount > 0 && (
            <button
              type="button"
              onClick={handleClearAllHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold tracking-wide rounded-full shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Trash2 size={13} /> Clear Complete Log History
            </button>
          )}
        </div>
      </div>

      <div className="h-px bg-slate-light/10 w-full mb-6" />

      {/* ==================== ZONE C: UTILITIES FILTER ROW ==================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
        <div className="text-[10px] font-bold tracking-widest text-text-main uppercase self-center">
          Circulation Archives
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 sm:w-auto w-full">
          {/* Search Bar aligned to the right side */}
          <div className="relative flex items-center bg-canvas-dominant border border-slate-light/10 rounded-full px-3 py-1 text-sm focus-within:border-sage-primary/40 focus-within:bg-white focus-within:ring-2 focus-within:ring-sage-primary/10 transition-all w-full sm:w-64">
            <Search size={13} className="text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Query history by book, author..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-0 outline-hidden w-full text-xs font-medium text-text-main placeholder-slate-400 p-0 focus:ring-0 focus:outline-hidden"
            />
          </div>

          {/* Date Picker Input */}
          <div className="relative flex items-center bg-canvas-dominant border border-slate-light/10 rounded-full px-3 py-1 focus-within:border-sage-primary/40 focus-within:bg-white transition-all w-full sm:w-40">
            <Calendar size={13} className="text-slate-400 mr-2 shrink-0" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-0 outline-hidden w-full text-xs font-bold uppercase tracking-wider text-text-main p-0 focus:ring-0 focus:outline-hidden cursor-pointer"
            />
          </div>

          {/* Reset Action Button */}
          <button
            type="button"
            onClick={handleClearFilters}
            className={`p-1.5 rounded-full transition-colors ${
              searchQuery || dateFilter ? "text-rose-600 hover:bg-rose-50" : "text-slate-400 hover:bg-canvas-dominant"
            }`}
            title="Reset Filters"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* ==================== ZONE D: GRID DISPLAY TABLE ==================== */}

<div className="w-full transition-all duration-300">
  {isLoading ? (
    <div className="py-24 text-xs font-semibold text-[#718096] tracking-widest uppercase animate-pulse">
      Accessing historical records archives...
    </div>
  ) : (
    <div className="w-full">
      <div className="w-full">
        <div className="overflow-visible w-full">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="border-b border-gray-200 text-[11px] font-bold text-[#718096] uppercase tracking-widest bg-transparent select-none">
                <th className="pb-3 pr-4 pl-3 font-bold tracking-widest">
                  Issued Book Title
                </th>
                <th className="pb-3 px-4 font-bold tracking-widest">
                  Borrower Name
                </th>
                <th className="pb-3 px-4 font-bold tracking-widest">
                  Issued On
                </th>
                <th className="pb-3 px-4 font-bold tracking-widest">
                  Target Due
                </th>
                <th className="pb-3 px-4 font-bold tracking-widest">
                  Returned On
                </th>
              </tr>
            </thead>

            <tbody className="text-sm divide-y divide-gray-100 font-medium text-[#2D3748]">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-20 text-left text-sm text-[#718096] font-medium pl-3"
                  >
                    No historical book returns matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => {
                  return (
                    <tr
                      key={record.id}
                      onClick={() => {
                        setSelectedRecord(record);
                        setIsDetailsOpen(true);
                      }}
                      className="transition-all duration-150 cursor-pointer border-l-4 border-l-transparent hover:bg-blue-50/40"
                    >
                      <td className="py-3.5 pr-4 pl-3 font-semibold text-[#1A365D]">
                        <div className="font-semibold tracking-tight text-sm text-[#1A365D]">
                          {record.bookTitle}
                        </div>
                        <span className="text-[11px] text-[#718096] font-normal mt-0.5 block">
                          By {record.bookAuthor}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-700 text-sm">
                          {record.memberName}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-700 text-sm">
                          {record.borrowedDate}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-700 text-sm">
                          {record.dueDate}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-xs text-emerald-700">
                          {record.returnedDate}
                        </span>
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
            <span>
              Page{" "}
              <span className="font-semibold text-gray-800">
                {currentPage}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-800">
                {totalPages}
              </span>
              <span className="mx-2">|</span>
              Total{" "}
              <span className="font-semibold text-gray-800">
                {totalRecordsCount}
              </span>{" "}
              Books
            </span>

            <div className="flex gap-4">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPage((p) => Math.max(1, p - 1));
                }}
                className="text-gray-600 font-semibold tracking-wider disabled:opacity-20 cursor-pointer hover:text-[#2B6CB0] flex items-center gap-1 transition-colors"
              >
                ← Previous
              </button>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                }}
                className="text-gray-600 font-semibold tracking-wider disabled:opacity-20 cursor-pointer hover:text-[#2B6CB0] flex items-center gap-1 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )}
</div>


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