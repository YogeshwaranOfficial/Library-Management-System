import type { BookIssueRecord } from "../../../types/transactions";
import { Mail, Phone, BookOpen, RefreshCw, Trash2, X } from "lucide-react";

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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans text-xs sm:text-sm text-text-main text-left animate-fade-in">
      <div className="bg-card-bg rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-border-main animate-zoom-in">
        {/* Header Block */}
        <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
              Returned Book Details
            </h3>
            <span className="text-[11px] text-slate-400 font-mono tracking-widest">
              {formattedIssueId}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Member Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-border-main space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
              Borrower Profile
            </span>
            <div className="text-sm font-bold text-text-main">
              {record.memberName}
            </div>
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <Mail size={12} className="shrink-0 text-slate-400" />{" "}
              {record.memberEmail || "No email provided"}
            </div>
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <Phone size={12} className="shrink-0 text-slate-400" />{" "}
              {record.memberPhone || "No contact info"}
            </div>
          </div>

          {/* Book Card */}
          <div className="space-y-1.5 px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
              Book Details
            </span>
            <div className="text-sm font-bold text-text-main flex items-start gap-2">
              <BookOpen size={14} className="mt-0.5 text-slate-400 shrink-0" />
              <div>{record.bookTitle}</div>
            </div>
            <div className="text-xs text-slate-500 font-medium pl-5.5">
              Author:{" "}
              <span className="font-semibold text-text-main">
                {record.bookAuthor || "Unknown author"}
              </span>
            </div>
          </div>

          {/* Core Timeline Grid */}
          <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-100 py-3.5 font-mono text-center text-[11px]">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block font-sans tracking-wide mb-0.5">
                Issued
              </span>
              <div className="text-text-main font-bold">
                {record.borrowedDate}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block font-sans tracking-wide mb-0.5">
                Due Date
              </span>
              <div className="text-text-main font-bold">{record.dueDate}</div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase block font-sans tracking-wide mb-0.5">
                Returned
              </span>
              <div className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md inline-block">
                {record.returnedDate || "N/A"}
              </div>
            </div>
          </div>

          {/* Operational Control Footers */}
          <div className="pt-2 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => onUndoReturn(record.id)}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={12} /> Revert Return Status
            </button>

            <div className="flex justify-between items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-text-main cursor-pointer transition-colors"
              >
                Close View
              </button>
              <button
                type="button"
                onClick={() => onDeletePermanent(record.id)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 shadow-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <Trash2 size={12} /> Delete Record
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
