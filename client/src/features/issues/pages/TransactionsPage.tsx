import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { TransactionModal } from "../components/TransactionModal";
import { DeleteTransactionModal } from "../components/DeleteTransactionModal";
import type { BookIssueRecord, MemberLookup, BookLookup } from "../../../types/transactions";
import type { TransactionFormValues } from "../schemas/transactionSchema";
import { toast } from "sonner";

export const TransactionsPage = () => {
  const queryClient = useQueryClient();
  const todayIso = new Date().toISOString().split("T")[0];
  
  // Filtering and searching control matrices
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal display variables tracking states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteModalConfig, setDeleteModalConfig] = useState<{ open: boolean; mode: "SINGLE" | "BULK_CLEAN" }>({ open: false, mode: "SINGLE" });
  const [selectedRecord, setSelectedRecord] = useState<BookIssueRecord | null>(null);

  // 1. Relational Data Query Operations
  const { data: rawIssues, isLoading } = useQuery<BookIssueRecord[]>({
    queryKey: ["circulationMasterRecordsFeed"],
    queryFn: async () => (await axiosClient.get("/issues")).data
  });

  const { data: members = [] } = useQuery<MemberLookup[]>({
    queryKey: ["membersLookupDropdownFeed"],
    queryFn: async () => (await axiosClient.get("/members/lookup-summary")).data
  });

  const { data: books = [] } = useQuery<BookLookup[]>({
    queryKey: ["booksLookupDropdownFeed"],
    queryFn: async () => (await axiosClient.get("/books/lookup-summary")).data
  });

  // 2. Data Modification Operations Pipelines
  const saveMutation = useMutation({
    mutationFn: async (payload: TransactionFormValues) => {
      if (selectedRecord) return await axiosClient.put(`/issues/${selectedRecord.id}`, payload);
      return await axiosClient.post("/issues", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circulationMasterRecordsFeed"] });
      toast.success("Circulation parameters synced successfully.");
      setIsFormOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await axiosClient.delete(`/issues/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circulationMasterRecordsFeed"] });
      toast.success("Circulation file cleared.");
      setDeleteModalConfig({ open: false, mode: "SINGLE" });
    }
  });

  const purgeBulkReturnedMutation = useMutation({
    mutationFn: async () => await axiosClient.post("/issues/purge-returned-history"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circulationMasterRecordsFeed"] });
      toast.success("All historical returned entries purged cleanly.");
      setDeleteModalConfig({ open: false, mode: "SINGLE" });
    }
  });

  // 3. Evaluation filtration logic paths & Smart Dynamic Sorting Engine
  const processedRecords = rawIssues?.map(record => {
    // Dynamic client-side evaluation fallback to calculate overdue flags automatically
    const dynamicallyOverdue = record.status === "BORROWED" && todayIso > record.dueDate;
    return { ...record, status: dynamicallyOverdue ? "OVERDUE" as const : record.status };
  })
  .filter(rec => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = rec.memberName.toLowerCase().includes(term) || rec.bookTitle.toLowerCase().includes(term);
    const matchesStatus = statusFilter === "" || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  })
  // CRITICAL ARCHITECTURAL REQUIREMENT: Grouping logic array pushes RETURNED parameters to the bottom line
  .sort((x, y) => {
    if (x.status === "RETURNED" && y.status !== "RETURNED") return 1;
    if (x.status !== "RETURNED" && y.status === "RETURNED") return -1;
    return new Date(x.dueDate).getTime() - new Date(y.dueDate).getTime();
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Circulation Desk Ledger</h2>
          <p className="text-xs text-gray-500">Authorize book loans, process item returns, and monitor real-time overdue files.</p>
        </div>
        <div className="flex gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setDeleteModalConfig({ open: true, mode: "BULK_CLEAN" })}
            className="px-3.5 py-2.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            🧹 Clean Returned Files
          </button>
          <button
            onClick={() => { setSelectedRecord(null); setIsFormOpen(true); }}
            className="px-4 py-2.5 bg-teal-brand hover:bg-teal-hover text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex-1 sm:flex-initial"
          >
            ➕ Issue New Book Voucher
          </button>
        </div>
      </div>

      {/* Query Filter Navigation Controls Line */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <input
          type="text"
          placeholder="🔎 Query by active member profile name or book title index strings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:col-span-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand"
        >
          <option value="">-- Filter By Loan State Status --</option>
          <option value="BORROWED">Active Loans (BORROWED)</option>
          <option value="OVERDUE">Deadlines Violated (OVERDUE)</option>
          <option value="RETURNED">Completed Runs (RETURNED)</option>
        </select>
      </div>

      {/* Primary Data Grid Display Layer */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-gray-400 font-semibold animate-pulse">Syncing Active Circulation Master Files...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase bg-gray-50/70">
                  <th className="py-3.5 px-4">Account Holder Context</th>
                  <th className="py-3.5 px-4">Issued Media Volume Asset</th>
                  <th className="py-3.5 px-4">Checkout Date</th>
                  <th className="py-3.5 px-4">Target Due Deadline</th>
                  <th className="py-3.5 px-4 text-center">Status Flag</th>
                  <th className="py-3.5 px-4 text-right">Action Blocks</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {processedRecords?.map(record => {
                  const isReturned = record.status === "RETURNED";
                  return (
                    <tr 
                      key={record.id} 
                      // Dynamic application logic styling: strikeout and dull completed file assets 
                      className={`transition-colors duration-150 ${
                        isReturned 
                          ? "bg-gray-50/70 text-gray-400 line-through opacity-60" 
                          : "hover:bg-gray-50/40 text-gray-700"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold">{record.memberName}</td>
                      <td className="py-3.5 px-4 font-medium">{record.bookTitle}</td>
                      <td className="py-3.5 px-4 font-mono text-xs">{record.borrowedDate}</td>
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold">{record.dueDate}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold no-underline ${
                          record.status === "OVERDUE" ? "bg-rose-50 text-rose-700 ring-1 ring-rose-600/10" :
                          record.status === "BORROWED" ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/10" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-3 no-underline">
                        <button onClick={() => { setSelectedRecord(record); setIsFormOpen(true); }} className="text-xs font-bold text-teal-brand hover:text-teal-hover transition-colors cursor-pointer disabled:opacity-30">Edit</button>
                        <button onClick={() => { setSelectedRecord(record); setDeleteModalConfig({ open: true, mode: "SINGLE" }); }} className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer">Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <TransactionModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={(vals) => saveMutation.mutate(vals)} members={members} books={books} editingRecord={selectedRecord} />
      <DeleteTransactionModal 
        isOpen={deleteModalConfig.open} 
        onClose={() => setDeleteModalConfig({ open: false, mode: "SINGLE" })} 
        onConfirm={() => {
          if (deleteModalConfig.mode === "SINGLE" && selectedRecord) deleteMutation.mutate(selectedRecord.id);
          else purgeBulkReturnedMutation.mutate();
        }} 
        mode={deleteModalConfig.mode} 
        titleDetails={selectedRecord?.bookTitle} 
      />
    </div>
  );
};