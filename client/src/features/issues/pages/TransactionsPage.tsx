import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { TransactionModal } from "../components/TransactionModal";
import { IssueDetailsModal } from "../components/IssueDetailsModal";
import type { BookIssueRecord } from "../../../types/transactions";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/authStore";

export const TransactionsPage = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const todayIso = new Date().toISOString().split("T")[0];

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
      return await axiosClient.post("/issues/return", {
        issueId,
        returnedDate: todayIso,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circulationMasterRecordsFeed"] });
      toast.success("Book returned safely! Moved to history records logs.");
      setIsDetailsOpen(false);
      setSelectedRecord(null);
    },
    onError: () => toast.error("Failed to execute return checkout protocol."),
  });

  // Mutate: Save (Create/Update Parameter Mappings)
  const saveMutation = useMutation({
    mutationFn: async (payload: { memberId: string; bookId: string; borrowDate: string; dueDate: string }) => {
      if (selectedRecord) {
        return await axiosClient.put(`/issues/${selectedRecord.id}`, payload);
      }
      return await axiosClient.post("/issues/borrow", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circulationMasterRecordsFeed"] });
      toast.success("Circulation parameters synchronized successfully.");
      setIsFormOpen(false);
      setSelectedRecord(null);
    },
    onError: () => toast.error("Database validation rules failed on saving."),
  });

  // ✨ Reset Filters Handler
  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setCurrentPage(1); // Reset back to initial index page 1
  };

  // ⚙️ Process and Filter Records (Matches active unreturned states + active criteria)
  const allFilteredRecords = rawIssues
    .map((record) => {
      const isOverdue = record.status === "BORROWED" && todayIso > record.dueDate;
      return {
        ...record,
        computedStatus: isOverdue ? ("OVERDUE" as const) : record.status,
      };
    })
    .filter((rec) => rec.computedStatus !== "RETURNED")
    .filter((rec) => {
      const term = searchQuery.toLowerCase();
      const nameMatch = rec.memberName?.toLowerCase().includes(term) || false;
      const titleMatch = rec.bookTitle?.toLowerCase().includes(term) || false;
      const matchesSearch = nameMatch || titleMatch;
      const matchesStatus = statusFilter === "" || rec.computedStatus === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // 🔢 Client-Side Pagination Chunking Strategy
  const totalRecordsCount = allFilteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecordsCount / rowsPerPage));
  
  // Slice array down to 10 rows maximum for the matching viewport index
  const paginatedRecords = allFilteredRecords.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Upper Control Bar Layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Borrow & Return Desk</h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage real-time out-of-building media assets, process drop-offs, and track compliance.</p>
        </div>
        <button
          onClick={() => { setSelectedRecord(null); setIsFormOpen(true); }}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
        >
          ➕ Issue New Book
        </button>
      </div>

      {/* Filter & Search Bar Controls Section */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <input
          type="text"
          placeholder="🔎 Query active loans by member name or book title..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-600"
        />
        <div className="flex gap-2 min-w-xs">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-600 cursor-pointer"
          >
            <option value="">All Active Loans</option>
            <option value="BORROWED">Standard Borrows (BORROWED)</option>
            <option value="OVERDUE">Deadlines Violated (OVERDUE)</option>
          </select>

          <button
              onClick={handleClearFilters}
             className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-all cursor-pointer col-span-2 sm:col-auto whitespace-nowrap"
            >
              Clear Filters
            </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-xs text-gray-400 font-semibold animate-pulse">
          Syncing active book circulation ledgers...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-bold text-gray-400 uppercase bg-gray-50/60 tracking-wider">
                    <th className="py-4 px-5">Member Name</th>
                    <th className="py-4 px-5">Issued Book Title</th>
                    <th className="py-4 px-5">Checkout Date</th>
                    <th className="py-4 px-5">Target Due Deadline</th>
                    <th className="py-4 px-5 text-center">Status Flag</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm text-gray-400 font-medium">
                        No active out-of-building book logs registered on current indexing criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((record) => (
                      <tr
                        key={record.id}
                        onClick={() => { setSelectedRecord(record); setIsDetailsOpen(true); }}
                        className="hover:bg-teal-50/40 transition-colors cursor-pointer group select-none"
                      >
                        <td className="py-4 px-5 font-bold text-gray-900 group-hover:text-teal-900 transition-colors">
                          {record.memberName}
                        </td>
                        <td className="py-4 px-5 font-medium text-gray-700">{record.bookTitle}</td>
                        <td className="py-4 px-5 text-xs font-mono text-gray-500">{record.borrowedDate}</td>
                        <td className="py-4 px-5 text-xs font-mono font-semibold text-gray-600">{record.dueDate}</td>
                        <td className="py-4 px-5 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                            record.computedStatus === "OVERDUE"
                              ? "bg-rose-50 text-rose-700 border border-rose-100 animate-pulse"
                              : "bg-blue-50 text-blue-700 border border-blue-100"
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

          {/* ✨ NEW: Pagination Controls Footer */}
          <div className="flex justify-between items-center bg-white px-5 py-4 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-xs font-medium text-gray-500">
              Showing page <b>{currentPage}</b>of <b>{totalPages}</b> ({totalRecordsCount} Records )
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg shadow-3xs text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all disabled:cursor-not-allowed cursor-pointer"
              >
                ◀ Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg shadow-3xs text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all disabled:cursor-not-allowed cursor-pointer"
              >
                Next ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals Layers */}
      <TransactionModal
        key={selectedRecord ? `edit-${selectedRecord.id}` : "new-issue-form"}
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