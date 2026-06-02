import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import type { FineRecord } from "../../../types/fines";
import { toast } from "sonner";

export const FinesPage = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "PAID" or "UNPAID"

  // 1. Fetch Outstanding Financial Balances
  const { data: finesList, isLoading } = useQuery<FineRecord[]>({
    queryKey: ["finesMasterLedgerFeed"],
    queryFn: async () => (await axiosClient.get("/fines")).data
  });

  // 2. Clear Fine Account Balance Mutation
  const settleFineMutation = useMutation({
    mutationFn: async ({ id, paidStatus }: { id: string; paidStatus: boolean }) => {
      const todayString = paidStatus ? new Date().toISOString().split("T")[0] : null;
      return await axiosClient.put(`/fines/${id}`, {
        paidStatus,
        paidDate: todayString
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["finesMasterLedgerFeed"] });
      
      if (variables.paidStatus) {
        // NOTIFY LIBRARIAN TO NOW GO TO THE ISSUE PAGE AND UPDATE MANUALLY
        toast.success("💰 Penalty Invoice Cleared Successfully!", {
          description: "💡 REMINDER: Remember to change this book's status to RETURNED on the Circulation Desk page.",
          duration: 6000,
        });
      } else {
        toast.info("Invoice status set back to Unpaid.");
      }
    }
  });

  // 3. Search and Filtering Logic Matrix
  const filteredFines = finesList?.filter(fine => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = fine.memberName.toLowerCase().includes(term) || fine.bookTitle.toLowerCase().includes(term);
    
    const fineStatusString = fine.paidStatus ? "PAID" : "UNPAID";
    const matchesStatus = statusFilter === "" || fineStatusString === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Fine Ledger & Financial Audits</h2>
        <p className="text-xs text-gray-500">Track automatic asset penalty invoices, log member transactions, and audit processed balances.</p>
      </div>

      {/* Filter Toolbar Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <input
          type="text"
          placeholder="🔎 Filter invoice files by member name or book title strings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:col-span-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand"
        >
          <option value="">-- View All Invoices --</option>
          <option value="UNPAID">Outstanding (UNPAID)</option>
          <option value="PAID">Settled (PAID)</option>
        </select>
      </div>

      {/* Audit Data Table Element */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-gray-400 font-semibold animate-pulse">Syncing Financial Records...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase bg-gray-50/70">
                  <th className="py-3.5 px-4">Account Holder Member</th>
                  <th className="py-3.5 px-4">Delinquent Media Asset</th>
                  <th className="py-3.5 px-4 text-center">Delayed Days</th>
                  <th className="py-3.5 px-4">Accrued Fine Amount</th>
                  <th className="py-3.5 px-4 text-center">Payment Audit Status</th>
                  <th className="py-3.5 px-4">Settlement Receipt Date</th>
                  <th className="py-3.5 px-4 text-right">Actions Ledger</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {filteredFines?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-xs text-gray-400 font-medium">No fine invoices match selected filters.</td>
                  </tr>
                ) : (
                  filteredFines?.map(fine => (
                    <tr key={fine.id} className={`hover:bg-gray-50/40 transition-colors ${fine.paidStatus ? "opacity-70" : ""}`}>
                      <td className="py-3.5 px-4 font-semibold text-gray-800">{fine.memberName}</td>
                      <td className="py-3.5 px-4 font-medium text-gray-600">{fine.bookTitle}</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-center font-bold text-amber-700">{fine.delayedDays} Days</td>
                      <td className="py-3.5 px-4 font-mono text-sm font-bold text-gray-900">₹ {fine.fineAmount}.00</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          fine.paidStatus 
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20" 
                            : "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20"
                        }`}>
                          {fine.paidStatus ? "PAID" : "UNPAID"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-gray-500">{fine.paidDate || "—"}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => settleFineMutation.mutate({ id: fine.id, paidStatus: !fine.paidStatus })}
                          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            fine.paidStatus
                              ? "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600"
                              : "border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {fine.paidStatus ? "Mark Unpaid" : "Collect Payment"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};