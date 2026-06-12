import { useState } from "react";
import type { FineRecord } from "../../../types/fines";
import {
  X,
  User,
  BookOpen,
  ShieldAlert,
  DollarSign,
  Trash2,
  CheckCircle2,
} from "lucide-react";
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
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans text-xs sm:text-sm text-text-main text-left animate-fade-in">
        <div className="bg-card-bg rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-border-main animate-zoom-in">
          {/* Header */}
          <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                About Fine Context
              </h3>
              <p className="font-mono text-[11px] text-slate-400 tracking-widest mt-0.5">
                ID: FINE-{displayId}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-card-bg/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Account Holder Section */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <User size={12} className="text-text-main shrink-0" /> Member
                Account Profile
              </h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-border-main grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold tracking-wide mb-0.5">
                    Full Name
                  </span>
                  <span className="font-bold text-text-main">
                    {fine.memberName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold tracking-wide mb-0.5">
                    Phone Number
                  </span>
                  <span className="font-mono font-semibold text-text-main">
                    {fine.memberPhone || "N/A"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px] uppercase font-bold tracking-wide mb-0.5">
                    Email Address
                  </span>
                  <span className="font-mono font-semibold text-text-main">
                    {fine.memberEmail}
                  </span>
                </div>
              </div>
            </div>

            {/* Media Asset Section */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <BookOpen size={12} className="text-text-main shrink-0" />{" "}
                Circulated Media Target
              </h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-border-main grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px] uppercase font-bold tracking-wide mb-0.5">
                    Book Title
                  </span>
                  <span className="font-bold text-text-main flex items-center gap-1.5">
                    <BookOpen size={12} className="text-slate-400 shrink-0" />{" "}
                    {fine.bookTitle}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold tracking-wide mb-0.5">
                    Author
                  </span>
                  <span className="text-text-main font-semibold">
                    {fine.bookAuthor}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold tracking-wide mb-0.5">
                    Checkout Trigger Date
                  </span>
                  <span className="font-mono font-semibold text-text-main">
                    {fine.borrowedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Penalty Calculation */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <DollarSign size={12} className="text-text-main shrink-0" />{" "}
                Penalty Matrix Audit
              </h4>
              <div className="border border-border-main rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold text-[11px] uppercase border-b border-border-main tracking-wide">
                      <th className="py-2.5 px-4">Clause</th>
                      <th className="py-2.5 px-4 text-center">Days</th>
                      <th className="py-2.5 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-text-main">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-text-main">
                        Standard Plan Rate
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        {breakdown.withinPlanDays}d
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        ₹{breakdown.withinPlanFine}.00
                      </td>
                    </tr>
                    {breakdown.outsidePlanDays > 0 && (
                      <tr className="bg-rose-50/40">
                        <td className="py-3 px-4 text-rose-700 font-bold flex items-center gap-1.5">
                          <ShieldAlert
                            size={12}
                            className="text-rose-600 shrink-0"
                          />{" "}
                          Out-of-Plan Climax
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-rose-700 font-bold">
                          {breakdown.outsidePlanDays}d
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-rose-700 font-bold">
                          ₹{breakdown.outsidePlanFine}.00
                        </td>
                      </tr>
                    )}
                    <tr className="bg-slate-900 text-white font-bold">
                      <td
                        colSpan={2}
                        className="py-3.5 px-4 text-right uppercase tracking-wide text-[11px] text-slate-400"
                      >
                        Total Owed Ledger:
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-sm text-amber-400">
                        ₹{fine.fine_amount}.00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-border-main grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-card-bg border border-rose-200 text-rose-600 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-rose-50 transition-all cursor-pointer shadow-xs"
            >
              <Trash2 size={12} /> Delete Record
            </button>
            <button
              type="button"
              onClick={() => onSettle(fine)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <CheckCircle2 size={12} /> Settle Balance
            </button>
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
