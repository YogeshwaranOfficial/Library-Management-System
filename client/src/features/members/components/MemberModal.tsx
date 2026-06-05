import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MemberFormSchema, type MemberFormValues } from "../schemas/memberSchema";
import type { SystemUser, MembershipPlan, LibraryMember } from "../../../types/members";

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MemberFormValues) => void;
  users: SystemUser[];
  plans: MembershipPlan[];
  editingMember?: LibraryMember | null;
}

export const MemberModal = ({ isOpen, onClose, onSubmit, users, plans, editingMember }: MemberModalProps) => {
  const { register, handleSubmit, control, setValue, reset, formState: { errors } } = useForm<MemberFormValues>({
    resolver: zodResolver(MemberFormSchema),
    defaultValues: { userId: "", email: "", phoneNumber: "", membershipPlanId: "", isActive: true }
  });

  const selectedUserId = useWatch({
    control,
    name: "userId"
  });

  // 1. Autofill user details AND clear them out safely if user choice becomes empty
useEffect(() => {
  if (!editingMember) {
    if (selectedUserId) {
      const selectedUser = users.find(u => u.id === selectedUserId);
      if (selectedUser) {
        setValue("email", selectedUser.email);
        setValue("phoneNumber", selectedUser.phoneNumber);
      }
    } else {
      // 💡 FIX: Reset text fields cleanly if user clears selection back to normal
      setValue("email", "");
      setValue("phoneNumber", "");
    }
  }
}, [selectedUserId, users, setValue, editingMember]);

// 2. Clear/Reset form completely every single time the modal opens or shifts modes
useEffect(() => {
  if (isOpen) {
    if (editingMember) {
      reset({
        userId: editingMember.userId,
        email: editingMember.email,
        phoneNumber: editingMember.phoneNumber,
        membershipPlanId: editingMember.membershipPlanId,
        isActive: editingMember.isActive
      });
    } else {
      // 💡 FIX: Forces deep wipe every time Create Mode opens up fresh
      reset({ 
        userId: "", 
        email: "", 
        phoneNumber: "", 
        membershipPlanId: "", 
        isActive: true 
      });
    }
  }
}, [isOpen, editingMember, reset]);

  if (!isOpen) return null;

  // 💡 Check if there are no available users left to turn into subscriber members
  const hasNoAvailableUsers = users.length === 0;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 animate-zoom-in">
        <div className="bg-teal-600 p-5 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">{editingMember ? "Renew Membership Plan" : "Add new member"}</h3>
          <button onClick={onClose} className="text-teal-200 hover:text-white transition-colors cursor-pointer text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">
              Select Library Reader Account
            </label>
            
            {/* 💡 Dynamic Fallback Dropdown state manipulation */}
            <select
              {...register("userId")}
              disabled={!!editingMember || hasNoAvailableUsers}
              className={`w-full px-3 py-2 border rounded-xl text-sm outline-hidden transition-all focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-600 disabled:opacity-60 ${
                hasNoAvailableUsers && !editingMember
                  ? "bg-amber-50/60 border-amber-200 text-amber-800 font-medium" 
                  : "bg-gray-50 border-gray-200 text-gray-900"
              }`}
            >
              {editingMember ? (
                <option value="">Current Member Locked</option>
              ) : hasNoAvailableUsers ? (
                <option value="">⚠️ No new users available to register</option>
              ) : (
                <>
                  <option value="">Choose User Profile...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </>
              )}
            </select>
            {errors.userId && <p className="text-xs text-red-500 mt-1 font-medium">{errors.userId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Email id</label>
              <input type="text" {...register("email")} readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 outline-hidden focus:ring-0" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Phone Number</label>
              <input type="text" {...register("phoneNumber")} readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 outline-hidden focus:ring-0" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">Choose Membership Plan</label>
            <select
              {...register("membershipPlanId")}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-600"
            >
              <option value="">All Membership Plan</option>
              {plans.map(p => <option key={p.membership_plan_id} value={p.membership_plan_id}>{p.plan_name} ({p.duration_days} Days)</option>)}
            </select>
            {errors.membershipPlanId && <p className="text-xs text-red-500 mt-1 font-medium">{errors.membershipPlanId.message}</p>}
          </div>

          {editingMember && (
            <div className="flex items-center justify-between p-3 bg-teal-50/50 border border-teal-100 rounded-xl">
              <div>
                <span className="text-xs font-bold text-teal-900 block">Re-activate / Membership Continuity Toggle</span>
                <span className="text-xs text-teal-700">Updating values shifts account validation cycles to today's parameters.</span>
              </div>
              <input type="checkbox" {...register("isActive")} className="w-4 h-4 text-teal-600 border-gray-300 rounded-sm focus:ring-teal-500" />
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">Cancel</button>
            <button 
              type="submit" 
              disabled={hasNoAvailableUsers && !editingMember}
              className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed shadow-sm rounded-xl transition-all cursor-pointer"
            >
              {editingMember ? "Update Changes" : "Create Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};