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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in text-left">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-amber-100/80 animate-zoom-in">
        
        {/* Header Ribbon Layer - Clean Light Structured Banner */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
          <h3 className="text-xl font-bold uppercase tracking-wide">
            {mode === "create" ? "Add New Plan" : "Modify Plan Details"}
          </h3>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-slate-700">
          
          {/* Form Element: Plan Title Entry */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Plan Name *</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Bronze, Gold Tier, Corporate Pro"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-400 transition-all"
              />
              <Layers size={16} className="text-slate-400 absolute left-4 top-3.5" />
            </div>
          </div>

          {/* Form Element: Cost Calculation Matrix Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Plan Price (₹ INR) *</label>
            <div className="relative">
              <input
                type="number"
                required
                min="0"
                placeholder="0 for public free tier schemas"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-400 transition-all"
              />
              <IndianRupee size={16} className="text-slate-400 absolute left-4 top-3.5" />
            </div>
          </div>

          {/* Form Element Column Rows Layout Splits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Duration (Days) *</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 90"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-400 transition-all"
                />
                <Calendar size={16} className="text-slate-400 absolute left-4 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Max Borrow Limit *</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 15"
                  value={maxBooks}
                  onChange={(e) => setMaxBooks(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-400 transition-all"
                />
                <BookOpen size={16} className="text-slate-400 absolute left-4 top-3.5" />
              </div>
            </div>
          </div>

          {/* Interactive Footer Controls Frame */}
          <div className="pt-5 border-t border-slate-100 flex gap-3 text-xs font-bold tracking-wide">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl transition-all hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={planMutation.isPending}
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-amber-50 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              <Save size={15} /> {planMutation.isPending ? "Syncing..." : "Confirm"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};