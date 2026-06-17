import React, { useState } from "react";
import type { LibraryMember, MembershipPlan, SystemUser } from "../../../types/members";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { MemberModal } from "./MemberModal"; 
import type { MemberFormValues } from "../schemas/memberSchema";

interface MemberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: LibraryMember | null;
 plans: {
    data: MembershipPlan[];
    meta?: {
      globalActiveMembers?: number;
      globalInactiveMembers?: number;
      total?: number;
    };
  } | MembershipPlan[];
  onRenew: (planId: string) => void;
  onDelete: (id: string) => void;
  isRenewing: boolean;
  users?: SystemUser[]; 
}

export const MemberDetailsModal: React.FC<MemberDetailsModalProps> = ({
  isOpen,
  onClose,
  member,
  plans,
  onRenew,
  onDelete,
  users = [],
}) => {
  const [showRenewalScreen, setShowRenewalScreen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (!isOpen || !member) return null;

  // Defensive array handling matching parent layouts safely
  const safePlans = Array.isArray(plans) ? plans : [];

  // Handle the standardized submit handler matching react-hook-form schema expectations
  const handleRenewSubmit = (formData: MemberFormValues) => {
    if (!formData.membershipPlanId) return;
    onRenew(formData.membershipPlanId);
    setShowRenewalScreen(false);
  };

  const handleConfirmDelete = () => {
    onDelete(member.id);
    setIsDeleteOpen(false); 
    onClose(); 
  };

  /* SCREEN B Variant: If the renewal action layout flag is tripped, 
     we render the full specialized unified MemberModal layout right in place.
  */
  if (showRenewalScreen) {
    return (
      <MemberModal
        isOpen={isOpen}
        onClose={() => setShowRenewalScreen(false)}
        onSubmit={handleRenewSubmit}
        plans={safePlans}
        users={users}
        editingMember={member} // Pass the member object here to safely trigger the Renew parameters
      />
    );
  }

  return (
    <>
      {/* High-contrast background overlay with clean backdrop filter */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm font-sans select-none">
        <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl transition-all overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]">
          
          {/* Header Framework - Matching Manage Page Depth */}
          <div className="flex items-center justify-between border-b border-gray-200 p-5 bg-white">
            <h3 className="text-lg font-bold text-[#1A365D] tracking-tight">
              Member Details
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowRenewalScreen(false);
                onClose();
              }}
              className="text-[#718096] hover:text-[#1A365D] hover:bg-gray-100 transition-all text-xs font-bold cursor-pointer p-1.5 rounded-full"
            >
              ✕
            </button>
          </div>

          {/* SCREEN A: DETAILED ACCOUNT OVERVIEW INFO CARD */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#2D3748]">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xl font-bold text-[#1A365D] tracking-tight">
                    {member.name}
                  </h4>
                  <p className="text-[11px] text-[#718096] font-bold mt-1 tracking-wider uppercase">
                    ID: REGISTER-
                    {member.id
                      ? member.id.split("-").pop()?.slice(-4).toUpperCase()
                      : "0000"}
                  </p>
                </div>
                <span
                  className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold select-none ${
                    member.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${member.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                  {member.isActive ? "Active" : "Expired"}
                </span>
              </div>

              <hr className="border-gray-100" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 text-sm">
                <div>
                  <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                    Email Address
                  </span>
                  <span className="font-semibold text-[#1A365D] mt-1 block select-all text-sm">
                    {member.email}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                    Phone Number
                  </span>
                  <span className="font-semibold text-[#1A365D] mt-1 block select-all text-sm">
                    {member.phoneNumber || "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                    Current Active Plan
                  </span>
                  <div className="mt-1.5">
                    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-[#2D3748] border border-gray-200">
                      {member.membershipPlanName}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                    Plan Expiry Date
                  </span>
                  <span className="font-semibold text-[#2D3748] mt-1.5 block text-sm">
                    {member.expiryDate}
                  </span>
                </div>
              </div>

              {/* Operations Layout Action Buttons */}
              <div className="pt-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(true)}
                  className="px-4 py-2 text-xs font-bold text-rose-600 uppercase tracking-wider hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-all cursor-pointer text-left sm:text-center"
                >
                  Delete Account
                </button>

                <button
                  type="button"
                  onClick={() => setShowRenewalScreen(true)}
                  className="px-5 py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm text-center tracking-wide"
                >
                  Renew Membership Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OVERLAY INTERFACE SUB-MODAL */}
      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        memberName={member.name}
      />
    </>
  );
};