import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { toast } from "sonner";
import { AlertTriangle, AlertCircle, X } from "lucide-react";
import axios from "axios";

interface DeletePlanModalProps {
  isOpen: boolean;
  planId: string;
  planName: string;
  onClose: () => void;
  onSuccessRedirect: () => void;
}

export const DeletePlanModal = ({
  isOpen,
  planId,
  planName,
  onClose,
  onSuccessRedirect,
}: DeletePlanModalProps) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await axiosClient.delete(`/plan/delete`, {
        data: { membership_plan_id: planId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["membershipPlansMasterFeed"],
      });
      toast.info(
        `Scheme model data "${planName}" cleanly dropped from database.`,
      );
      onSuccessRedirect();
    },
    onError: (err: unknown) => {
      let errorMessage =
        "Database execution error. Relational integrity rules may prohibit this operation.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in text-left">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-200 animate-zoom-in relative">
        {/* Absolute Positioning Dismiss Controller */}
        <div className="absolute right-4 top-4">
          <button
            type="button"
            onClick={onClose}
className="text-[#718096] hover:text-[#1A365D] transition-all p-1.5 hover:bg-gray-100 rounded-full cursor-pointer"          >
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Critical Action Notification Core */}
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <AlertTriangle size={26} className="text-rose-600" />
          </div>

          <h3 className="text-lg font-bold text-[#1A365D] tracking-tight">
            Delete Membership Plan
          </h3>

          <p className="text-sm text-[#2D3748] mt-3 leading-relaxed px-2">
            Are you absolutely sure you want to permanently drop the
            configuration plan{" "}
            <span className="font-bold text-[#1A365D]">"{planName}"</span> from
            the target database cluster tables?
          </p>

          {/* Relational Constraints Alert Notice Callout Block */}
          <div className="mt-5 p-4 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-2.5 text-left">
            <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-rose-800 font-bold leading-normal uppercase tracking-widest">
              Warning: Members currently underthis plan may be come with unclassified plans
            </p>
          </div>
        </div>

        {/* Dynamic Action Trigger Tray */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex gap-3 text-xs font-bold tracking-wide">
          <button
            type="button"
            onClick={onClose}
className="flex-1 py-2.5 bg-white border border-gray-200 text-[#718096] rounded-xl transition-all hover:bg-gray-50 hover:text-[#1A365D] cursor-pointer"          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
className="flex-1 py-2.5 text-white bg-[#2B6CB0] hover:bg-[#1A365D] shadow-sm rounded-full transition-all cursor-pointer tracking-wide disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"          >
            {deleteMutation.isPending ? "Dropping..." : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};
