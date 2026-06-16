import { useState } from "react";
import type { ExtendedPlan } from "../pages/ManagePlan";
import { PlanModal } from "./PlanModal";
import { DeletePlanModal } from "./DeletePlanModal";

interface PlanDetailsModalProps {
  isOpen: boolean;
  plan: ExtendedPlan | null;
  onClose: () => void;
}

export const PlanDetailsModal = ({
  isOpen,
  plan,
  onClose,
}: PlanDetailsModalProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !plan) return null;

  const displayId = plan.membership_plan_id?.slice(-4).toUpperCase() || "0000";

  return (
  <>
    {/* High-contrast background overlay with clean backdrop filter */}
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm font-sans select-none animate-fade-in text-left">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl transition-all overflow-hidden border border-gray-200 flex flex-col max-h-[90vh] animate-zoom-in">
        
        {/* Header Framework - Matching Reference Layout */}
        <div className="flex items-center justify-between border-b border-gray-200 p-5 bg-white">
          <div>
            <h3 className="text-lg font-bold text-[#1A365D] tracking-tight">
              Plan Details
            </h3>
            <p className="text-[11px] text-[#718096] font-bold mt-1 tracking-wider uppercase">
              Plan ID: PLAN-{displayId}
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

        {/* Details Body Context Frame */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#2D3748]">
          <div className="space-y-6">
            
            {/* Plan Name Block */}
            <div>
              <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                Plan Name
              </span>
              <span className="font-bold text-xl text-[#1A365D] tracking-tight mt-1 block select-all">
                {plan.plan_name}
              </span>
            </div>

            <hr className="border-gray-100" />

            {/* Properties Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 text-sm">
              <div>
                <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                  Duration Matrix
                </span>
                <span className="font-semibold text-[#1A365D] mt-1 block select-all text-sm">
                  {plan.duration_days} Days
                </span>
              </div>
              
              <div>
                <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                  Max Limit Allocation
                </span>
                <span className="font-semibold text-[#1A365D] mt-1 block select-all text-sm">
                  {plan.max_books_allowed} Books
                </span>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                  Plan Value Tier
                </span>
                <div className="mt-1.5">
                  <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-[#2D3748] border border-gray-200">
                    ₹{plan.price}
                  </span>
                </div>
              </div>
            </div>

            {/* Operations Layout Action Buttons matching reference spec perfectly */}
            <div className="pt-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-xs font-bold text-rose-600 uppercase tracking-wider hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-all cursor-pointer text-left sm:text-center"
              >
                Delete Plan
              </button>

              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="px-5 py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm text-center tracking-wide"
              >
                Edit Plan Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Sub-Modal Layer Engines */}
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
);}