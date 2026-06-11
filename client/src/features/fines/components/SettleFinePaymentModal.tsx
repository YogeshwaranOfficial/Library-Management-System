import React, { useState } from "react";
import type { FineRecord } from "../../../types/fines";
import { X, Calendar, CheckSquare } from "lucide-react";

interface SettleFinePaymentModalProps {
  isOpen: boolean;
  fine: FineRecord | null;
  onClose: () => void;
  onConfirmSettlement: (payload: { id: string; paidDate: string; paymentMethod?: string }) => void;
}

export const SettleFinePaymentModal = ({ isOpen, fine, onClose, onConfirmSettlement }: SettleFinePaymentModalProps) => {
  const today = new Date().toISOString().split("T")[0];
  const [selectedPaidDate, setSelectedPaidDate] = useState(today);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "UPI">("CASH");

  if (!isOpen || !fine) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaidDate) return;
    onConfirmSettlement({ 
      id: fine.fine_id, 
      paidDate: selectedPaidDate,
      paymentMethod: paymentMethod 
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans text-xs sm:text-sm text-slate-700 text-left animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-zoom-in">
        
        {/* Header */}
        <div className="bg-rose-600 px-6 py-5 text-white flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider">Process Fine Settlement</h3>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 text-white/80 hover:text-white rounded-md transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Quick Informational Vector */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between font-bold text-slate-400 uppercase text-[11px] tracking-wide">
              <span>Account Name:</span>
              <span className="text-slate-900 font-sans font-bold normal-case tracking-normal text-xs">{fine.memberName}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-400 uppercase text-[11px] tracking-wide items-center pt-1 border-t border-slate-100">
              <span>Balance Due:</span>
              <span className="text-rose-600 font-mono font-bold text-sm">₹{fine.fine_amount}.00</span>
            </div>
          </div>

          {/* Payment Method Selector Segment */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["CASH", "CARD", "UPI"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 text-xs font-bold uppercase tracking-wider border rounded-xl transition-all cursor-pointer ${
                    paymentMethod === method
                      ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Calendar Target Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
              Payment Date
            </label>
            <div className="relative">
              <input
                type="date"
                required
                max={today}
                value={selectedPaidDate}
                onChange={(e) => setSelectedPaidDate(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-hidden focus:bg-white focus:border-slate-900 transition-all cursor-pointer font-mono"
              />
              <Calendar size={14} className="text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              *Backdating is permitted for missed database updates. Future dates remain locked.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <CheckSquare size={14} /> Confirm Payment & Close Invoice
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};