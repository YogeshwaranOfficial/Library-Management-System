import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import type { BookIssueRecord } from "../../../types/transactions";
import { useNavigate } from "react-router-dom"; // For redirecting to payments

// Lucide Icons for the professional popup layout
import { ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";

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
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 animate-zoom-in">
          
          {/* Header Block Panel */}
          <div className="bg-slate-800 p-5 text-white flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base">Issue Details</h3>
              <span className="text-xs text-slate-400 font-mono tracking-wider">{formattedIssueId}</span>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-lg cursor-pointer transition-colors">✕</button>
          </div>

          <div className="p-6 space-y-5">
            {/* Member Meta Information Sub-Card */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
              <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider block">About Member</span>
              <div className="text-sm font-bold text-slate-900">{record.memberName}</div>
              <div className="text-xs text-slate-500 font-medium">✉️ {record.memberEmail || "No Email Provided"}</div>
              <div className="text-xs text-slate-500 font-medium">📞 {record.memberPhone || "No Phone Contact Registered"}</div>
              
              <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center gap-1.5">
                <span className="text-xs text-slate-600">
                  Current Active Holdings:{" "}
                  {isLoadingStats ? (
                    <span className="text-2xs text-gray-400 animate-pulse font-medium">calculating...</span>
                  ) : (
                    <b className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md font-bold">
                      {memberStats?.currentBorrows ?? 0} books outstanding
                    </b>
                  )}
                </span>
              </div>
            </div>

            {/* Book Catalog Details Section */}
            <div className="space-y-1">
              <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider block">About Book</span>
              <div className="text-sm font-bold text-slate-800">📖 {record.bookTitle}</div>
              <div className="text-xs text-slate-500 pl-5">Author: {record.bookAuthor || "Unknown Catalog Reference"}</div>
            </div>

            {/* Timeline Parameters Matrix */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-100 py-3 font-mono text-xs">
              <div>
                <span className="text-2xs font-bold text-gray-400 uppercase block font-sans mb-0.5">Borrowed Date</span>
                <div className="text-gray-700 font-semibold">{record.borrowedDate}</div>
              </div>
              <div>
                <span className="text-2xs font-bold text-gray-400 uppercase block font-sans mb-0.5">Target Due Deadline</span>
                <div className="text-slate-900 font-bold">{record.dueDate}</div>
              </div>
            </div>

            {/* Control Terminal Footer */}
            <div className="pt-2 flex justify-between items-center gap-3">
              <button
                type="button"
                onClick={onTriggerEdit}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Edit Record
              </button>
              <div className="flex gap-2 items-center">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-3 py-2 text-xs font-semibold text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReturnClick} // 🟢 UPDATED: Intercepts logic validation checkpoints instantly
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs rounded-xl transition-all cursor-pointer whitespace-nowrap"
                >
                  ✓ Mark As Returned
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 🟢 NEW SECONDARY PORTAL LAYER: Professional Unpaid Fine Blocking Warning Pop-Up */}
      {showFineBlockModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-rose-100 shadow-2xl overflow-hidden animate-zoom-in text-left">
            
            {/* Warning Header block matches standard system alerts */}
            <div className="bg-rose-50 px-6 py-5 border-b border-rose-100 flex items-start gap-3.5">
              <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Return Blocked: Outstanding Fine</h3>
                <p className="text-3xs text-rose-700 font-extrabold mt-0.5 uppercase tracking-wider">
                  Financial Validation Constraint
                </p>
              </div>
            </div>

            {/* Warning Body Parameters */}
            <div className="p-6 space-y-4 text-xs leading-relaxed text-gray-600">
              <p>
                The library system cannot authorize this inventory check-in sequence because an unpaid fine balance remains active on this checkout sequence log.
              </p>

              {/* Data Summary Box */}
              <div className="bg-slate-50 border border-gray-200 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Account Holder:</span>
                  <span className="font-bold text-gray-900">{record.memberName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Book Asset:</span>
                  <span className="font-bold text-gray-900 max-w-50 truncate">{record.bookTitle}</span>
                </div>
                <div className="h-px bg-gray-200 my-1" />
                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-rose-700 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Pending Balance:
                  </span>
                  <span className="text-base font-black font-mono text-gray-950">
                    ₹{record.fineAmount}.00
                  </span>
                </div>
              </div>

              <p className="text-3xs text-gray-400 italic bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                Operational Rule: Outstanding debt liabilities must clear through the cash registration counter desk before restoring book volume items back onto public circulation shelves.
              </p>
            </div>

            {/* Footer Control Panel */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => setShowFineBlockModal(false)}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 font-bold text-xs rounded-xl transition-colors cursor-pointer"
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
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
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