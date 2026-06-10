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
      <div className="fixed inset-0 bg-slate-secondary/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in text-left">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-light/10 animate-zoom-in text-slate-secondary">
          
          <div className="bg-slate-secondary px-6 py-5 text-white flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider">Plan Details</h3>
              <p className="font-data text-[10px] text-white tracking-widest mt-0.5">Plan ID: PLAN-{displayId}</p>
            </div>
            <button 
              type="button"
              onClick={onClose} 
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-light hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <span className="text-slate-light block text-[9px] uppercase font-black tracking-wider">Plan Name</span>
              <div className="text-sm font-black text-slate-secondary bg-canvas-dominant p-3 rounded-xl border border-slate-light/5 flex items-center gap-2">
                <Layers size={14} className="text-rose-600 shrink-0" />
                <span>{plan.plan_name}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-canvas-dominant p-3.5 rounded-xl border border-slate-light/5 space-y-1">
                <span className="text-slate-light text-[9px] uppercase font-black tracking-wider flex items-center gap-1">
                  <Calendar size={10} /> Duration (Days)
                </span>
                <span className="font-data font-black text-slate-secondary text-sm block">{plan.duration_days} Days</span>
              </div>

              <div className="bg-canvas-dominant p-3.5 rounded-xl border border-slate-light/5 space-y-1">
                <span className="text-slate-light text-[9px] uppercase font-black tracking-wider flex items-center gap-1">
                  <BookOpen size={10} /> Max Limit
                </span>
                <span className="font-data font-black text-slate-secondary text-sm block">{plan.max_books_allowed} Books</span>
              </div>
            </div>

            <div className="bg-slate-secondary text-white p-4 rounded-xl flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="text-[9px] text-white uppercase font-black tracking-wider flex items-center gap-1">
                  <IndianRupee size={10} /> Plan Price
                </span>
              </div>
              <span className="font-data font-black text-xl text-amber-400">₹{plan.price}</span>
            </div>
          </div>

          <div className="p-4 bg-canvas-dominant border-t border-slate-light/10 grid grid-cols-2 gap-3">
            <button 
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-white border border-rose-200/60 text-rose-600 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-rose-50 transition-all cursor-pointer shadow-3xs"
            >
              <Trash2 size={12} /> Delete Plan
            </button>
            <button 
              type="button"
              onClick={() => setShowEditModal(true)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-secondary hover:bg-slate-secondary/90 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Settings size={12} /> Edit Plan
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