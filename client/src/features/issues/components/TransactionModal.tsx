import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionFormSchema, type TransactionFormValues } from "../schemas/transactionSchema";
import type { BookIssueRecord, MemberLookup, BookLookup } from "../../../types/transactions";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionFormValues) => void;
  members: MemberLookup[];
  books: BookLookup[];
  editingRecord?: BookIssueRecord | null;
}

export const TransactionModal = ({ isOpen, onClose, onSubmit, members, books, editingRecord }: TransactionModalProps) => {
  const todayString = new Date().toISOString().split("T")[0];

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TransactionFormValues>({
    resolver: zodResolver(TransactionFormSchema),
    defaultValues: { memberId: "", bookId: "", borrowedDate: todayString, dueDate: "", status: "BORROWED" }
  });

  useEffect(() => {
    if (editingRecord) {
      reset({
        memberId: editingRecord.memberId,
        bookId: editingRecord.bookId,
        borrowedDate: editingRecord.borrowedDate,
        dueDate: editingRecord.dueDate,
        status: editingRecord.status
      });
    } else {
      reset({ memberId: "", bookId: "", borrowedDate: todayString, dueDate: "", status: "BORROWED" });
    }
  }, [editingRecord, reset, todayString]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-ocean-blue/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 animate-zoom-in">
        <div className="bg-linear-to-r from-ocean-light to-ocean-blue p-5 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">{editingRecord ? "Update Allocation Parameter Logs" : "Authorize Book Issue Voucher"}</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white transition-colors cursor-pointer text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">Target Beneficiary Member</label>
            <select {...register("memberId")} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand">
              <option value="">-- Associate Registry Member Account --</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            {errors.memberId && <p className="text-xs text-red-500 mt-1 font-medium">{errors.memberId.message}</p>}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">Assigned Catalog Inventory Item</label>
            <select {...register("bookId")} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand">
              <option value="">-- Match Stock Volume Title --</option>
              {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
            </select>
            {errors.bookId && <p className="text-xs text-red-500 mt-1 font-medium">{errors.bookId.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">Voucher Issue Date</label>
              <input type="date" {...register("borrowedDate")} readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 outline-hidden" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">Mandatory Return Deadline</label>
              <input type="date" min={todayString} {...register("dueDate")} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand" />
              {errors.dueDate && <p className="text-xs text-red-500 mt-1 font-medium">{errors.dueDate.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">Voucher Circulation Status</label>
            <select {...register("status")} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand">
              <option value="BORROWED">BORROWED (On Active Loan)</option>
              <option value="RETURNED">RETURNED (Inventory Restocked)</option>
              <option value="OVERDUE">OVERDUE (Term Deadline Passed)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">Abort Action</button>
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-teal-brand hover:bg-teal-hover shadow-sm rounded-xl transition-all cursor-pointer">
              {editingRecord ? "Commit File Changes" : "Confirm Issue Voucher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};