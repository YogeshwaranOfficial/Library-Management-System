import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { TransactionModal } from "../components/TransactionModal";
import { IssueDetailsModal } from "../components/IssueDetailsModal";
// ✨ Updated: Import explicit structural types from your updated declarations file
import type { BookIssueRecord, ComputedIssueStatus } from "../../../types/transactions";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/authStore";
import { Search, RotateCcw, ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";

export const TransactionsPage = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  // 🔎 Search, Filtering, and Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BookIssueRecord | null>(null);

  // Fetch Master Feed Data Ledger
  const { data: rawIssues = [], isLoading } = useQuery<BookIssueRecord[]>({
    queryKey: ["circulationMasterRecordsFeed", token],
    queryFn: async () => {
      const res = await axiosClient.get("/issues");
      return res.data?.data || res.data || [];
    },
    enabled: !!token,
  });

  // Mutate: Return Closed Checkouts
  const returnBookMutation = useMutation({
    mutationFn: async (issueId: string) => {
      return await axiosClient.post("/issues/return", { issueId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circulationMasterRecordsFeed"] });
      toast.success("Book returned safely!");
      setIsDetailsOpen(false);
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || "Failed to return book.";
      toast.error(message);
    },
  });

  // Mutate: Save (Create/Update Parameter Mappings)
  const saveMutation = useMutation({
    mutationFn: async (payload: { memberId: string; bookId: string; borrowDate: string; dueDate: string }) => {
      if (selectedRecord) {
        return await axiosClient.patch(`/issues/${selectedRecord.id}`, payload);
      }
      return await axiosClient.post("/issues/borrow", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circulationMasterRecordsFeed"] });
      
      const successMessage = selectedRecord 
        ? "Book issue record updated successfully." 
        : "Book issue record created successfully.";
        
      toast.success(successMessage);
      setIsFormOpen(false);
      setSelectedRecord(null);
    },
    onError: () => toast.error("Database validation rules failed on saving."),
  });

  // ✨ Reset Filters Handler
  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  // ⚙️ Performance Boost: Memoize single-pass filtering and sorting loops
  const allFilteredRecords = useMemo(() => {
    return rawIssues
      .reduce<(BookIssueRecord & { computedStatus: ComputedIssueStatus })[]>((acc, record) => {
        const computedStatus: ComputedIssueStatus = record.status;

        if (computedStatus === "RETURNED") return acc;

        const term = searchQuery.toLowerCase();
        const nameMatch = record.memberName?.toLowerCase().includes(term) || false;
        const titleMatch = record.bookTitle?.toLowerCase().includes(term) || false;
        const matchesSearch = nameMatch || titleMatch;
        const matchesStatus = statusFilter === "" || computedStatus === statusFilter;

        if (matchesSearch && matchesStatus) {
          acc.push({ ...record, computedStatus });
        }
        return acc;
      }, [])
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [rawIssues, searchQuery, statusFilter]);

  // 🔢 Safe Client-Side Pagination Boundaries Engine
  const totalRecordsCount = allFilteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecordsCount / rowsPerPage));
  
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Slice array down to 10 rows maximum for viewport index rendering
  const paginatedRecords = useMemo(() => {
    return allFilteredRecords.slice(
      (safeCurrentPage - 1) * rowsPerPage,
      safeCurrentPage * rowsPerPage
    );
  }, [allFilteredRecords, safeCurrentPage, rowsPerPage]);

  return (
    <div className="flex flex-col min-h-screen max-w-6xl relative animate-fade-in pb-12">
      
      {/* Upper Control Bar Layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 mb-6 rounded-2xl border border-slate-light/10 shadow-xs shrink-0">
        <div>
          <h2 className="text-base font-black text-slate-secondary uppercase tracking-wider">Borrow & Return Desk</h2>
          <p className="text-xs text-slate-light font-medium mt-0.5">Manage real-time out-of-building media assets, process drop-offs, and track compliance.</p>
        </div>
        <button
          onClick={() => { setSelectedRecord(null); setIsFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-sage-primary hover:bg-sage-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
        >
          <PlusCircle size={14} /> Issue New Book
        </button>
      </div>

      {/* Filter & Search Bar Controls Section */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 mb-6 rounded-2xl border border-slate-light/10 shadow-xs shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-light" size={16} />
          <input
            type="text"
            placeholder="Query active loans by member name or book title..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-canvas-dominant border border-slate-light/10 rounded-xl text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-sage-primary/10 focus:border-sage-primary outline-hidden transition-all"
          />
        </div>
        <div className="flex gap-2 min-w-xs">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="flex-1 px-3 py-2 bg-canvas-dominant border border-slate-light/10 rounded-xl text-sm font-semibold text-slate-secondary focus:bg-white focus:ring-4 focus:ring-sage-primary/10 focus:border-sage-primary outline-hidden transition-all cursor-pointer"
          >
            <option value="">All Active Loans</option>
            <option value="BORROWED">Standard Borrows (BORROWED)</option>
            <option value="OVERDUE">Deadlines Violated (OVERDUE)</option>
          </select>

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
          Syncing active book circulation ledgers...
        </div>
      ) : (
        <div className="flex flex-col flex-1 space-y-6">
          
          {/* INLINE NATURAL LAYOUT TABLE CONTAINER */}
          <div className="bg-white rounded-2xl border border-slate-light/10 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-light/10 text-[10px] font-bold text-slate-light uppercase bg-canvas-dominant tracking-wider">
                    <th className="py-4 px-5">Member Name</th>
                    <th className="py-4 px-5">Issued Book Title</th>
                    <th className="py-4 px-5">Checkout Date</th>
                    <th className="py-4 px-5">Target Due Deadline</th>
                    <th className="py-4 px-5 text-center">Status Flag</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-light/5 text-slate-secondary font-medium">
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm text-slate-light">
                        No active out-of-building book logs registered on current indexing criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((record) => (
                      <tr
                        key={record.id}
                        onClick={() => { setSelectedRecord(record); setIsDetailsOpen(true); }}
                        className="hover:bg-canvas-dominant/60 transition-colors cursor-pointer select-none"
                      >
                        <td className="py-4 px-5 font-bold text-slate-secondary">
                          {record.memberName}
                        </td>
                        <td className="py-4 px-5 text-slate-secondary">{record.bookTitle}</td>
                        <td className="py-4 px-5 text-xs font-data text-slate-light">{record.borrowedDate}</td>
                        <td className="py-4 px-5 text-xs font-data font-bold text-slate-secondary">{record.dueDate}</td>
                        <td className="py-4 px-5 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase ${
                            record.computedStatus === "OVERDUE"
                              ? "bg-rose-50 text-rose-700 border border-rose-100/50 animate-pulse"
                              : "bg-sage-primary/5 text-sage-primary border border-sage-primary/10"
                          }`}>
                            {record.computedStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 💡 UPDATED: NATURAL FLOW PAGINATION BAR (Appears naturally below table) */}
          <div className="px-5 py-4 border border-slate-light/10 rounded-2xl bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs transition-all">
            <div className="text-xs text-slate-light font-medium">
              Showing page <span className="font-bold text-slate-secondary">{safeCurrentPage}</span> of <span className="font-bold text-slate-secondary">{totalPages}</span> (<span className="font-bold text-slate-secondary">{totalRecordsCount}</span> records logged)
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

      {/* Modals Layers */}
      <TransactionModal
        key={isFormOpen ? (selectedRecord ? `edit-${selectedRecord.id}` : "new-issue-form") : "closed"}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={(vals) => saveMutation.mutate(vals)}
        editingRecord={selectedRecord}
      />

      <IssueDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        record={selectedRecord}
        onMarkAsReturned={(id) => returnBookMutation.mutate(id)}
        onTriggerEdit={() => { setIsDetailsOpen(false); setIsFormOpen(true); }}
      />
    </div>
  );
};