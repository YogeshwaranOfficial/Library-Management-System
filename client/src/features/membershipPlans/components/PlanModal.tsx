import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import type { ExtendedPlan } from "../pages/ManagePlan";
import { toast } from "sonner";
import { Layers, IndianRupee, Calendar, BookOpen, Save } from "lucide-react";
import axios from "axios";

interface PlanModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  plan: ExtendedPlan | null;
  onClose: () => void;
}

export const PlanModal = ({ isOpen, mode, plan, onClose }: PlanModalProps) => {
  const queryClient = useQueryClient();

  // Initialize state directly from props to eliminate cascading render warnings
  const [planName, setPlanName] = useState(() =>
    mode === "edit" && plan ? plan.plan_name : "",
  );
  const [price, setPrice] = useState(() =>
    mode === "edit" && plan ? String(plan.price) : "",
  );
  const [durationDays, setDurationDays] = useState(() =>
    mode === "edit" && plan ? String(plan.duration_days) : "",
  );
  const [maxBooks, setMaxBooks] = useState(() =>
    mode === "edit" && plan ? String(plan.max_books_allowed) : "",
  );

  const planMutation = useMutation({
    mutationFn: async (payload: {
      plan_name: string;
      price: number;
      duration_days: number;
      max_books_allowed: number;
    }) => {
      if (mode === "create") {
        return await axiosClient.post("/plan/create", payload);
      } else {
        return await axiosClient.patch(`/plan/edit`, {
          membership_plan_id: plan?.membership_plan_id,
          ...payload,
        });
      }
    },
    onSuccess: async () => {
      // 1. Invalidate exact query match and refetch immediately
      await queryClient.invalidateQueries({
        queryKey: ["membershipPlansMasterFeed"],
        exact: false, // Ensures partial query key combinations match
      });

      // 2. Explicitly trigger a hard background refetch to force the UI Table to update
      await queryClient.refetchQueries({
        queryKey: ["membershipPlansMasterFeed"],
      });

      toast.success(
        mode === "create"
          ? "🎉 New Membership Plan Created Successfully"
          : "Plan Updated Successfully",
      );
      onClose();
    },
    onError: (err: unknown) => {
      let errorMessage = "Execution error rejected parameter payload metrics map.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
    },
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
      max_books_allowed: Number(maxBooks),
    });
  };

  // Unique configuration token forces component tree identity remounting on form transitions
  const uniqueModalInstanceKey = `${isOpen}-${mode}-${plan?.membership_plan_id || "new"}`;

  return (
    <>
      {/* High-contrast background overlay with clean backdrop filter */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm font-sans select-none animate-fade-in text-left">
        <div 
          key={uniqueModalInstanceKey}
          className="w-full max-w-xl rounded-2xl bg-white shadow-xl transition-all overflow-hidden border border-gray-200 flex flex-col max-h-[90vh] animate-zoom-in"
        >
          
          {/* Header Framework - Matching Reference Module Perfectly */}
          <div className="flex items-center justify-between border-b border-gray-200 p-5 bg-white">
            <div>
              <h3 className="text-lg font-bold text-[#1A365D] tracking-tight">
                {mode === "create" ? "Add New Plan" : "Modify Plan Details"}
              </h3>
              <p className="text-[11px] text-[#718096] font-bold mt-1 tracking-wider uppercase">
                Subscription Configuration
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[#718096] hover:text-[#1A365D] hover:bg-gray-100 transition-all text-xs font-bold cursor-pointer p-1.5 rounded-full"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-[#2D3748]">
            
            {/* Form Element: Plan Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest block">
                Plan Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Bronze, Gold Tier, Corporate Pro"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-[#1A365D] placeholder-[#A0AEC0] outline-none focus:bg-white focus:border-[#2B6CB0] transition-all"
                />
                <Layers
                  size={16}
                  className="text-[#718096] absolute left-4 top-3.5"
                />
              </div>
            </div>

            {/* Form Element: Price */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest block">
                Plan Price (₹ INR) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#1A365D] placeholder-[#A0AEC0] outline-none focus:bg-white focus:border-[#2B6CB0] transition-all"
                />
                <IndianRupee
                  size={16}
                  className="text-[#718096] absolute left-4 top-3.5"
                />
              </div>
            </div>

            {/* Form Element Grid Splits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest block">
                  Duration (Days) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 90"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#1A365D] placeholder-[#A0AEC0] outline-none focus:bg-white focus:border-[#2B6CB0] transition-all"
                  />
                  <Calendar
                    size={16}
                    className="text-[#718096] absolute left-4 top-3.5"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest block">
                  Max Borrow Limit *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 15"
                    value={maxBooks}
                    onChange={(e) => setMaxBooks(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#1A365D] placeholder-[#A0AEC0] outline-none focus:bg-white focus:border-[#2B6CB0] transition-all"
                  />
                  <BookOpen
                    size={16}
                    className="text-[#718096] absolute left-4 top-3.5"
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions: Matching Reference Button Themes */}
            <div className="pt-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-[#718096] uppercase tracking-wider hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded-xl transition-all cursor-pointer text-left sm:text-center"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={planMutation.isPending}
                className="px-6 py-3 bg-[#2B6CB0] hover:bg-[#1A365D] text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save size={14} />
                {planMutation.isPending ? "Syncing..." : "Confirm Subscription"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};