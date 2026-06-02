import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FineFormSchema, type FineFormValues } from "../schemas/fineSchema";
import type { FineRecord } from "../../../types/fines";

interface FineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FineFormValues) => void;
  editingFine: FineRecord | null;
}

export const FinesModal = ({ isOpen, onClose, onSubmit, editingFine }: FineModalProps) => {
  const todayString = new Date().toISOString().split("T")[0];

  const { register, handleSubmit, reset, setValue } = useForm<FineFormValues>({
    resolver: zodResolver(FineFormSchema),
    defaultValues: { paidStatus: false, paidDate: null }
  });

  // Sync initial form values when a specific fine record is opened for editing
  useEffect(() => {
    if (editingFine) {
      reset({
        paidStatus: editingFine.paidStatus,
        paidDate: editingFine.paidDate
      });
    }
  }, [editingFine, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-ocean-blue/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 animate-zoom-in">
        <div className="bg-linear-to-r from-ocean-light to-ocean-blue p-5 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">Modify Fine Invoice Details</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white transition-colors cursor-pointer text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800 space-y-1">
            <p className="font-bold">Member Account Context:</p>
            <p className="font-semibold text-gray-700">Name: {editingFine?.memberName}</p>
            <p className="font-semibold text-gray-700">Media Asset: {editingFine?.bookTitle}</p>
            <p className="font-semibold text-gray-700">Accrued Value: ₹{editingFine?.fineAmount}.00</p>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block">Payment Status Statement</label>
              <span className="text-[11px] text-gray-400 block">Has this liability been completely settled?</span>
            </div>
            <input 
              type="checkbox" 
              // FIXED: Replaced external watch/useEffect hooks with an inline registry listener
              {...register("paidStatus", {
                onChange: (e) => {
                  const isChecked = e.target.checked;
                  setValue("paidDate", isChecked ? todayString : null);
                }
              })} 
              className="w-5 h-5 accent-teal-brand cursor-pointer rounded-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">Settlement Receipt Date</label>
            <input 
              type="date" 
              {...register("paidDate")} 
              readOnly 
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 outline-hidden" 
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">Abort</button>
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-teal-brand hover:bg-teal-hover shadow-sm rounded-xl transition-all cursor-pointer">
              Update Fine Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};