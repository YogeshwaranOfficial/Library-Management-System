import React, { useState } from "react";
import type { LibraryMember, MembershipPlan } from "../../../types/members";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal"; 

interface MemberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: LibraryMember | null;
  plans: MembershipPlan[];
  onRenew: (planId: string) => void;
  onDelete: (id: string) => void;
  isRenewing: boolean;
}

export const MemberDetailsModal: React.FC<MemberDetailsModalProps> = ({
  isOpen,
  onClose,
  member,
  plans,
  onRenew,
  onDelete,
  isRenewing,
}) => {
  const [showRenewalScreen, setShowRenewalScreen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  // Controls the conditional view overlays of the delete modal safely
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (!isOpen || !member) return null;

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) return;
    onRenew(selectedPlanId);
    setShowRenewalScreen(false);
    setSelectedPlanId("");
  };

  const handleConfirmDelete = () => {
    onDelete(member.id);
    setIsDeleteOpen(false); // Close the sub-modal overlay
    onClose();             // Close the master profile drawer together
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-secondary/40 p-4 backdrop-blur-xs font-sans">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl transition-all overflow-hidden border border-slate-light/10 flex flex-col max-h-[90vh]">
          
          {/* Header Grid Framework */}
          <div className="flex items-center justify-between border-b border-slate-light/10 p-5 bg-canvas-dominant/60">
            <h3 className="text-base font-bold text-slate-secondary tracking-tight">
              {showRenewalScreen ? "✨ Renew Membership Plan" : "📇 Member Profile"}
            </h3>
            <button 
              onClick={() => { setShowRenewalScreen(false); onClose(); }}
              className="text-slate-light hover:text-slate-secondary transition-colors text-sm font-bold cursor-pointer p-1"
            >
              ✕
            </button>
          </div>

          {/* Content Box Switcher Container */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-secondary">
            {!showRenewalScreen ? (
              /* SCREEN A: DETAILED ACCOUNT OVERVIEW INFO CARD */
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-xl font-extrabold text-slate-secondary tracking-tight">{member.name}</h4>
                    <p className="text-xs text-slate-light font-bold font-data mt-1 tracking-wide">
                      Member ID: #MEMBER-{member.id ? member.id.split("-").pop()?.slice(-4).toUpperCase() : "0000"}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    member.isActive 
                      ? "bg-sage-primary/10 text-sage-primary border border-sage-primary/20" 
                      : "bg-utility-crimson/10 text-utility-crimson border border-utility-crimson/20"
                  }`}>
                    {member.isActive ? "Plan: Active" : "Plan: Expired"}
                  </span>
                </div>

                <hr className="border-slate-light/10" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 text-sm font-data">
                  <div>
                    <span className="block text-xs font-bold text-slate-light uppercase tracking-wider font-sans">Email Address</span>
                    <span className="font-semibold text-slate-secondary mt-1 block select-all">{member.email}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-light uppercase tracking-wider font-sans">Phone Number</span>
                    <span className="font-semibold text-slate-secondary mt-1 block select-all">{member.phoneNumber || "No Verified Phone"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-light uppercase tracking-wider font-sans">Current Active Plan</span>
                    <div className="mt-1.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-sage-primary/10 text-sage-primary border border-sage-primary/20 font-sans tracking-wide">
                        {member.membershipPlanName}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-light uppercase tracking-wider font-sans">Plan Expiry Date</span>
                    <span className="font-bold text-slate-secondary mt-1 block">
                      {member.expiryDate}
                    </span>
                  </div>
                </div>

                {/* Operations Layout Interface */}
                <div className="pt-4 border-t border-slate-light/10 flex justify-between items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDeleteOpen(true)}
                    className="px-3 py-2 text-xs font-bold text-utility-crimson hover:bg-utility-crimson/10 rounded-xl transition-all cursor-pointer"
                  >
                    🗑️ Delete Account
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlanId(member.membershipPlanId);
                      setShowRenewalScreen(true);
                    }}
                    className="px-4 py-2.5 bg-sage-primary hover:bg-sage-primary/90 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    🔄 Renew Membership Plan
                  </button>
                </div>
              </div>
            ) : (
              /* SCREEN B: DYNAMIC RENEWAL INPUT SCREEN */
              <form onSubmit={handleRenewSubmit} className="space-y-5">
                <div className="p-4 bg-sage-primary/10 border border-sage-primary/20 rounded-xl text-xs text-slate-secondary font-semibold leading-relaxed">
                  ℹ️ You are renewing the subscription plan for <b className="text-sage-primary font-bold">{member.name}</b>. 
                  Submitting this update logs the start date as <b className="font-data">Today</b> and automatically assigns the corresponding contract validation cycles.
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-light uppercase tracking-wider">
                    Select Membership Plan
                  </label>
                  <select
                    required
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-canvas-dominant border border-slate-light/10 text-slate-secondary rounded-xl text-sm font-semibold outline-hidden cursor-pointer focus:bg-white focus:ring-4 focus:ring-sage-primary/10 focus:border-sage-primary"
                  >
                    <option value="">All Membership Plans</option>
                    {plans.map((p: MembershipPlan & { plan_name?: string }) => {
                      const planData = (p as unknown) as Record<string, unknown>;
                      const fallbackId = planData.membership_plan_id || planData.id;
                      const fallbackName = planData.plan_name || planData.name || "Unnamed Tier";
                      
                      return (
                        <option key={String(fallbackId)} value={String(fallbackId)} className="font-data">
                          {String(fallbackName)}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Renewal Control Actions */}
                <div className="pt-4 border-t border-slate-light/10 flex justify-end gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setShowRenewalScreen(false)}
                    className="px-4 py-2 bg-canvas-dominant border border-slate-light/10 text-slate-secondary rounded-xl transition-all hover:bg-slate-light/5 cursor-pointer"
                  >
                    Back to Profile
                  </button>
                  <button
                    type="submit"
                    disabled={isRenewing || !selectedPlanId}
                    className="px-5 py-2.5 bg-sage-primary hover:bg-sage-primary/90 text-white rounded-xl transition-all disabled:bg-slate-light/20 disabled:text-slate-light/50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isRenewing ? "Activating..." : "🚀 Activate New Plan"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* CUSTOM DELETE CONFIRMATION INTERFACE MODAL OVERLAY */}
      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        memberName={member.name}
      />
    </>
  );
};