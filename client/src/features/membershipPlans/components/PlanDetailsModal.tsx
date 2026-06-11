import { useState } from "react";
import type { MembershipPlan } from "../pages/ManagePlan";
import { X, Layers, Calendar, BookOpen, Settings, Trash2, IndianRupee } from "lucide-react";
import { PlanModal } from "./PlanModal";
import { DeletePlanModal } from "./DeletePlanModal";

interface PlanDetailsModalProps {
  isOpen: boolean;
  plan: MembershipPlan | null;
  onClose: () => void;
}

export const PlanDetailsModal = ({ isOpen, plan, onClose }: PlanDetailsModalProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !plan) return null;

  const displayId = plan.membership_plan_id?.slice(-4).toUpperCase() || "0000";

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in text-left">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-amber-100/80 animate-zoom-in text-slate-700">
          
          {/* Header Strip Layer */}
          <div className="text-white border-b border-slate-100 px-6 py-5 bg-slate-900 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold uppercase tracking-wide">Plan Details</h3>
              <p className="font-mono text-xs text-slate-400 tracking-wider mt-0.5">Plan ID: PLAN-{displayId}</p>
            </div>
            <button 
              type="button"
              onClick={onClose} 
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Details Body Context Frame */}
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <span className="text-slate-400 block text-xs uppercase font-bold tracking-wide">Plan Name</span>
              <div className="text-base font-bold text-slate-900 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 flex items-center gap-2">
                <Layers size={16} className="text-amber-500 shrink-0" />
                <span>{plan.plan_name}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-xs uppercase font-bold tracking-wide flex items-center gap-1">
                  <Calendar size={12} /> Duration (Days)
                </span>
                <span className="font-mono font-bold text-slate-900 text-base block">{plan.duration_days} Days</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-1">
                <span className="text-slate-400 text-xs uppercase font-bold tracking-wide flex items-center gap-1">
                  <BookOpen size={12} /> Max Limit
                </span>
                <span className="font-mono font-bold text-slate-900 text-base block">{plan.max_books_allowed} Books</span>
              </div>
            </div>

            {/* High Impact Pricing Plate */}
            <div className="bg-slate-900 text-white p-5 rounded-xl flex justify-between items-center shadow-sm">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1">
                  <IndianRupee size={12} /> Plan Price
                </span>
              </div>
              <span className="font-mono font-bold text-2xl text-amber-400">₹{plan.price}</span>
            </div>
          </div>

          {/* Core Configuration Control Base Actions */}
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs font-bold tracking-wide">
            <button 
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center gap-1.5 py-3 px-4 bg-white border border-rose-200 text-rose-600 uppercase rounded-xl hover:bg-rose-50 transition-all cursor-pointer shadow-sm"
            >
              <Trash2 size={14} /> Delete Plan
            </button>
            <button 
              type="button"
              onClick={() => setShowEditModal(true)}
              className="flex items-center justify-center gap-1.5 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-amber-50 uppercase rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <Settings size={14} /> Edit Plan
            </button>
          </div>

        </div>
      </div>

      {showEditModal && (
        <PlanModal 
          isOpen={showEditModal} 
          mode="edit" 
          plan={plan} 
          onClose={() => {
            setShowEditModal(false);
            onClose();
          }} 
        />
      )}

      {showDeleteConfirm && (
        <DeletePlanModal 
          isOpen={showDeleteConfirm} 
          planId={plan.membership_plan_id} 
          planName={plan.plan_name} 
          onClose={() => setShowDeleteConfirm(false)} 
          onSuccessRedirect={() => {
            setShowDeleteConfirm(false);
            onClose();
          }}
        />
      )}
    </>
  );
};