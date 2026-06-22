import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MemberFormSchema,
  type MemberFormValues,
} from "../schemas/memberSchema";
import type {
  SystemUser,
  MembershipPlan,
  LibraryMember,
} from "../../../types/members";

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MemberFormValues) => void;
  users: SystemUser[];
  plans: {
    data: MembershipPlan[];
    meta?: {
      globalActiveMembers?: number;
      globalInactiveMembers?: number;
      total?: number;
    };
  } | MembershipPlan[];
  editingMember?: LibraryMember | null;
}

export const MemberModal = ({
  isOpen,
  onClose,
  onSubmit,
  users = [],
  plans = [],
  editingMember,
}: MemberModalProps) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(MemberFormSchema),
    defaultValues: {
      userId: "",
      email: "",
      phoneNumber: "",
      membershipPlanId: "",
      isActive: true,
    },
  });


  const selectedUserId = useWatch({
    control,
    name: "userId",
  });

  // Autofill user details safely if matching configuration exists
  useEffect(() => {
    if (!editingMember && Array.isArray(users)) {
      if (selectedUserId) {
        const selectedUser = users.find((u) => u.id === selectedUserId);
        if (selectedUser) {
          setValue("email", selectedUser.email);
          setValue("phoneNumber", selectedUser.phoneNumber);
        }
      } else {
        setValue("email", "");
        setValue("phoneNumber", "");
      }
    }
  }, [selectedUserId, users, setValue, editingMember]);

  // Reset form properties context-safely when changing state modes
  useEffect(() => {
    if (isOpen) {
      if (editingMember) {
        reset({
          userId: editingMember.userId,
          email: editingMember.email,
          phoneNumber: editingMember.phoneNumber,
          membershipPlanId: editingMember.membershipPlanId,
          isActive: editingMember.isActive,
        });
      } else {
        reset({
          userId: "",
          email: "",
          phoneNumber: "",
          membershipPlanId: "",
          isActive: true,
        });
      }
    }
  }, [isOpen, editingMember, reset]); // Fixed typo here (removed 'tracks')

  if (!isOpen) return null;

  // Safeguard array checks before evaluating lengths and mappings
  const safeUsers = Array.isArray(users) ? users : [];
  
  
  // Cleaned Adaptive Extraction Engine to correctly resolve flat arrays or sub-objects
  const safePlans: MembershipPlan[] = Array.isArray(plans)
    ? plans
    : (plans && typeof plans === "object" && "data" in plans && Array.isArray(plans.data))
      ? plans.data
      : [];


  const hasNoAvailableUsers = safeUsers.length === 0;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans select-none">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-200">
        
        {/* Modal Branding Header Block */}
        <div className="bg-white border-b border-gray-200 p-5 flex justify-between items-center">
          <h3 className="text-lg text-[#1A365D] font-bold tracking-tight">
            {editingMember ? `Renew Membership — ${editingMember.name}` : "Add New Member"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#718096] hover:text-[#1A365D] transition-colors cursor-pointer text-xs font-bold p-1.5 hover:bg-gray-100 rounded-full"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-5 text-[#2D3748]"
        >
          {/* ==================== ADD MODE ELEMENTS ONLY ==================== */}
          {!editingMember && (
            <>
              {/* Form Input: Library User Profiling Dropdown */}
              <div>
                <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest block mb-1.5">
                  Select Library Reader Account
                </label>
                <select
                  {...register("userId")}
                  disabled={hasNoAvailableUsers}
                  className={`w-full px-4 py-2.5 border rounded-xl text-xs font-semibold outline-hidden transition-all focus:ring-0 ${
                    hasNoAvailableUsers
                      ? "bg-rose-50 border-rose-200 text-rose-700 font-bold"
                      : "bg-gray-50 border-gray-200 text-[#2D3748] focus:bg-white focus:border-gray-300"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {hasNoAvailableUsers ? (
                    <option value="">No options remaining to register</option>
                  ) : (
                    <>
                      <option value="">Choose User Profile...</option>
                      {safeUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name.toUpperCase()}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                {errors.userId && (
                  <p className="text-xs text-rose-600 mt-1.5 font-semibold">
                    {errors.userId.message}
                  </p>
                )}
              </div>

              {/* Form Meta Display Grid (Auto Filled - Read Only) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest block mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="text"
                    {...register("email")}
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#718096] font-semibold outline-hidden cursor-not-allowed select-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest block mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    {...register("phoneNumber")}
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#718096] font-semibold outline-hidden cursor-not-allowed select-all"
                  />
                </div>
              </div>
            </>
          )}

          {/* ==================== CORE PLAN CONFIG FIELD (SHARED/RENEW MODE) ==================== */}
          <div>
            <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest block mb-1.5">
              Choose Membership Plan
            </label>
            <select
              {...register("membershipPlanId")}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-[#2D3748] rounded-xl text-xs font-semibold outline-hidden transition-all focus:bg-white focus:border-gray-300 focus:ring-0 cursor-pointer"
            >
              <option value="">Select a plan...</option>
              {safePlans.map((p) => (
                <option key={p.membership_plan_id} value={p.membership_plan_id}>
                  {p.plan_name.toUpperCase()} ({p.duration_days} DAYS)
                </option>
              ))}
            </select>
            {errors.membershipPlanId && (
              <p className="text-xs text-rose-600 mt-1.5 font-semibold">
                {errors.membershipPlanId.message}
              </p>
            )}
          </div>

          {/* Action Operations Footer Segment */}
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 text-xs font-bold tracking-wide">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 text-[#718096] hover:text-[#1A365D] rounded-full transition-all hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!editingMember && hasNoAvailableUsers}
              className="px-5 py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white rounded-full transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer shadow-sm tracking-wide"
            >
              {editingMember ? "Renew Plan" : "Create Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};