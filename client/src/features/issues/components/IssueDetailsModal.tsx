import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import type { BookIssueRecord } from "../../../types/transactions";

interface IssueDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: BookIssueRecord | null;
  onMarkAsReturned: (issueId: string) => void;
  onTriggerEdit: () => void;
}

export const IssueDetailsModal = ({ isOpen, onClose, record, onMarkAsReturned, onTriggerEdit }: IssueDetailsModalProps) => {
 const { data: returnCount } = useQuery({
    queryKey: ["memberHistoricalReturnsCount", record?.memberId],
    queryFn: async () => {
      if (!record?.memberId) return null;
      const res = await axiosClient.get(`/issues/member-stats/${record.memberId}`);
      return res.data?.data || res.data;
    },
    enabled: !!record?.memberId && isOpen,
  });

  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 animate-zoom-in">
        <div className="bg-slate-800 p-5 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base">Issue Details</h3>
            <span className="text-xs text-slate-400 font-mono">ID: {record.id}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg cursor-pointer">✕</button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
            <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider block">About Member</span>
            <div className="text-sm font-bold text-slate-900">{record.memberName}</div>
            <div className="text-xs text-slate-500 font-medium">✉️ {record.memberEmail || "No Email Provided"}</div>
            <div className="text-xs text-slate-500 font-medium">📞 {record.memberPhone || "No Phone Contact Registered"}</div>
            
           <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center gap-1.5">
              <span className="text-xs text-slate-600">
                Already borrowed books: <b className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">{returnCount?.currentBorrows ?? 0} books borrowed</b>
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider block">About Book</span>
            <div className="text-sm font-bold text-slate-800">📖 {record.bookTitle}</div>
            <div className="text-xs text-slate-500 pl-5">Author: {record.bookAuthor || "Unknown Catalog Reference"}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-100 py-3 font-mono text-xs">
            <div>
              <span className="text-2xs font-bold text-gray-400 uppercase block font-sans mb-0.5">Borrowed Date</span>
              <div className="text-gray-700 font-semibold">{record.borrowedDate}</div>
            </div>
            <div>
              <span className="text-2xs font-bold text-gray-400 uppercase block font-sans mb-0.5">Deadline Date</span>
              <div className="text-slate-900 font-bold">{record.dueDate}</div>
            </div>
          </div>

          <div className="pt-2 flex justify-between gap-3">
            <button
              onClick={onTriggerEdit}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              📝 Edit Details
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-gray-600">Cancel</button>
              <button
                onClick={() => onMarkAsReturned(record.id)}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm rounded-xl transition-all cursor-pointer"
              >
                ✓ Mark As Returned
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};