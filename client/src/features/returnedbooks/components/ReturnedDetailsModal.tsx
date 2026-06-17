import type { BookIssueRecord } from "../../../types/transactions";
import { Mail, Phone, BookOpen, RefreshCw, Trash2 } from "lucide-react";

interface ReturnedDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: BookIssueRecord | null;
  onUndoReturn: (issueId: string) => void;
  onDeletePermanent: (issueId: string) => void;
}

export const ReturnedDetailsModal = ({
  isOpen,
  onClose,
  record,
  onUndoReturn,
  onDeletePermanent,
}: ReturnedDetailsModalProps) => {
  if (!isOpen || !record) return null;

  // Mask UUID to clear up visual clutter
  const formattedIssueId =
    record.id && record.id.length >= 4
      ? `ISSUE-${record.id.slice(-4).toUpperCase()}`
      : `ISSUE-${record.id}`;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans select-none text-left">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh] transition-all">
        {/* Header Framework - Matching Reference Module */}
        <div className="flex items-center justify-between border-b border-gray-200 p-5 bg-white">
          <div>
            <h3 className="text-lg font-bold text-[#1A365D] tracking-tight">
              Returned Book Details
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
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#2D3748]">
          <div className="space-y-6">
            {/* Member Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-1.5">
              <span className="text-[11px] font-bold text-[#718096] uppercase tracking-widest block">
                Borrower Profile
              </span>
              <div className="text-sm font-semibold text-[#1A365D]">
                {record.memberName}
              </div>
              <div className="text-xs text-[#718096] font-medium flex items-center gap-1.5">
                <Mail size={12} className="shrink-0 text-[#718096]" />{" "}
                {record.memberEmail || "No email provided"}
              </div>
              <div className="text-xs text-[#718096] font-medium flex items-center gap-1.5">
                <Phone size={12} className="shrink-0 text-[#718096]" />{" "}
                {record.memberPhone || "No contact info"}
              </div>
            </div>

            {/* Book Card */}
            <div className="space-y-1.5 px-1">
              <span className="text-[11px] font-bold text-[#718096] uppercase tracking-widest block">
                Book Details
              </span>
              <div className="text-sm font-semibold text-[#1A365D] flex items-start gap-2">
                <BookOpen
                  size={14}
                  className="mt-0.5 text-[#718096] shrink-0"
                />
                <div>{record.bookTitle}</div>
              </div>
              <div className="text-xs text-[#718096] font-medium pl-5.5">
                Author:{" "}
                <span className="font-semibold text-[#2D3748]">
                  {record.bookAuthor || "Unknown author"}
                </span>
              </div>
            </div>

            {/* Core Timeline Grid */}
            <div className="grid grid-cols-3 gap-2 border-t border-b border-gray-100 py-3.5  text-center text-xs bg-slate-50/50 px-2 rounded-xl">
              <div>
                <span className="text-[11px] font-bold text-[#718096] uppercase block font-sans tracking-wide mb-0.5">
                  Issued
                </span>
                <div className="text-[#2D3748] font-bold">
                  {record.borrowedDate}
                </div>
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#718096] uppercase block font-sans tracking-wide mb-0.5">
                  Due Date
                </span>
                <div className="text-[#2D3748] font-bold">{record.dueDate}</div>
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase block font-sans tracking-wide mb-0.5">
                  Returned
                </span>
                <div className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md inline-block border border-emerald-100 text-xs">
                  {record.returnedDate || "N/A"}
                </div>
              </div>
            </div>

            {/* Operations Layout Action Buttons - Matching layout rules and theme */}
            <div className="pt-2 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => onUndoReturn(record.id)}
                className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={12} /> Revert Return Status
              </button>

              <div className="pt-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-[#718096] uppercase tracking-wider hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-xl transition-all cursor-pointer text-left sm:text-center"
                >
                  Close View
                </button>
                <button
                  type="button"
                  onClick={() => onDeletePermanent(record.id)}
                  className="px-4 py-2 text-xs font-bold text-rose-600 uppercase tracking-wider hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 justify-center sm:justify-start whitespace-nowrap"
                >
                  <Trash2 size={12} /> Delete Record
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
