import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import type { MembershipPlan } from "../pages/ManagePlan";
import { toast } from "sonner";
import { X, Layers, IndianRupee, Calendar, BookOpen, Save } from "lucide-react";
import axios from "axios";

interface PlanModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  plan: MembershipPlan | null;
  onClose: () => void;
}

export const PlanModal = ({ isOpen, mode, plan, onClose }: PlanModalProps) => {
  const queryClient = useQueryClient();

  // Initialize state directly from props to eliminate cascading render warnings
  const [planName, setPlanName] = useState(() => (mode === "edit" && plan ? plan.plan_name : ""));
  const [price, setPrice] = useState(() => (mode === "edit" && plan ? String(plan.price) : ""));
  const [durationDays, setDurationDays] = useState(() => (mode === "edit" && plan ? String(plan.duration_days) : ""));
  const [maxBooks, setMaxBooks] = useState(() => (mode === "edit" && plan ? String(plan.max_books_allowed) : ""));

  const planMutation = useMutation({
    mutationFn: async (payload: { plan_name: string; price: number; duration_days: number; max_books_allowed: number }) => {
      if (mode === "create") {
        return await axiosClient.post("/plan/create", payload);
      } else {
        return await axiosClient.patch(`/plan/edit`, {
          membership_plan_id: plan?.membership_plan_id,
          ...payload
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membershipPlansMasterFeed"] });
      toast.success(mode === "create" ? "🎉 New Membership Plan Created Successfully" : "Plan Updated Successfully");
      onClose();
    },
    onError: (err: unknown) => {
      let errorMessage = "Execution error rejected parameter payload metrics map.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName || !price || !durationDays || !maxBooks) {
      toast.error("Please fill all mandatory configuration inputs.");
      return;
    }
    planMutation.mutate({
      plan_name: planName.trim(),
      price: Number(price),
      duration_days: Number(durationDays),
      max_books_allowed: Number(maxBooks)
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-secondary/40 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-fade-in text-left">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-light/10 animate-zoom-in">
        
        <div className={`px-6 py-5 text-white flex justify-between items-center ${mode === "create" ? "bg-rose-600" : "bg-slate-secondary"}`}>
          <h3 className="text-xs font-black uppercase tracking-wider">
            {mode === "create" ? "Add New Plan" : "Modify Plan Details"}
          </h3>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 text-white/80 hover:text-white rounded-md transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-secondary">
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-light uppercase tracking-wider block">Plan Name *</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Bronze, Gold Tier, Corporate Pro"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-canvas-dominant border border-slate-light/10 rounded-xl text-xs font-medium text-slate-secondary placeholder:text-slate-light outline-hidden focus:bg-white focus:border-slate-secondary transition-all"
              />
              <Layers size={14} className="text-slate-light absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-light uppercase tracking-wider block">Plan Price (₹ INR) *</label>
            <div className="relative">
              <input
                type="number"
                required
                min="0"
                placeholder="0 for public free tier schemas"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-canvas-dominant border border-slate-light/10 rounded-xl text-xs font-data font-bold text-slate-secondary placeholder:text-slate-light outline-hidden focus:bg-white focus:border-slate-secondary transition-all"
              />
              <IndianRupee size={14} className="text-slate-light absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-light uppercase tracking-wider block">Duration (Days) *</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 90"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-canvas-dominant border border-slate-light/10 rounded-xl text-xs font-data font-bold text-slate-secondary placeholder:text-slate-light outline-hidden focus:bg-white focus:border-slate-secondary transition-all"
                />
                <Calendar size={14} className="text-slate-light absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-light uppercase tracking-wider block">Max Borrow Limit *</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 15"
                  value={maxBooks}
                  onChange={(e) => setMaxBooks(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-canvas-dominant border border-slate-light/10 rounded-xl text-xs font-data font-bold text-slate-secondary placeholder:text-slate-light outline-hidden focus:bg-white focus:border-slate-secondary transition-all"
                />
                <BookOpen size={14} className="text-slate-light absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-light/5 flex gap-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-slate-light hover:text-slate-secondary bg-canvas-dominant hover:bg-slate-light/10 border border-slate-light/10 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={planMutation.isPending}
              className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-white rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${mode === "create" ? "bg-rose-600 hover:bg-rose-700" : "bg-slate-secondary hover:bg-slate-secondary/90"} disabled:opacity-50`}
            >
              <Save size={13} /> {planMutation.isPending ? "Syncing..." : "Confirm"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};