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
      {/* High contrast bright layout backdrops with light frosting filters */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs font-sans">
        <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl transition-all overflow-hidden border border-amber-100 flex flex-col max-h-[90vh]">
          
          {/* Header Grid Framework - Clean Bright Banner */}
          <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-900">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {showRenewalScreen ? "Renew Membership Plan" : "Member Details"}
            </h3>
            <button 
              onClick={() => { setShowRenewalScreen(false); onClose(); }}
              className="text-slate-400 hover:text-slate-900 transition-colors text-base font-bold cursor-pointer p-1.5 hover:bg-slate-100 rounded-lg"
            >
              ✕
            </button>
          </div>

          {/* Content Box Switcher Container */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
            {!showRenewalScreen ? (
              /* SCREEN A: DETAILED ACCOUNT OVERVIEW INFO CARD */
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 tracking-tight">{member.name}</h4>
                    <p className="text-xs text-slate-400 font-bold mt-1 tracking-wide uppercase">
                      ID: REGISTER-{member.id ? member.id.split("-").pop()?.slice(-4).toUpperCase() : "0000"}
                    </p>
                  </div>
                  <span className={`self-start sm:self-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                    member.isActive 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}>
                    {member.isActive ? "Plan: Active" : "Plan: Expired"}
                  </span>
                </div>

                <hr className="border-slate-100" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 text-sm">
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Email Address</span>
                    <span className="font-semibold text-slate-900 mt-1 block select-all text-base">{member.email}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Phone Number</span>
                    <span className="font-semibold text-slate-900 mt-1 block select-all text-base">{member.phoneNumber || "No Verified Phone"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Current Active Plan</span>
                    <div className="mt-1.5">
                      <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/40">
                        {member.membershipPlanName}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Plan Expiry Date</span>
                    <span className="font-bold text-slate-900 mt-1 block text-base">
                      {member.expiryDate}
                    </span>
                  </div>
                </div>

                {/* Operations Layout Interface */}
                <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDeleteOpen(true)}
                    className="px-4 py-2.5 text-xs font-bold text-rose-700 uppercase tracking-wide hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-all cursor-pointer text-left sm:text-center"
                  >
                    Delete Account
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlanId(member.membershipPlanId);
                      setShowRenewalScreen(true);
                    }}
                    className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-amber-50 text-sm font-bold rounded-xl transition-all cursor-pointer shadow-sm text-center"
                  >
                    Renew Membership Plan
                  </button>
                </div>
              </div>
            ) : (
              /* SCREEN B: DYNAMIC RENEWAL INPUT SCREEN */
              <form onSubmit={handleRenewSubmit} className="space-y-6">
                <div className="p-4 bg-amber-50/60 border border-amber-200/60 rounded-xl text-sm text-slate-600 font-medium leading-relaxed">
                  You are renewing the subscription plan for <span className="text-slate-900 font-bold">{member.name}</span>. 
                  Submitting this update logs the start date as <span className="text-slate-900 font-bold">Today</span> and automatically assigns the corresponding contract validation cycles.
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Select Membership Plan
                  </label>
                  <select
                    required
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-sm font-semibold outline-none cursor-pointer focus:bg-white focus:border-slate-400 transition-all"
                  >
                    <option value="" className="text-slate-400">Select an option...</option>
                    {plans.map((p: MembershipPlan & { plan_name?: string }) => {
                      const planData = (p as unknown) as Record<string, unknown>;
                      const fallbackId = planData.membership_plan_id || planData.id;
                      const fallbackName = planData.plan_name || planData.name || "Unnamed Tier";
                      
                      return (
                        <option key={String(fallbackId)} value={String(fallbackId)}>
                          {String(fallbackName).toUpperCase()}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Renewal Control Actions */}
                <div className="pt-5 border-t border-slate-100 flex justify-end gap-3 text-xs font-bold tracking-wide">
                  <button
                    type="button"
                    onClick={() => setShowRenewalScreen(false)}
                    className="px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl transition-all hover:bg-slate-100 cursor-pointer"
                  >
                    Back to Profile
                  </button>
                  <button
                    type="submit"
                    disabled={isRenewing || !selectedPlanId}
                    className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-amber-50 rounded-xl transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                  >
                    {isRenewing ? "Activating..." : "Activate New Plan"}
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