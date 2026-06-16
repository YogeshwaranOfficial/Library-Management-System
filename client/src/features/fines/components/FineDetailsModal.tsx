import { useState } from "react";
import type { FineRecord } from "../../../types/fines";
import { DeleteFinesModal } from "./DeleteFinesModal";

interface FineDetailsModalProps {
  isOpen: boolean;
  fine: FineRecord | null;
  onClose: () => void;
  onSettle: (fine: FineRecord) => void;
  onDelete: (id: string) => void;
}

export const FineDetailsModal = ({
  isOpen,
  fine,
  onClose,
  onSettle,
  onDelete,
}: FineDetailsModalProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !fine) return null;

  const displayId = fine.fine_id?.slice(-4).toUpperCase() || "0000";

  const breakdown = fine.breakdown || {
    withinPlanDays: fine.delayed_days,
    withinPlanFine: fine.fine_amount,
    outsidePlanDays: 0,
    outsidePlanFine: 0,
    isPlanExpiredNow: !fine.membershipActive,
    expiryDate: null,
  };

  return (
  <>
    <div className="fixed inset-0 bg-slate-900/40 p-4 backdrop-blur-sm font-sans select-none text-left flex items-center justify-center z-50">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl transition-all overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]">
        {/* Header Framework - Matching Reference Module */}
        <div className="flex items-center justify-between border-b border-gray-200 p-5 bg-white">
          <div>
            <h3 className="text-lg font-bold text-[#1A365D] tracking-tight">
              About Fine Context
            </h3>
            <p className="text-[11px] text-[#718096] font-bold mt-1 tracking-wider uppercase">
              ID: FINE-{displayId}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#718096] hover:text-[#1A365D] hover:bg-gray-100 transition-all text-xs font-bold cursor-pointer p-1.5 rounded-full"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#2D3748]">
          <div className="space-y-6">
            {/* Account Holder Section */}
            <div className="space-y-1.5">
              <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                Member Account Profile
              </span>
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <span className="text-[#718096] block text-[11px] uppercase font-bold tracking-wide mb-0.5">
                    Full Name
                  </span>
                  <span className="font-semibold text-[#1A365D]">
                    {fine.memberName}
                  </span>
                </div>
                <div>
                  <span className="text-[#718096] block text-[11px] uppercase font-bold tracking-wide mb-0.5">
                    Phone Number
                  </span>
                  <span className="font-semibold text-[#2D3748]">
                    {fine.memberPhone || "N/A"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#718096] block text-[11px] uppercase font-bold tracking-wide mb-0.5">
                    Email Address
                  </span>
                  <span className="font-semibold text-[#2D3748]">
                    {fine.memberEmail}
                  </span>
                </div>
              </div>
            </div>

            {/* Media Asset Section */}
            <div className="space-y-1.5">
              <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                Book Details
              </span>
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div className="col-span-2">
                  <span className="text-[#718096] block text-[11px] uppercase font-bold tracking-wide mb-0.5">
                    Book Title
                  </span>
                  <span className="font-semibold text-[#1A365D] flex items-center gap-1.5">
                    {fine.bookTitle}
                  </span>
                </div>
                <div>
                  <span className="text-[#718096] block text-[11px] uppercase font-bold tracking-wide mb-0.5">
                    Author
                  </span>
                  <span className="text-[#2D3748] font-semibold">
                    {fine.bookAuthor}
                  </span>
                </div>
                <div>
                  <span className="text-[#718096] block text-[11px] uppercase font-bold tracking-wide mb-0.5">
                    Checkout Trigger Date
                  </span>
                  <span className="font-semibold text-[#2D3748]">
                    {fine.borrowedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Penalty Calculation */}
            <div className="space-y-1.5">
              <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                Penalty Matrix Audit
              </span>
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-[#718096] font-bold text-[11px] uppercase border-b border-gray-200 tracking-wide">
                      <th className="py-2.5 px-4">Clause</th>
                      <th className="py-2.5 px-4 text-center">Days</th>
                      <th className="py-2.5 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-[#2D3748]">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-[#1A365D]">
                        Standard Plan Rate
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        {breakdown.withinPlanDays}d
                      </td>
                      <td className="py-3 px-4 text-right font-bold">
                        ₹{breakdown.withinPlanFine}.00
                      </td>
                    </tr>
                    {breakdown.outsidePlanDays > 0 && (
                      <tr className="bg-rose-50/40">
                        <td className="py-3 px-4 text-rose-700 font-bold flex items-center gap-1.5">
                          Out-of-Plan Climax
                        </td>
                        <td className="py-3 px-4 text-center text-rose-700 font-bold">
                          {breakdown.outsidePlanDays}d
                        </td>
                        <td className="py-3 px-4 text-right text-rose-700 font-bold">
                          ₹{breakdown.outsidePlanFine}.00
                        </td>
                      </tr>
                    )}
                    <tr className="bg-[#1A365D] text-white font-bold">
                      <td
                        colSpan={2}
                        className="py-3.5 px-4 text-right uppercase tracking-wide text-[11px] text-gray-300"
                      >
                        Total Owed Ledger:
                      </td>
                      <td className="py-3.5 px-4 text-right text-sm text-amber-400">
                        ₹{fine.fine_amount}.00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Operations Layout Action Buttons - Matching layout rules and theme */}
            <div className="pt-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-xs font-bold text-rose-600 uppercase tracking-wider hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-all cursor-pointer text-left sm:text-center"
              >
                Delete Record
              </button>

              <button
                type="button"
                onClick={() => onSettle(fine)}
                className="px-5 py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm text-center tracking-wide"
              >
                Settle Balance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Confirmation Modal */}
    <DeleteFinesModal
      isOpen={showDeleteConfirm}
      onClose={() => setShowDeleteConfirm(false)}
      onConfirm={() => {
        onDelete(fine.fine_id);
        setShowDeleteConfirm(false);
        onClose();
      }}
      memberName={fine.memberName}
      amount={fine.fine_amount}
    />
  </>
);
};
