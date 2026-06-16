import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import type { BookIssueRecord } from "../../../types/transactions";
import { useNavigate } from "react-router-dom"; 

import {
  AlertTriangle,
  ArrowRight,
  X,
  User,
  BookOpen,
  Calendar,
  Edit2,
  CheckCircle2,
} from "lucide-react";

interface IssueDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: BookIssueRecord | null;
  onMarkAsReturned: (issueId: string) => void;
  onTriggerEdit: () => void;
}

export const IssueDetailsModal = ({
  isOpen,
  onClose,
  record,
  onMarkAsReturned,
  onTriggerEdit,
}: IssueDetailsModalProps) => {
  const navigate = useNavigate();
  const [showFineBlockModal, setShowFineBlockModal] = useState(false);

  const { data: memberStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["memberHistoricalReturnsCount", record?.memberId],
    queryFn: async () => {
      if (!record?.memberId) return null;
      const res = await axiosClient.get(
        `/issues/member-stats/${record.memberId}`,
      );
      return res.data?.data || res.data;
    },
    enabled: !!record?.memberId && isOpen,
  });

  if (!isOpen || !record) return null;

  const formattedIssueId =
    record.id && record.id.length >= 4
      ? `ISSUE-${record.id.slice(-4).toUpperCase()}`
      : `ISSUE-${record.id}`;

  const handleReturnClick = () => {
    const hasUnpaidFine =
      record.fineAmount && record.fineAmount > 0 && !record.finePaidStatus;

    if (hasUnpaidFine) {
      setShowFineBlockModal(true);
    } else {
      onMarkAsReturned(record.id);
    }
  };

  return (
    <>
      {/* Primary Issue Details Window */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm font-sans select-none text-left">
        <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl transition-all overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]">
          
          <div className="flex items-center justify-between border-b border-gray-200 p-5 bg-white">
            <div>
              <h3 className="text-lg font-bold text-[#1A365D] tracking-tight">
                Issue Details
              </h3>
              <p className="text-[11px] text-[#718096] font-bold mt-1 tracking-wider uppercase">
                ID: {formattedIssueId}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[#718096] hover:text-[#1A365D] hover:bg-gray-100 transition-all text-xs font-bold cursor-pointer p-1.5 rounded-full"
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#2D3748]">
            <div className="space-y-6">
              
              {/* Member Profile */}
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-1.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <User size={14} className="text-[#718096]" />
                  <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block">
                    Profile Account Context
                  </span>
                </div>
                <div className="text-sm font-bold text-[#1A365D]">
                  {record.memberName}
                </div>
                <div className="text-xs text-[#718096] font-medium">
                  ✉️ {record.memberEmail || "No Email Provided"}
                </div>
                <div className="text-xs text-[#718096] font-medium">
                  📞 {record.memberPhone || "No Phone Contact Registered"}
                </div>

                <div className="pt-2.5 mt-2 border-t border-gray-200 flex items-center gap-1.5">
                  <span className="text-xs font-medium text-[#2D3748]">
                    Active Resource Holdings:{" "}
                    {isLoadingStats ? (
                      <span className="text-[11px] text-[#718096] animate-pulse font-bold tracking-wider uppercase">
                        Calculating...
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        {memberStats?.currentBorrows ?? 0} books outstanding
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Book Details */}
              <div className="space-y-1 pl-1">
                <div className="flex items-center gap-1.5">
                  <BookOpen size={14} className="text-[#718096]" />
                  <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block">
                    Checked Inventory Volume
                  </span>
                </div>
                <div className="text-sm font-bold text-[#1A365D]">
                  📖 {record.bookTitle}
                </div>
                <div className="text-xs text-[#718096] font-medium pl-5">
                  Catalog Author: {record.bookAuthor || "Unknown Reference"}
                </div>
              </div>

              {/* Timeline Grid */}
              <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-100 py-3 font-mono text-xs bg-slate-50/50 px-2 rounded-xl">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Calendar size={13} className="text-[#718096]" />
                    <span className="text-[11px] font-bold text-[#718096] uppercase block font-sans tracking-wide">
                      Checkout Signature
                    </span>
                  </div>
                  <div className="text-[#2D3748] font-bold pl-4">
                    {record.borrowedDate}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Calendar size={13} className="text-[#1A365D]" />
                    <span className="text-[11px] font-bold text-[#1A365D] uppercase block font-sans tracking-wide">
                      Target Return Due
                    </span>
                  </div>
                  <div className="text-[#2D3748] font-bold pl-4">
                    {record.dueDate}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={onTriggerEdit}
                  className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider hover:bg-gray-100 border border-gray-200 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider hover:bg-gray-50 border border-transparent rounded-xl transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleReturnClick}
                    className="px-5 py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm text-center tracking-wide inline-flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={13} /> Mark As Returned
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* SECONDARY PORTAL LAYER: Fine Blocking Warning Pop-Up */}
      {showFineBlockModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm font-sans select-none text-left">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200 flex flex-col overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-gray-200 p-5 bg-white">
              <div>
                <h3 className="text-lg font-bold text-[#1A365D] tracking-tight">
                  Return Blocked: Pending Balance
                </h3>
                <p className="text-[11px] text-rose-600 font-bold mt-1 tracking-wider uppercase">
                  Financial Validation Exception Bound
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFineBlockModal(false)}
                className="text-[#718096] hover:text-[#1A365D] hover:bg-gray-100 transition-all text-xs font-bold cursor-pointer p-1.5 rounded-full"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-[#2D3748]">
              <p className="font-medium leading-relaxed text-[#718096]">
                The library core system cannot authorize this inventory shelf
                check-in sequence because an unpaid fine liability matches this
                active operation.
              </p>

              {/* Data Summary Box */}
              <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#718096] uppercase text-[11px] tracking-wide font-bold">
                    Account Holder:
                  </span>
                  <span className="font-bold text-[#1A365D]">
                    {record.memberName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#718096] uppercase text-[11px] tracking-wide font-bold">
                    Asset Volume:
                  </span>
                  <span className="font-bold text-[#1A365D] max-w-48 truncate">
                    {record.bookTitle}
                  </span>
                </div>
                <div className="h-px bg-gray-200 my-1.5" />
                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-rose-700 font-bold uppercase text-[11px] tracking-wide flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Overdue Debt:
                  </span>
                  <span className="text-base font-bold font-mono text-[#2D3748]">
                    ₹{record.fineAmount}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-left">
                <span className="block text-[11px] font-bold uppercase tracking-widest text-rose-700 mb-1">
                  Policy Rule Verification
                </span>
                <p className="text-xs text-rose-800 leading-relaxed font-medium">
                  Outstanding debt liabilities must clear through the cash registration counter desk 
                  before restoring book items back into system catalog slots.
                </p>
              </div>
            </div>

            {/* Footer Control Panel */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2 text-xs font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setShowFineBlockModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 tracking-wider hover:bg-gray-100 border border-gray-200 rounded-xl transition-all cursor-pointer"
              >
                Dismiss Alert
              </button>
              <button
                type="button"
               onClick={() => { setShowFineBlockModal(false); onClose();
                  navigate("/fines", { state: { autoOpenIssueId: record.id, autoOpenSettlement: true } });
                }}
                className="px-5 py-2.5 bg-[#2B6CB0] hover:bg-[#18579a] text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm text-center tracking-wide inline-flex items-center gap-1.5"
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