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

  // Autofill user details when a user profile is selected
  useEffect(() => {
    if (selectedUserId && !editingMember) {
      const selectedUser = users.find(u => u.id === selectedUserId);
      if (selectedUser) {
        setValue("email", selectedUser.email);
        setValue("phoneNumber", selectedUser.phoneNumber);
      }
    }
  }, [selectedUserId, users, setValue, editingMember]);

  // Populate data when editing an existing profile
  useEffect(() => {
    if (editingMember) {
      reset({
        userId: editingMember.userId,
        email: editingMember.email,
        phoneNumber: editingMember.phoneNumber,
        membershipPlanId: editingMember.membershipPlanId,
        isActive: editingMember.isActive
      });
    } else {
      reset({ userId: "", email: "", phoneNumber: "", membershipPlanId: "", isActive: true });
    }
  }, [editingMember, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-ocean-blue/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 animate-zoom-in">
        <div className="bg-linear-to-r from-ocean-light to-ocean-blue p-5 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">{editingMember ? "Renew / Modify Membership Tier" : "Onboard New Library Member"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors cursor-pointer text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">System Profile Target User</label>
            <select
              {...register("userId")}
              disabled={!!editingMember}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand disabled:opacity-60"
            >
              <option value="">-- Choose System Registry Target User --</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            {errors.userId && <p className="text-xs text-red-500 mt-1 font-medium">{errors.userId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">System Identity Domain Address</label>
              <input type="text" {...register("email")} readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 outline-hidden focus:ring-0" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Contact Reference Line</label>
              <input type="text" {...register("phoneNumber")} readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 outline-hidden focus:ring-0" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">Operational Membership Plan Allocation</label>
            <select
              {...register("membershipPlanId")}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand"
            >
              <option value="">-- Allocate Membership Plan Duration Tier --</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.name} ({p.durationMonths} Months)</option>)}
            </select>
            {errors.membershipPlanId && <p className="text-xs text-red-500 mt-1 font-medium">{errors.membershipPlanId.message}</p>}
          </div>

          {editingMember && (
            <div className="flex items-center justify-between p-3 bg-teal-50/50 border border-teal-100 rounded-xl">
              <div>
                <span className="text-xs font-bold text-teal-900 block">Re-activate / Membership Continuity Toggle</span>
                <span className="text-xs text-teal-700">Updating values shifts account validation cycles to today's parameters.</span>
              </div>
              <input type="checkbox" {...register("isActive")} className="w-4 h-4 text-teal-brand border-gray-300 rounded-sm focus:ring-teal-500" />
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">Cancel Action</button>
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-teal-brand hover:bg-teal-hover shadow-sm rounded-xl transition-all cursor-pointer">
              {editingMember ? "Apply Changes" : "Create Profile Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};