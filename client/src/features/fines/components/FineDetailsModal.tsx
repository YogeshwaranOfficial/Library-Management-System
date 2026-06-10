import { useState } from "react";
import type { FineRecord } from "../../../types/fines";
import { X, User, BookOpen, ShieldAlert, DollarSign, Trash2, CheckCircle2 } from "lucide-react";
import { DeleteFinesModal } from "./DeleteFinesModal";

interface FineDetailsModalProps {
  isOpen: boolean;
  fine: FineRecord | null;
  onClose: () => void;
  onSettle: (fine: FineRecord) => void;
  onDelete: (id: string) => void;
}

export const FineDetailsModal = ({ isOpen, fine, onClose, onSettle, onDelete }: FineDetailsModalProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !fine) return null;

  const displayId = fine.fine_id?.slice(-4).toUpperCase() || "0000";

  const breakdown = fine.breakdown || {
    withinPlanDays: fine.delayed_days,
    withinPlanFine: fine.fine_amount,
    outsidePlanDays: 0,
    outsidePlanFine: 0,
    isPlanExpiredNow: !fine.membershipActive,
    expiryDate: null
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-secondary/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-light/10 animate-zoom-in text-left">
          
          {/* Header */}
          <div className="bg-slate-secondary px-6 py-5 text-white flex justify-between items-center">
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider">About Fine Context</h3>
              <p className="font-data text-[10px] text-slate-light tracking-widest mt-0.5">ID: FINE-{displayId}</p>
            </div>
            <button 
              type="button"
              onClick={onClose} 
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-light hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-slate-secondary">
            {/* Account Holder Section */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-slate-light uppercase tracking-wider flex items-center gap-1.5">
                <User size={12} className="text-slate-secondary shrink-0" /> Member Account Profile
              </h4>
              <div className="bg-canvas-dominant p-4 rounded-xl border border-slate-light/10 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <div>
                  <span className="text-slate-light block text-[9px] uppercase font-black tracking-wider mb-0.5">Full Name</span>
                  <span className="font-bold text-slate-secondary">{fine.memberName}</span>
                </div>
                <div>
                  <span className="text-slate-light block text-[9px] uppercase font-black tracking-wider mb-0.5">Phone Number</span>
                  <span className="font-data font-semibold text-slate-secondary">{fine.memberPhone || "N/A"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-light block text-[9px] uppercase font-black tracking-wider mb-0.5">Email Address</span>
                  <span className="font-data font-semibold text-slate-secondary">{fine.memberEmail}</span>
                </div>
              </div>
            </div>

            {/* Media Asset Section */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-slate-light uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={12} className="text-slate-secondary shrink-0" /> Circulated Media Target
              </h4>
              <div className="bg-canvas-dominant p-4 rounded-xl border border-slate-light/10 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <div className="col-span-2">
                  <span className="text-slate-light block text-[9px] uppercase font-black tracking-wider mb-0.5">Book Title</span>
                  <span className="font-bold text-slate-secondary flex items-center gap-1.5">
                    <BookOpen size={12} className="text-slate-light shrink-0" /> {fine.bookTitle}
                  </span>
                </div>
                <div>
                  <span className="text-slate-light block text-[9px] uppercase font-black tracking-wider mb-0.5">Author</span>
                  <span className="text-slate-secondary font-semibold">{fine.bookAuthor}</span>
                </div>
                <div>
                  <span className="text-slate-light block text-[9px] uppercase font-black tracking-wider mb-0.5">Checkout Trigger Date</span>
                  <span className="font-data font-semibold text-slate-secondary">{fine.borrowedDate}</span>
                </div>
              </div>
            </div>

            {/* Penalty Calculation */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-slate-light uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign size={12} className="text-slate-secondary shrink-0" /> Penalty Matrix Audit
              </h4>
              <div className="border border-slate-light/10 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-canvas-dominant text-slate-light font-black text-[9px] uppercase border-b border-slate-light/10 tracking-wider">
                      <th className="py-2.5 px-4">Clause</th>
                      <th className="py-2.5 px-4 text-center">Days</th>
                      <th className="py-2.5 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-light/5 font-medium text-slate-secondary">
                    <tr>
                      <td className="py-3 px-4 text-slate-secondary font-semibold">Standard Plan Rate</td>
                      <td className="py-3 px-4 text-center font-data font-bold">{breakdown.withinPlanDays}d</td>
                      <td className="py-3 px-4 text-right font-data font-black">₹{breakdown.withinPlanFine}.00</td>
                    </tr>
                    {breakdown.outsidePlanDays > 0 && (
                      <tr className="bg-rose-50/40">
                        <td className="py-3 px-4 text-rose-700 font-bold flex items-center gap-1.5">
                          <ShieldAlert size={12} className="text-rose-600 shrink-0" /> Out-of-Plan Climax
                        </td>
                        <td className="py-3 px-4 text-center font-data text-rose-700 font-black">{breakdown.outsidePlanDays}d</td>
                        <td className="py-3 px-4 text-right font-data text-rose-700 font-black">₹{breakdown.outsidePlanFine}.00</td>
                      </tr>
                    )}
                    <tr className="bg-slate-secondary text-white font-bold">
                      <td colSpan={2} className="py-3.5 px-4 text-right uppercase tracking-wider text-[10px] text-slate-light font-black">Total Owed Ledger:</td>
                      <td className="py-3.5 px-4 text-right font-data font-black text-sm text-amber-400">₹{fine.fine_amount}.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-canvas-dominant border-t border-slate-light/10 grid grid-cols-2 gap-3">
            <button 
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-white border border-rose-200/60 text-rose-600 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-rose-50 transition-all cursor-pointer shadow-3xs"
            >
              <Trash2 size={12} /> Delete Record
            </button>
            <button 
              type="button"
              onClick={() => onSettle(fine)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs"
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