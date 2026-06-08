import type { BookIssueRecord } from "../../../types/transactions";

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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 animate-zoom-in">
        
        {/* Header Block */}
        <div className="bg-slate-700 p-5 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base">Archived Issue Summary</h3>
            <span className="text-xs text-slate-400 font-mono tracking-wider">{formattedIssueId}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg cursor-pointer transition-colors">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Member Card */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
            <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider block">Borrower Profile</span>
            <div className="text-sm font-bold text-slate-900">{record.memberName}</div>
            <div className="text-xs text-slate-500 font-medium">✉️ {record.memberEmail || "No Email Bound"}</div>
            <div className="text-xs text-slate-500 font-medium">📞 {record.memberPhone || "No Contact Profile"}</div>
          </div>

          {/* Book Card */}
          <div className="space-y-1">
            <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider block">Media Asset Details</span>
            <div className="text-sm font-bold text-slate-800">📖 {record.bookTitle}</div>
            <div className="text-xs text-slate-500 pl-5">Author: {record.bookAuthor || "Unknown Reference"}</div>
          </div>

          {/* Core Timeline Grid */}
          <div className="grid grid-cols-3 gap-2 border-t border-b border-gray-100 py-3 font-mono text-center text-2xs">
            <div>
              <span className="text-3xs font-bold text-gray-400 uppercase block font-sans mb-0.5">Issued</span>
              <div className="text-gray-700 font-semibold">{record.borrowedDate}</div>
            </div>
            <div>
              <span className="text-3xs font-bold text-gray-400 uppercase block font-sans mb-0.5">Target Due</span>
              <div className="text-gray-600 font-semibold">{record.dueDate}</div>
            </div>
            <div>
              <span className="text-3xs font-bold text-emerald-600 uppercase block font-sans mb-0.5">Dropped Off</span>
              <div className="text-emerald-700 font-bold bg-emerald-50 px-1 py-0.5 rounded-md inline-block">
                {record.returnedDate || "N/A"}
              </div>
            </div>
          </div>

          {/* Operational Control Footers */}
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => onUndoReturn(record.id)}
              className="w-full py-2.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all cursor-pointer shadow-3xs"
            >
              🔄 Restore Record
            </button>
            
            <div className="flex justify-between items-center gap-3 pt-2 border-t border-gray-50">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
              >
                Close View
              </button>
              <button
                type="button"
                onClick={() => onDeletePermanent(record.id)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                🗑️ Delete Record 
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};