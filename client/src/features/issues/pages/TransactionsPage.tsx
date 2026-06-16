import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { TransactionModal } from "../components/TransactionModal";
import { IssueDetailsModal } from "../components/IssueDetailsModal";
// Import explicit structural types from your updated declarations file
import type {
  BookIssueRecord,
  ComputedIssueStatus,
} from "../../../types/transactions";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/authStore";

// Editorial Visual Assets
import {
  Search,
  RotateCcw,
  ChevronDown,
  X,
  Plus,
  RefreshCw,
  User,
  BookOpen,
  Calendar,
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
  const [selectedRecord, setSelectedRecord] = useState<BookIssueRecord | null>(
    null,
  );

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
      queryClient.invalidateQueries({
        queryKey: ["circulationMasterRecordsFeed"],
      });
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
    mutationFn: async (payload: {
      memberId: string;
      bookId: string;
      borrowDate: string;
      dueDate: string;
    }) => {
      if (selectedRecord) {
        return await axiosClient.patch(`/issues/${selectedRecord.id}`, payload);
      }
      return await axiosClient.post("/issues/borrow", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["circulationMasterRecordsFeed"],
      });

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
      .reduce<(BookIssueRecord & { computedStatus: ComputedIssueStatus })[]>(
        (acc, record) => {
          const computedStatus: ComputedIssueStatus = record.status;

          if (computedStatus === "RETURNED") return acc;

          const term = searchQuery.toLowerCase();
          const nameMatch =
            record.memberName?.toLowerCase().includes(term) || false;
          const titleMatch =
            record.bookTitle?.toLowerCase().includes(term) || false;
          const matchesSearch = nameMatch || titleMatch;
          const matchesStatus =
            statusFilter === "" || computedStatus === statusFilter;

          if (matchesSearch && matchesStatus) {
            acc.push({ ...record, computedStatus });
          }
          return acc;
        },
        [],
      )
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      );
  }, [rawIssues, searchQuery, statusFilter]);

  // Safe Client-Side Pagination Boundaries Engine
  const totalRecordsCount = allFilteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecordsCount / rowsPerPage));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Slice array down to 10 rows maximum for viewport index rendering
  const paginatedRecords = useMemo(() => {
    return allFilteredRecords.slice(
      (safeCurrentPage - 1) * rowsPerPage,
      safeCurrentPage * rowsPerPage,
    );
  }, [allFilteredRecords, safeCurrentPage, rowsPerPage]);

 return (
  <div className="min-h-screen bg-white text-[#2D3748] antialiased pb-16 pt-10 px-8 lg:px-14 font-sans select-none">
    
    {/* Upper Control Bar Layout */}
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
      <div>
        <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-1.5">
            Lending Management Desk
          </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#1A365D]">
          Borrow & Return Desk
        </h2>
      </div>

      <button
        type="button"
        onClick={() => {
          setSelectedRecord(null);
          setIsFormOpen(true);
        }}
        className="flex items-center justify-center p-1.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white rounded-full transition-all cursor-pointer shrink-0"
      >
        <Plus size={14} />
      </button>
    </div>

    {/* Search Bar Controls Section */}
    <div className="flex items-center justify-between gap-4 mb-4 h-9">
      <div>        
      </div>
      <div className="flex items-center gap-3">   
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-sm focus-within:border-gray-300 focus-within:bg-white transition-all w-56">
          <span className="text-gray-400 mr-2 shrink-0">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Query active loans by member name or book title..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent border-0 outline-hidden w-full text-xs font-medium text-[#1A365D] placeholder-[#A0AEC0] p-0 focus:ring-0 focus:outline-hidden"
              />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="text-gray-400 hover:text-gray-600 ml-1 shrink-0"
            >
              <X size={11} />
            </button>
          )}
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

    {isLoading ? (
      <div className="py-24 text-xs font-semibold text-[#718096] tracking-widest uppercase animate-pulse">
        <RefreshCw size={20} className="animate-spin text-slate-300 inline mr-2" />
        Syncing active book circulation ledgers...
      </div>
    ) : (
      <div className="flex flex-col flex-1 space-y-5">

        {/* Main List Workspace Table */}
        <div className="w-full">

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">

              <thead>
                <tr className="border-b border-gray-200 text-[11px] font-bold text-[#718096] uppercase tracking-widest bg-transparent select-none">
                  <th className="pb-3 px-4">
                    <User size={12} className="inline mr-1" />
                    Member Name
                  </th>

                  <th className="pb-3 px-4">
                    <BookOpen size={12} className="inline mr-1" />
                    Issued Book Title
                  </th>

                  <th className="pb-3 px-4">
                    <Calendar size={12} className="inline mr-1" />
                    Checkout Date
                  </th>

                  <th className="pb-3 px-4">
                    Target Due Deadline
                  </th>
                    <th className="pb-3 px-4 text-center relative">
                      <div className="relative inline-flex items-center justify-center">
                        <select
                          value={statusFilter}
                          onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          className={`appearance-none bg-transparent cursor-pointer uppercase tracking-widest text-[11px] font-bold transition-colors pr-4 text-center hover:text-[#1A365D] focus:outline-none ${
                            statusFilter ? "text-[#2B6CB0]" : "text-[#718096]"
                          }`}
                        >
                          <option value="">Status</option>
                          <option value="BORROWED">Borrowed</option>
                          <option value="OVERDUE">Overdue</option>
                        </select>

                        <ChevronDown
                          size={11}
                          className="absolute right-0 text-[#718096] pointer-events-none"
                        />
                      </div>
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
                      No active out-of-building book logs registered on
                      current indexing criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((record) => (
                    <tr
                      key={record.id}
                      onClick={() => {
                        setSelectedRecord(record);
                        setIsDetailsOpen(true);
                      }}
                      className="transition-all duration-150 cursor-pointer border-l-4 border-l-transparent hover:bg-blue-50/40"
                    >
                      <td className="py-4 px-4 font-semibold text-[#1A365D]">
                        {record.memberName}
                      </td>

                      <td className="py-4 px-4 font-medium text-gray-700 text-sm">
                        {record.bookTitle}
                      </td>

                      <td className="py-4 px-4 text-[11px] text-[#718096] font-normal">
                        {record.borrowedDate}
                      </td>

                      <td className="py-4 px-4 font-medium text-gray-700 text-sm">
                        {record.dueDate}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 font-semibold text-xs select-none ${
                            record.computedStatus === "OVERDUE"
                              ? "text-rose-700"
                              : "text-emerald-700"
                          }`}
                        >
                          {/* {record.computedStatus === "OVERDUE" && (
                            <AlertCircle size={10} className="inline" />
                          )} */}

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
            <div className="py-4 border-t border-gray-100 flex justify-between items-center text-xs text-[#718096] tracking-wide mt-2 select-none">
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

    {/* Modals Layers */}
    <TransactionModal
      key={
        isFormOpen
          ? selectedRecord
            ? `edit-${selectedRecord.id}`
            : "new-issue-form"
          : "closed"
      }
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
      onTriggerEdit={() => {
        setIsDetailsOpen(false);
        setIsFormOpen(true);
      }}
    />
  </div>
);
};
