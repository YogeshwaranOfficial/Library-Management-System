import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import type { BookIssueRecord } from "../../../types/transactions";
import { useNavigate } from "react-router-dom";
import { UnpaidFineAlertModal } from "./UnpaidFineAlertModal";

import {
  X,
  User,
  BookOpen,
  Calendar,
  Edit2,
  CheckCircle2,
  FileText,
} from "lucide-react";

interface IssueDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: BookIssueRecord | null;
  // 🚀 Updated callback signature to pass condition evaluation data down upstream
  onMarkAsReturned: (issueId: string, condition: "GOOD" | "DAMAGED", damage_description?: string) => void;
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
  
  // 🚀 New Local State Vectors for Return processing rules
  const [bookCondition, setBookCondition] = useState<"GOOD" | "DAMAGED">("GOOD");
  const [damageDescription, setDamageDescription] = useState("");
  const MAX_CHARS = 255;

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
    // Basic verification check: validation blocks if damaged variant lacks description reasons
    if (bookCondition === "DAMAGED" && !damageDescription.trim()) {
      return;
    }

    const hasUnpaidFine =
      record.fineAmount && record.fineAmount > 0 && !record.finePaidStatus;

    if (hasUnpaidFine) {
      // 💸 UNPAID FINE DETECTED: Trigger the modal portal
      setShowFineBlockModal(true);
    } else {
      // 🟢 DIRECT CLEAN RETURN COMMIT: Trigger with context variables attached
      onMarkAsReturned(
        record.id, 
        bookCondition, 
        bookCondition === "DAMAGED" ? damageDescription.trim() : undefined
      );
    }
  };

  const charactersRemaining = MAX_CHARS - damageDescription.length;

  return (
    <>
      {/* Primary Issue Details Window */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm font-sans text-left">
        <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl transition-all overflow-hidden border border-gray-200 flex flex-col max-h-[95vh]">
          
          <div className="flex items-center justify-between border-b border-gray-200 p-5 bg-white">
            <div>
              <h3 className="text-lg font-bold text-[#1A365D] tracking-tight">
                Issue Details & Return Processor
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

          <div className="p-6 overflow-y-auto space-y-5 flex-1 text-[#2D3748]">
            <div className="space-y-5">
              
              {/* Member Profile Block */}
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
                  `📖 ${record.bookTitle}`
                </div>
                <div className="text-xs text-[#718096] font-medium pl-5">
                  Catalog Author: {record.bookAuthor || "Unknown Reference"}
                </div>
              </div>

              {/* Timeline Grid */}
              <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-100 py-3 text-xs bg-slate-50/50 px-2 rounded-xl">
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

              {/* ==================== 🚀 NEW DYNAMIC ENTRY DESK: CONDITION EVALUATOR ==================== */}
              <div className="border border-blue-100 bg-blue-50/30 rounded-xl p-4 space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-[#1A365D] uppercase tracking-wider block mb-2">
                    Return Condition Status
                  </label>
                  <div className="flex items-center gap-6 text-xs">
                    <label className="flex items-center gap-2 font-bold text-[#2D3748] cursor-pointer group">
                      <input
                        type="radio"
                        name="bookCondition"
                        value="GOOD"
                        checked={bookCondition === "GOOD"}
                        onChange={() => setBookCondition("GOOD")}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="group-hover:text-emerald-600 transition-colors">Good Condition</span>
                    </label>

                    <label className="flex items-center gap-2 font-bold text-[#2D3748] cursor-pointer group">
                      <input
                        type="radio"
                        name="bookCondition"
                        value="DAMAGED"
                        checked={bookCondition === "DAMAGED"}
                        onChange={() => setBookCondition("DAMAGED")}
                        className="w-4 h-4 text-rose-600 border-gray-300 focus:ring-rose-500 cursor-pointer"
                      />
                      <span className="group-hover:text-rose-600 transition-colors">Damaged Book</span>
                    </label>
                  </div>
                </div>

                {/* Conditional Textarea Segment */}
                {bookCondition === "DAMAGED" && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-rose-700 flex items-center gap-1">
                        <FileText size={12}/> Damage Reason
                      </span>
                      {/* Character Count System Interface */}
                      <span className={`px-2 py-0.5 rounded-md ${
                        charactersRemaining <= 20 
                          ? "bg-rose-100 text-rose-700 animate-pulse" 
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {charactersRemaining} characters left
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={MAX_CHARS}
                      value={damageDescription}
                      onChange={(e) => setDamageDescription(e.target.value)}
                      placeholder="Please explicitly describe the exact damage details found on this volume item..."
                      className="w-full text-xs p-3 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-rose-400 bg-white placeholder-gray-400 outline-none font-medium transition-all"
                    />
                    {damageDescription.trim().length === 0 && (
                      <p className="text-[12px] text-rose-600 tracking-wide">
                        ⚠️ Reason description is mandatory before returning damaged items.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
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
                    disabled={bookCondition === "DAMAGED" && !damageDescription.trim()}
                    className="px-5 py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] disabled:opacity-40 disabled:hover:bg-[#2B6CB0] disabled:cursor-not-allowed text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm text-center tracking-wide inline-flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={13} /> Mark As Returned
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    <UnpaidFineAlertModal
      isOpen={showFineBlockModal}
      onClose={() => setShowFineBlockModal(false)}
      memberName={record.memberName}
      bookTitle={record.bookTitle}
      fineAmount={record.fineAmount}
      
      // Pass states down into the updated interface parameters here:
      pendingCondition={bookCondition}
      pendingDescription={bookCondition === "DAMAGED" ? damageDescription : null}
      
      onNavigateToFines={() => {
        navigate("/fines", {
          state: {
            autoOpenIssueId: record.id,
            autoOpenSettlement: true,
            pendingCondition: bookCondition,
            pendingDescription: bookCondition === "DAMAGED" ? damageDescription.trim() : null,
          },
        });
        if (onClose) onClose();
      }}
    />
    </>
  );
};