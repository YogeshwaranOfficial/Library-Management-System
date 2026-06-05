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
  // 🌟 NEW STATE: Controls the conditional view overlays of the delete modal safely
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl transition-all overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
          
          {/* Header Grid */}
          <div className="flex items-center justify-between border-b border-gray-100 p-5 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">
              {showRenewalScreen ? "✨ Renew Membership Plan" : "📇 Member Profile"}
            </h3>
            <button 
              onClick={() => { setShowRenewalScreen(false); onClose(); }}
              className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-medium cursor-pointer p-1"
            >
              ✕
            </button>
          </div>

          {/* Content Box Switcher */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {!showRenewalScreen ? (
              /* SCREEN A: DETAILED ACCOUNT OVERVIEW INFO CARD */
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-2xl font-black text-gray-900 tracking-tight">{member.name}</h4>
                    <p className="text-sm text-gray-500 font-mono mt-0.5">
                      Member ID: #MEMBER-{member.id ? member.id.split("-").pop()?.slice(-4).toUpperCase() : "0000"}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    member.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}>
                    {member.isActive ? "Plan: Active" : "Plan: Expired"}
                  </span>
                </div>

                <hr className="border-gray-100" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</span>
                    <span className="font-semibold text-gray-800 mt-1 block">{member.email}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</span>
                    <span className="font-semibold text-gray-800 mt-1 block">{member.phoneNumber || "No Verified Phone"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Current Active Plan</span>
                    <span className="mt-1 inline-block px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-teal-50 text-teal-800 border border-teal-100">
                      {member.membershipPlanName}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Plan Expiry Date</span>
                    <span className="font-medium text-gray-600 mt-1 block">
                      <b className="text-gray-900">{member.expiryDate}</b>
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center gap-3">
                  {/* 💡 FIXED: Alert replaced! Clicking this triggers our clean state flag instead of window.confirm */}
                  <button
                    type="button"
                    onClick={() => setIsDeleteOpen(true)}
                    className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                  >
                    🗑️ Delete Account
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlanId(member.membershipPlanId);
                      setShowRenewalScreen(true);
                    }}
                    className="px-5 py-2.5 bg-teal-brand hover:bg-teal-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    🔄 Renew Membership Plan
                  </button>
                </div>
              </div>
            ) : (
              /* SCREEN B: DYNAMIC RENEWAL INPUT SCREEN */
              <form onSubmit={handleRenewSubmit} className="space-y-5">
                <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-xl text-xs text-amber-800 font-medium leading-relaxed">
                  ℹ️ You are renewing the subscription plan for <b>{member.name}</b>. 
                  Submitting this update logs the start date as <b>Today</b> and automatically assigns the expiry date.
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Select Membership Plan
                  </label>
                  <select
                    required
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand"
                  >
                    <option value="">All Membership Plans</option>
                    {plans.map((p: MembershipPlan & { plan_name?: string }) => {
                      const planData = (p as unknown) as Record<string, unknown>;
                      const fallbackId = planData.membership_plan_id || planData.id;
                      const fallbackName = planData.plan_name || planData.name || "Unnamed Tier";
                      
                      return (
                        <option key={String(fallbackId)} value={String(fallbackId)}>
                          {String(fallbackName)}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setShowRenewalScreen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all cursor-pointer"
                  >
                    Back to Profile
                  </button>
                  <button
                    type="submit"
                    disabled={isRenewing || !selectedPlanId}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isRenewing ? "Activating..." : "🚀 Activate New Plan"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 🌟 CUSTOM CONFIRMATION LAYER ACCESSIBLE VIA FLOATING PORTALS */}
      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        memberName={member.name}
      />
    </>
  );
};