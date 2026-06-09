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
    <div className="fixed inset-0 bg-slate-secondary/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-light/10 animate-zoom-in font-sans">
        
        {/* Modal Branding Header - Unified to Sage Accent */}
        <div className="bg-sage-primary p-5 text-white flex justify-between items-center">
          <h3 className="font-bold text-base tracking-tight">{editingMember ? "Renew Membership Plan" : "Add New Member"}</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors cursor-pointer text-sm font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-slate-secondary">
          
          {/* Form Control: User Selection Selector dropdown */}
          <div>
            <label className="text-xs font-bold text-slate-light uppercase tracking-wider block mb-1.5">
              Select Library Reader Account
            </label>
            <select
              {...register("userId")}
              disabled={!!editingMember || hasNoAvailableUsers}
              className={`w-full px-3.5 py-2 border rounded-xl text-sm font-semibold outline-hidden transition-all focus:bg-white focus:ring-4 focus:ring-sage-primary/10 focus:border-sage-primary disabled:opacity-60 ${
                hasNoAvailableUsers && !editingMember
                  ? "bg-utility-crimson/10 border-utility-crimson/20 text-utility-crimson font-bold" 
                  : "bg-canvas-dominant border-slate-light/10 text-slate-secondary"
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
            {errors.userId && <p className="text-xs text-utility-crimson mt-1.5 font-bold font-data">{errors.userId.message}</p>}
          </div>

          {/* Form Control Block Grid Row (Read Only Meta Profiles) */}
          <div className="grid grid-cols-2 gap-4 font-data">
            <div>
              <label className="text-xs font-bold text-slate-light uppercase tracking-wider block mb-1.5 font-sans">Email Address</label>
              <input type="text" {...register("email")} readOnly className="w-full px-3.5 py-2 bg-canvas-dominant border border-slate-light/10 rounded-xl text-sm text-slate-light font-semibold outline-hidden focus:ring-0 cursor-not-allowed select-all" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-light uppercase tracking-wider block mb-1.5 font-sans">Phone Number</label>
              <input type="text" {...register("phoneNumber")} readOnly className="w-full px-3.5 py-2 bg-canvas-dominant border border-slate-light/10 rounded-xl text-sm text-slate-light font-semibold outline-hidden focus:ring-0 cursor-not-allowed select-all" />
            </div>
          </div>

          {/* Form Control: Membership tier select index */}
          <div>
            <label className="text-xs font-bold text-slate-light uppercase tracking-wider block mb-1.5">Choose Membership Plan</label>
            <select
              {...register("membershipPlanId")}
              className="w-full px-3.5 py-2 bg-canvas-dominant border border-slate-light/10 text-slate-secondary rounded-xl text-sm font-semibold outline-hidden transition-all focus:bg-white focus:ring-4 focus:ring-sage-primary/10 focus:border-sage-primary cursor-pointer"
            >
              <option value="">All Membership Plan</option>
              {plans.map(p => (
                <option key={p.membership_plan_id} value={p.membership_plan_id} className="font-data">
                  {p.plan_name} ({p.duration_days} Days)
                </option>
              ))}
            </select>
            {errors.membershipPlanId && <p className="text-xs text-utility-crimson mt-1.5 font-bold font-data">{errors.membershipPlanId.message}</p>}
          </div>

          {/* Form Control: Continuous Activation Verification parameters */}
          {editingMember && (
            <div className="flex items-center justify-between p-3.5 bg-sage-primary/10 border border-sage-primary/20 rounded-xl">
              <div className="pr-2">
                <span className="text-xs font-bold text-sage-primary block">Re-activate / Membership Continuity Toggle</span>
                <span className="text-[11px] text-slate-light font-medium mt-0.5 block">Updating values shifts account validation cycles to today's parameters.</span>
              </div>
              <input 
                type="checkbox" 
                {...register("isActive")} 
                className="w-4 h-4 text-sage-primary border-slate-light/30 rounded-xs focus:ring-sage-primary focus:ring-offset-0 cursor-pointer accent-sage-primary scale-110" 
              />
            </div>
          )}

          {/* Action Footer Frame */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-light/10">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm font-bold text-slate-light hover:text-slate-secondary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={hasNoAvailableUsers && !editingMember}
              className="px-5 py-2 text-sm font-bold text-white bg-sage-primary hover:bg-sage-primary/90 disabled:bg-slate-light/20 disabled:text-slate-light/50 disabled:cursor-not-allowed shadow-xs rounded-xl transition-all cursor-pointer"
            >
              {editingMember ? "Update Changes" : "Create Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};