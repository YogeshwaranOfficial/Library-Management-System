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
  const formattedIssueId = record.id && record.id.length >= 4 
    ? `ISSUE-${record.id.slice(-4).toUpperCase()}`
    : `ISSUE-${record.id}`;

  return (
    <div className="fixed inset-0 bg-slate-secondary/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-light/10 animate-zoom-in text-left">
        
        {/* Header Block */}
        <div className="bg-slate-secondary px-6 py-5 text-white flex justify-between items-center">
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider">Archived Issue Summary</h3>
            <span className="text-[10px] text-slate-light font-data tracking-widest">{formattedIssueId}</span>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-light hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5 text-slate-secondary">
          {/* Member Card */}
          <div className="bg-canvas-dominant p-4 rounded-xl border border-slate-light/10 space-y-1.5">
            <span className="text-[9px] font-black text-slate-light uppercase tracking-wider block">Borrower Profile</span>
            <div className="text-sm font-bold text-slate-secondary">{record.memberName}</div>
            <div className="text-xs text-slate-light font-medium flex items-center gap-1.5">
              <Mail size={12} className="shrink-0" /> {record.memberEmail || "No Email Bound"}
            </div>
            <div className="text-xs text-slate-light font-medium flex items-center gap-1.5">
              <Phone size={12} className="shrink-0" /> {record.memberPhone || "No Contact Profile"}
            </div>
          </div>

          {/* Book Card */}
          <div className="space-y-1.5 px-1">
            <span className="text-[9px] font-black text-slate-light uppercase tracking-wider block">Media Asset Details</span>
            <div className="text-sm font-bold text-slate-secondary flex items-start gap-2">
              <BookOpen size={14} className="mt-0.5 text-slate-light shrink-0" />
              <div>{record.bookTitle}</div>
            </div>
            <div className="text-xs text-slate-light font-medium pl-5.5">
              Author: <span className="font-semibold text-slate-secondary">{record.bookAuthor || "Unknown Reference"}</span>
            </div>
          </div>

          {/* Core Timeline Grid */}
          <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-light/10 py-3.5 font-data text-center text-[10px]">
            <div>
              <span className="text-[9px] font-black text-slate-light uppercase block font-sans tracking-wider mb-0.5">Issued</span>
              <div className="text-slate-secondary font-bold">{record.borrowedDate}</div>
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-light uppercase block font-sans tracking-wider mb-0.5">Target Due</span>
              <div className="text-slate-secondary font-bold">{record.dueDate}</div>
            </div>
            <div>
              <span className="text-[9px] font-black text-emerald-700 uppercase block font-sans tracking-wider mb-0.5">Dropped Off</span>
              <div className="text-emerald-700 font-black bg-emerald-50 px-1 py-0.5 rounded-md inline-block">
                {record.returnedDate || "N/A"}
              </div>
            </div>
          </div>

          {/* Operational Control Footers */}
          <div className="pt-2 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => onUndoReturn(record.id)}
              className="w-full py-2.5 text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-50/50 hover:bg-amber-100/60 border border-amber-200/40 rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={12} /> Restore Record Desk
            </button>
            
            <div className="flex justify-between items-center gap-3 pt-3 border-t border-slate-light/10">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-light hover:text-slate-secondary cursor-pointer transition-colors"
              >
                Close View
              </button>
              <button
                type="button"
                onClick={() => onDeletePermanent(record.id)}
                className="px-4 py-2 text-xs font-black uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 shadow-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
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