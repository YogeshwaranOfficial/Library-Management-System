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

export const DeletePlanModal = ({ isOpen, planId, planName, onClose, onSuccessRedirect }: DeletePlanModalProps) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await axiosClient.delete(`/plan/delete`, {
        data: { membership_plan_id: planId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membershipPlansMasterFeed"] });
      toast.info(`Scheme model data "${planName}" cleanly dropped from database.`);
      onSuccessRedirect();
    },
    onError: (err: unknown) => {
      let errorMessage = "Database execution error. Relational integrity rules may prohibit this operation.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in text-left">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-amber-100/80 animate-zoom-in relative">
        
        {/* Absolute Positioning Dismiss Controller */}
        <div className="absolute right-4 top-4">
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition-colors p-1 hover:bg-slate-50 rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Critical Action Notification Core */}
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <AlertTriangle size={26} className="text-rose-600" />
          </div>

          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Delete Membership Plan</h3>
          
          <p className="text-xs text-slate-500 font-medium mt-3 leading-relaxed px-2">
            Are you absolutely sure you want to permanently drop the configuration plan <span className="font-bold text-slate-900">"{planName}"</span> from the target database cluster tables?
          </p>

          {/* Relational Constraints Alert Notice Callout Block */}
          <div className="mt-5 p-4 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-start gap-2.5 text-left">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900 font-bold leading-normal uppercase tracking-tight">
              Relational Hazard: Members currently bound to this specific plan model id may experience query faults during system verification checkups.
            </p>
          </div>
        </div>

        {/* Dynamic Action Trigger Tray */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 text-xs font-bold tracking-wide">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 py-3 text-slate-700 bg-white border border-slate-200 rounded-xl transition-all hover:bg-slate-100 cursor-pointer"
          >
            Abort
          </button>
          <button 
            type="button" 
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="flex-1 py-3 text-white bg-rose-600 hover:bg-rose-700 shadow-sm rounded-xl transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            {deleteMutation.isPending ? "Dropping..." : "Confirm Purge"}
          </button>
        </div>

      </div>
    </div>
  );
};