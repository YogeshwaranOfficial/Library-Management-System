import React, { useState } from "react";
import type { FineRecord } from "../../../types/fines";
import {  Calendar, CheckSquare } from "lucide-react";

interface SettleFinePaymentModalProps {
  isOpen: boolean;
  fine: FineRecord | null;
  onClose: () => void;
  onConfirmSettlement: (payload: {
    id: string;
    paidDate: string;
    paymentMethod?: string;
  }) => void;
}

export const SettleFinePaymentModal = ({
  isOpen,
  fine,
  onClose,
  onConfirmSettlement,
}: SettleFinePaymentModalProps) => {
  const today = new Date().toISOString().split("T")[0];
  const [selectedPaidDate, setSelectedPaidDate] = useState(today);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "UPI">(
    "CASH",
  );

  if (!isOpen || !fine) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaidDate) return;
    onConfirmSettlement({
      id: fine.fine_id,
      paidDate: selectedPaidDate,
      paymentMethod: paymentMethod,
    });
  };

 return (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans select-none text-left animate-fade-in">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 animate-zoom-in">
      {/* Header Framework - Matching Reference Module */}
      <div className="flex items-center justify-between border-b border-gray-200 p-5 bg-white">
        <div>
          <h3 className="text-lg font-bold text-[#1A365D] tracking-tight">
            Process Fine Settlement
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[#718096] hover:text-[#1A365D] hover:bg-gray-100 transition-all text-xs font-bold cursor-pointer p-1.5 rounded-full"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5 text-[#2D3748]">
        {/* Quick Informational Vector */}
        <div className="p-4 bg-slate-50 border border-gray-200 rounded-xl space-y-2 text-sm">
          <div className="flex justify-between font-bold text-[#718096] uppercase text-[11px] tracking-wide">
            <span>Account Name:</span>
            <span className="text-[#1A365D] font-sans font-bold normal-case tracking-normal text-sm">
              {fine.memberName}
            </span>
          </div>
          <div className="flex justify-between font-bold text-[#718096] uppercase text-[11px] tracking-wide items-center pt-2 border-t border-gray-200">
            <span>Balance Due:</span>
            <span className="text-rose-600 font-bold text-base">
              ₹{fine.fine_amount}.00
            </span>
          </div>
        </div>

        {/* Payment Method Selector Segment */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest block">
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
                    ? "bg-[#1A365D] border-[#1A365D] text-white shadow-sm"
                    : "bg-slate-50 border-gray-200 text-[#718096] hover:text-[#1A365D] hover:bg-gray-50"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Calendar Target Input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest block">
            Payment Date
          </label>
          <div className="relative">
            <input
              type="date"
              required
              max={today}
              value={selectedPaidDate}
              onChange={(e) => setSelectedPaidDate(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold text-[#2D3748] placeholder:text-[#718096] outline-none focus:bg-white focus:border-[#1A365D] transition-all cursor-pointer"
            />
            <Calendar
              size={14}
              className="text-[#718096] absolute left-3.5 top-3.5 pointer-events-none"
            />
          </div>
          <p className="text-[11px] text-[#718096] font-medium leading-relaxed">
            *Backdating is permitted for missed database updates. Future dates
            remain locked.
          </p>
        </div>

        {/* Action Button Layout Framework */}
        <div className="pt-3 border-t border-gray-100 flex flex-col gap-3">
          <button
            type="submit"
            className="w-full py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <CheckSquare size={12} /> Confirm Payment & Close Invoice
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-bold text-[#718096] uppercase tracking-wider hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-xl transition-all cursor-pointer text-center"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
);
};
