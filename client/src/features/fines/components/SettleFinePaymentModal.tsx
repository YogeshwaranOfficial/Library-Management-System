import { useState } from "react";
import type { FineRecord } from "../../../types/fines";
import { X, Calendar, CheckSquare, Trash2 } from "lucide-react";

interface SettleFinePaymentModalProps {
  isOpen: boolean;
  fine: FineRecord | null;
  onClose: () => void;
  onConfirmSettlement: (payload: { id: string; paidDate: string }) => void;
  onSoftDelete: (id: string) => void;
}

export const SettleFinePaymentModal = ({ isOpen, fine, onClose, onConfirmSettlement, onSoftDelete }: SettleFinePaymentModalProps) => {
  const [selectedPaidDate, setSelectedPaidDate] = useState(() => new Date().toISOString().split("T")[0]);

  if (!isOpen || !fine) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaidDate) return;
    onConfirmSettlement({ id: fine.fine_id, paidDate: selectedPaidDate });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-zoom-in">
        
        {/* Header */}
        <div className="bg-teal-600 p-4 text-white flex justify-between items-center">
          <h3 className="font-bold text-sm uppercase tracking-wider">Execute Counter Settlement</h3>
          <button onClick={onClose} className="p-1 text-teal-200 hover:text-white rounded-md transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Quick Informational Vector */}
          <div className="p-3.5 bg-slate-50 border border-gray-200 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between font-bold text-gray-800">
              <span>Account Name:</span>
              <span className="text-gray-900 font-mono">{fine.memberName}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800">
              <span>Balance Due Ledger:</span>
              <span className="text-teal-700 font-mono text-sm">₹{fine.fine_amount}.00</span>
            </div>
          </div>

          {/* Payment Calendar Target Input */}
          <div className="space-y-1">
            <label className="text-2xs font-extrabold text-gray-700 uppercase tracking-wide block">
              Execution Receipt Date (paid_date)
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={selectedPaidDate}
                onChange={(e) => setSelectedPaidDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-600"
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
            <p className="text-3xs text-gray-400">
              *Setting this parameter changes paid_status to TRUE, filtering it off this active terminal screen.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
            {/* Primary Action Button */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" /> Finalize Collection & Close Invoice
            </button>

            {/* Danger Zone Soft Delete Action Button */}
            <button
              type="button"
              onClick={() => onSoftDelete(fine.fine_id)}
              className="w-full py-2 px-4 hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-bold text-2xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Soft Delete Active Invoice Record
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};