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

  // Check if there are no available users left to turn into subscriber members
  const hasNoAvailableUsers = users.length === 0;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-amber-100 animate-zoom-in">
        
        {/* Modal Branding Header - Clean Light Structured Banner */}
        <div className="bg-slate-50/80 border-b border-slate-100 p-5 text-slate-900 flex justify-between items-center">
          <h3 className="text-sm font-bold tracking-tight">{editingMember ? "Renew Membership Plan" : "Add New Member"}</h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer text-base font-bold p-1.5 hover:bg-slate-100 rounded-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 text-slate-700">
          
          {/* Form Control: User Selection Selector dropdown */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
              Select Library Reader Account
            </label>
            <select
              {...register("userId")}
              disabled={!!editingMember || hasNoAvailableUsers}
              className={`w-full px-4 py-3 border rounded-xl text-sm font-semibold outline-none transition-all ${
                hasNoAvailableUsers && !editingMember
                  ? "bg-rose-50 border-rose-200 text-rose-700 font-bold" 
                  : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-slate-400"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {editingMember ? (
                <option value="">Current Member Locked</option>
              ) : hasNoAvailableUsers ? (
                <option value="">No options remaining to register</option>
              ) : (
                <>
                  <option value="">Choose User Profile...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name.toUpperCase()}
                    </option>
                  ))}
                </>
              )}
            </select>
            {errors.userId && <p className="text-xs text-rose-700 mt-1.5 font-bold">{errors.userId.message}</p>}
          </div>

          {/* Form Control Block Grid Row (Read Only Meta Profiles) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Email Address</label>
              <input 
                type="text" 
                {...register("email")} 
                readOnly 
                className="w-full px-4 py-3 bg-slate-100/70 border border-slate-200 rounded-xl text-sm text-slate-600 font-semibold outline-none cursor-not-allowed select-all" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Phone Number</label>
              <input 
                type="text" 
                {...register("phoneNumber")} 
                readOnly 
                className="w-full px-4 py-3 bg-slate-100/70 border border-slate-200 rounded-xl text-sm text-slate-600 font-semibold outline-none cursor-not-allowed select-all" 
              />
            </div>
          </div>

          {/* Form Control: Membership tier select index */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Choose Membership Plan</label>
            <select
              {...register("membershipPlanId")}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-sm font-semibold outline-none transition-all focus:bg-white focus:border-slate-400 cursor-pointer"
            >
              <option value="">Select a plan...</option>
              {plans.map(p => (
                <option key={p.membership_plan_id} value={p.membership_plan_id}>
                  {p.plan_name.toUpperCase()} ({p.duration_days} DAYS)
                </option>
              ))}
            </select>
            {errors.membershipPlanId && <p className="text-xs text-rose-700 mt-1.5 font-bold">{errors.membershipPlanId.message}</p>}
          </div>

          {/* Form Control: Continuous Activation Verification parameters */}
          {editingMember && (
            <div className="flex items-center justify-between p-4 bg-amber-50/40 border border-amber-200/60 rounded-xl">
              <div className="pr-4">
                <span className="text-sm font-bold text-slate-800 block">Membership Continuity Toggle</span>
                <span className="text-xs text-slate-400 font-medium mt-0.5 block">Updating values shifts account validation cycles to today's parameters.</span>
              </div>
              <input 
                type="checkbox" 
                {...register("isActive")} 
                className="w-5 h-5 text-slate-900 border-slate-300 bg-white rounded-lg focus:ring-0 cursor-pointer accent-slate-900 transition-all" 
              />
            </div>
          )}

          {/* Action Footer Frame */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 text-xs font-bold tracking-wide">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl transition-all hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={hasNoAvailableUsers && !editingMember}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-amber-50 rounded-xl transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {editingMember ? "Update Changes" : "Create Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};