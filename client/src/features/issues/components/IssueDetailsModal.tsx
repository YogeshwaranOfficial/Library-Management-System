import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import type { BookIssueRecord } from "../../../types/transactions";
import { useNavigate } from "react-router-dom"; // For redirecting to payments

// Lucide Icons for the professional popup layout
import { ShieldAlert, AlertTriangle, ArrowRight, X, User, BookOpen, Calendar, Edit2, CheckCircle2 } from "lucide-react";

interface IssueDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: BookIssueRecord | null;
  onMarkAsReturned: (issueId: string) => void;
  onTriggerEdit: () => void;
}

export const IssueDetailsModal = ({ isOpen, onClose, record, onMarkAsReturned, onTriggerEdit }: IssueDetailsModalProps) => {
  const navigate = useNavigate();
  
  // 🟢 State control for our new embedded warning modal layout
  const [showFineBlockModal, setShowFineBlockModal] = useState(false);

  // ✨ Fetch stats with explicit key mapping and lifecycle tracking
  const { data: memberStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["memberHistoricalReturnsCount", record?.memberId],
    queryFn: async () => {
      if (!record?.memberId) return null;
      const res = await axiosClient.get(`/issues/member-stats/${record.memberId}`);
      return res.data?.data || res.data;
    },
    enabled: !!record?.memberId && isOpen,
  });

  if (!isOpen || !record) return null;

  // ✨ Feature: Safely parse and isolate the last 4 characters of the transaction UUID
  const formattedIssueId = record.id && record.id.length >= 4 
    ? `ISSUE-${record.id.slice(-4).toUpperCase()}`
    : `ISSUE-${record.id}`;

  // 🟢 Intercept Return Action to validate financial status
  const handleReturnClick = () => {
    // Check if there is an active outstanding fine on this specific record
    const hasUnpaidFine = record.fineAmount && record.fineAmount > 0 && !record.finePaidStatus;
    
    if (hasUnpaidFine) {
      // Catch the restriction instantly and display the professional layout block modal
      setShowFineBlockModal(true);
    } else {
      // No issues found, proceed with normal parent execution pipeline
      onMarkAsReturned(record.id);
    }
  };

  return (
    <>
      {/* Primary Issue Details Window Desk Layer */}
      <div className="fixed inset-0 bg-slate-secondary/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-light/10 animate-zoom-in">
          
          {/* Header Block Panel */}
          <div className="bg-slate-secondary p-5 text-white flex justify-between items-center border-b border-slate-light/10">
            <div>
              <h3 className="font-black text-xs uppercase tracking-widest text-sage-primary">Voucher Ledger</h3>
              <p className="font-bold text-sm text-white mt-0.5">Issue Details</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] bg-slate-light/10 border border-slate-light/20 text-slate-light font-data font-bold px-2 py-0.5 rounded-md tracking-wider uppercase">{formattedIssueId}</span>
              <button 
                onClick={onClose} 
                className="p-1.5 hover:bg-white/10 text-slate-light hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Member Meta Information Sub-Card */}
            <div className="bg-canvas-dominant/60 p-4 rounded-xl border border-slate-light/5 space-y-2">
              <div className="flex items-center gap-1.5 mb-1">
                <User size={13} className="text-slate-light" />
                <span className="text-[9px] font-black text-slate-light uppercase tracking-wider block">Profile Account Context</span>
              </div>
              <div className="text-sm font-bold text-slate-secondary">{record.memberName}</div>
              <div className="text-xs text-slate-light font-semibold">✉️ {record.memberEmail || "No Email Provided"}</div>
              <div className="text-xs text-slate-light font-semibold">📞 {record.memberPhone || "No Phone Contact Registered"}</div>
              
              <div className="pt-2.5 mt-2 border-t border-slate-light/10 flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-secondary">
                  Active Resource Holdings:{" "}
                  {isLoadingStats ? (
                    <span className="text-[10px] text-slate-light animate-pulse font-bold tracking-wider uppercase">Calculating...</span>
                  ) : (
                    <span className="text-[10px] font-black text-amber-700 bg-amber-50/70 border border-amber-200/40 px-2 py-0.5 rounded-md uppercase tracking-wide">
                      {memberStats?.currentBorrows ?? 0} books outstanding
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Book Catalog Details Section */}
            <div className="space-y-1.5 pl-1">
              <div className="flex items-center gap-1.5">
                <BookOpen size={13} className="text-slate-light" />
                <span className="text-[9px] font-black text-slate-light uppercase tracking-wider block">Checked Inventory Volume</span>
              </div>
              <div className="text-sm font-bold text-slate-secondary">📖 {record.bookTitle}</div>
              <div className="text-xs text-slate-light font-semibold pl-5">Catalog Author: {record.bookAuthor || "Unknown Reference"}</div>
            </div>

            {/* Timeline Parameters Matrix */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-light/10 py-3.5 font-data text-xs bg-canvas-dominant/20 px-1 rounded-lg">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Calendar size={12} className="text-slate-light/70" />
                  <span className="text-[9px] font-black text-slate-light uppercase block font-sans tracking-wider">Checkout Signature</span>
                </div>
                <div className="text-slate-secondary font-bold pl-4">{record.borrowedDate}</div>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Calendar size={12} className="text-sage-primary" />
                  <span className="text-[9px] font-black text-sage-primary uppercase block font-sans tracking-wider">Target Return Due</span>
                </div>
                <div className="text-slate-secondary font-black pl-4">{record.dueDate}</div>
              </div>
            </div>

            {/* Control Terminal Footer */}
            <div className="pt-2 flex justify-between items-center gap-3">
              <button
                type="button"
                onClick={onTriggerEdit}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-slate-secondary bg-canvas-dominant hover:bg-slate-light/10 rounded-xl border border-slate-light/5 transition-all cursor-pointer"
              >
                <Edit2 size={12} /> Edit
              </button>
              <div className="flex gap-1 items-center">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-light hover:text-slate-secondary cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReturnClick}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-sage-primary hover:bg-sage-primary/90 shadow-xs rounded-xl transition-all cursor-pointer whitespace-nowrap"
                >
                  <CheckCircle2 size={13} /> Mark As Returned
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 🟢 NEW SECONDARY PORTAL LAYER: Professional Unpaid Fine Blocking Warning Pop-Up */}
      {showFineBlockModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-secondary/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-rose-100 shadow-2xl overflow-hidden animate-zoom-in text-left">
            
            {/* Warning Header block matches standard system alerts */}
            <div className="bg-rose-50/50 px-6 py-5 border-b border-rose-100/60 flex items-start gap-3.5">
              <div className="p-2 bg-rose-100/80 rounded-xl text-rose-600 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-secondary">Return Blocked: Pending Balance</h3>
                <p className="text-[9px] text-rose-700 font-black mt-0.5 uppercase tracking-widest">
                  Financial Validation Exception Bound
                </p>
              </div>
            </div>

            {/* Warning Body Parameters */}
            <div className="p-6 space-y-4 text-xs leading-relaxed text-slate-secondary font-medium">
              <p className="text-slate-light">
                The library core system cannot authorize this inventory shelf check-in sequence because an unpaid fine liability matches this active operation.
              </p>

              {/* Data Summary Box */}
              <div className="bg-canvas-dominant border border-slate-light/10 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-light uppercase text-[9px] tracking-wider font-bold">Account Holder:</span>
                  <span className="font-bold text-slate-secondary">{record.memberName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-light uppercase text-[9px] tracking-wider font-bold">Asset Volume:</span>
                  <span className="font-bold text-slate-secondary max-w-48 truncate">{record.bookTitle}</span>
                </div>
                <div className="h-px bg-slate-light/10 my-1.5" />
                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-rose-700 font-black uppercase text-[10px] tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Overdue Debt:
                  </span>
                  <span className="text-base font-black font-data text-slate-secondary">
                    ₹{record.fineAmount}.00
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-light italic bg-canvas-dominant/40 p-3 rounded-xl border border-slate-light/5 leading-normal">
                Policy Rule: Outstanding debt liabilities must clear through the cash registration counter desk before restoring book items back into system catalog slots.
              </p>
            </div>

            {/* Footer Control Panel */}
            <div className="px-6 py-4 bg-canvas-dominant border-t border-slate-light/10 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowFineBlockModal(false)}
                className="px-4 py-2 bg-white text-slate-light border border-slate-light/10 hover:text-slate-secondary font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Dismiss Alert
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFineBlockModal(false);
                  onClose(); // Close the parent transaction modal
                  navigate("/fines"); // Smoothly redirect the librarian to collect the cash
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                Collect Fine Counter <ArrowRight className="w-3 h-3" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};