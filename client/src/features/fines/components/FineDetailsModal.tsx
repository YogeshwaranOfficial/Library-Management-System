import { useState } from "react";
import type { FineRecord } from "../../../types/fines";
import { X, User, BookOpen, ShieldAlert, DollarSign, Trash2, CheckCircle2 } from "lucide-react";
import { DeleteFinesModal } from "./DeleteFinesModal"; // Ensure this import path is correct

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
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 animate-zoom-in">
          
          {/* Header */}
          <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">About Fine</h3>
              <p className="font-mono text-2xs text-slate-300">ID: FINE-{displayId}</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Account Holder Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-600" /> Member Account Profile
              </h4>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/60 grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-gray-400 block text-3xs uppercase font-bold">Full Name</span><span className="font-semibold text-gray-800">{fine.memberName}</span></div>
                <div><span className="text-gray-400 block text-3xs uppercase font-bold">Phone Number</span><span className="font-mono text-gray-700">{fine.memberPhone || "N/A"}</span></div>
                <div className="col-span-2"><span className="text-gray-400 block text-3xs uppercase font-bold">Email Address</span><span className="font-mono text-gray-700">{fine.memberEmail}</span></div>
              </div>
            </div>

            {/* Media Asset Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-teal-600" /> Circulated Media Target
              </h4>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/60 grid grid-cols-2 gap-2 text-xs">
                <div className="col-span-2"><span className="text-gray-400 block text-3xs uppercase font-bold">Book Title</span><span className="font-semibold text-gray-800">📖 {fine.bookTitle}</span></div>
                <div><span className="text-gray-400 block text-3xs uppercase font-bold">Author</span><span className="text-gray-600 font-medium">{fine.bookAuthor}</span></div>
                <div><span className="text-gray-400 block text-3xs uppercase font-bold">Checkout Trigger Date</span><span className="font-mono text-gray-600">{fine.borrowedDate}</span></div>
              </div>
            </div>

            {/* Penalty Calculation */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-teal-600" /> Penalty Matrix Audit
              </h4>
              <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-gray-500 font-bold text-3xs uppercase border-b border-slate-100">
                      <th className="p-2.5">Clause</th>
                      <th className="p-2.5 text-center">Days</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium">
                    <tr>
                      <td className="p-2.5 text-gray-700">Standard Plan</td>
                      <td className="p-2.5 text-center font-mono">{breakdown.withinPlanDays}d</td>
                      <td className="p-2.5 text-right font-mono text-slate-900">₹{breakdown.withinPlanFine}.00</td>
                    </tr>
                    {breakdown.outsidePlanDays > 0 && (
                      <tr className="bg-rose-50/50">
                        <td className="p-2.5 text-rose-900 font-semibold flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-rose-600" /> Out-of-Plan
                        </td>
                        <td className="p-2.5 text-center font-mono text-rose-900 font-bold">{breakdown.outsidePlanDays}d</td>
                        <td className="p-2.5 text-right font-mono text-rose-900 font-bold">₹{breakdown.outsidePlanFine}.00</td>
                      </tr>
                    )}
                    <tr className="bg-slate-900 text-white font-bold text-sm">
                      <td colSpan={2} className="p-2.5 text-right uppercase tracking-wider text-xs text-slate-400">Total:</td>
                      <td className="p-2.5 text-right font-mono text-amber-400">₹{fine.fine_amount}.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-gray-100 grid grid-cols-2 gap-3">
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center gap-2 py-2 px-4 bg-white border border-rose-200 text-rose-600 font-bold text-xs rounded-xl hover:bg-rose-50 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Record
            </button>
            <button 
              onClick={() => onSettle(fine)}
              className="flex items-center justify-center gap-2 py-2 px-4 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-700 transition-all cursor-pointer shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Pay Now
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
          onClose(); // Close parent modal after delete
        }}
        memberName={fine.memberName}
        amount={fine.fine_amount}
      />
    </>
  );
};