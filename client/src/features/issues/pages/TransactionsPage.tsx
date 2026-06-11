import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { TransactionModal } from "../components/TransactionModal";
import { IssueDetailsModal } from "../components/IssueDetailsModal";
// Import explicit structural types from your updated declarations file
import type { BookIssueRecord, ComputedIssueStatus } from "../../../types/transactions";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/authStore";

// Editorial Visual Assets
import { 
  Search, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  RefreshCw, 
  User, 
  BookOpen, 
  Calendar, 
  AlertCircle,
  Activity
} from "lucide-react";

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

  // Reset Filters Handler (Kept exactly as your original code)
  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  // Performance Boost: Memoize single-pass filtering and sorting loops
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

  // Safe Client-Side Pagination Boundaries Engine
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
    <div className="flex flex-col min-h-screen max-w-6xl relative animate-fade-in pb-12 font-sans text-xs sm:text-sm text-slate-700 text-left">
      
      {/* Upper Control Bar Layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 mb-5 rounded-2xl border border-slate-200 shadow-xs shrink-0">
        <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Borrow & Return Desk</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Manage real-time out-of-building media assets, process drop-offs, and track compliance.</p>
        </div>
        <button
          type="button"
          onClick={() => { setSelectedRecord(null); setIsFormOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus size={14} /> Issue New Book
        </button>
      </div>

      {/* Filter & Search Bar Controls Section */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 mb-5 rounded-2xl border border-slate-200 shadow-2xs shrink-0">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Query active loans by member name or book title..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-hidden transition-all placeholder-slate-400"
          />
        </div>
        <div className="flex gap-2.5 min-w-xs">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-800 focus:bg-white focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-hidden transition-all cursor-pointer"
          >
            <option value="">All Active Loans</option>
            <option value="BORROWED">Standard Borrows</option>
            <option value="OVERDUE">Deadlines Violated</option>
          </select>

          <button
            type="button"
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap uppercase tracking-wider border border-rose-100"
          >
            <RotateCcw size={12} /> Clear
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-xs sm:text-sm text-slate-400 font-semibold animate-pulse flex-1 flex flex-col items-center justify-center gap-2">
          <RefreshCw size={20} className="animate-spin text-slate-300" />
          Syncing active book circulation ledgers...
        </div>
      ) : (
        <div className="flex flex-col flex-1 space-y-5">
          
          {/* Main List Workspace Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase bg-slate-50 tracking-wider">
                    <th className="py-3.5 px-5"><User size={12} className="inline mr-1" />Member Name</th>
                    <th className="py-3.5 px-5"><BookOpen size={12} className="inline mr-1" />Issued Book Title</th>
                    <th className="py-3.5 px-5"><Calendar size={12} className="inline mr-1" />Checkout Date</th>
                    <th className="py-3.5 px-5">Target Due Deadline</th>
                    <th className="py-3.5 px-5 text-center"><Activity size={12} className="inline mr-1" />Status Flag</th>
                  </tr>
                </thead>
                <tbody className="text-xs sm:text-sm divide-y divide-slate-100 text-slate-700">
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-slate-400 font-medium">
                        No active out-of-building book logs registered on current indexing criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((record) => (
                      <tr
                        key={record.id}
                        onClick={() => { setSelectedRecord(record); setIsDetailsOpen(true); }}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer select-none group"
                      >
                        <td className="py-3.5 px-5 font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                          {record.memberName}
                        </td>
                        <td className="py-3.5 px-5 text-slate-800 font-medium">{record.bookTitle}</td>
                        <td className="py-3.5 px-5 text-slate-500 font-mono text-xs">{record.borrowedDate}</td>
                        <td className="py-3.5 px-5 font-bold font-mono text-slate-900 text-xs">{record.dueDate}</td>
                        <td className="py-3.5 px-5 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase border ${
                            record.computedStatus === "OVERDUE"
                              ? "bg-rose-50 text-rose-700 border-rose-100 animate-pulse"
                              : "bg-emerald-50 text-emerald-700 border-emerald-100"
                          }`}>
                            {record.computedStatus === "OVERDUE" && <AlertCircle size={10} className="mr-1 inline" />}
                            {record.computedStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>


              {totalPages > 0 && (
                        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                          <span>
                            Page {currentPage} / {totalPages} <span className="text-slate-300 mx-2">|</span> Total {totalRecordsCount} Books
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={currentPage === 1}
                              onClick={(e) => { e.stopPropagation(); setCurrentPage((p) => Math.max(1, p - 1)); }}
                              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg disabled:opacity-30 cursor-pointer transition-colors shadow-xs"
                            >
                              <ChevronLeft size={14} />
                            </button>
                            <button
                              type="button"
                              disabled={currentPage === totalPages}
                              onClick={(e) => { e.stopPropagation(); setCurrentPage((p) => Math.min(totalPages, p + 1)); }}
                              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg disabled:opacity-30 cursor-pointer transition-colors shadow-xs"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                      )}
          </div>

          {/* Pagination Controls Footer UI
          <div className="px-5 py-3 border border-slate-200 rounded-2xl bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs transition-all">
            <div className="text-xs font-medium text-slate-500">
              Showing page <b className="text-slate-900 font-mono">{safeCurrentPage}</b> of <b className="text-slate-900 font-mono">{totalPages}</b> (<span className="font-mono">{totalRecordsCount}</span> records logged)
            </div>
            
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-slate-900 cursor-pointer transition-all"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer font-mono ${
                    safeCurrentPage === pageNum
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-slate-900 cursor-pointer transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div> */}

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