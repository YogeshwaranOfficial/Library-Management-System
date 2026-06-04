import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import type { BookIssueRecord } from "../../../types/transactions";
import { toast } from "sonner";

// 🛡️ Strong local interfaces matching our backend payloads to pass ESLint rules
interface SearchCompliance {
  status: "GOOD" | "EXPIRED" | "LIMIT_EXCEEDED" | "WARNING_LAST_SLOT" | "AVAILABLE" | "OUT_OF_STOCK";
  message: string;
  isBlocked: boolean;
}

interface MemberSearchItem {
  member_id: string;
  name: string;
  phone_number: string;
  membership_status: string;
  expiry_date: string;
  plan_name: string;
  maxAllowed: number;
  currentBorrows: number;
  compliance: SearchCompliance;
}

interface BookSearchItem {
  book_id: string;
  title: string;
  author: string;
  available_copies: number;
  compliance: SearchCompliance;
}

interface LocalBorrowMetrics {
  currentBorrows: number;
  maxAllowed: number;
  isExpired: boolean;
  expiryDate: string;
  complianceStatus: string;
  complianceMessage: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { memberId: string; bookId: string; borrowDate: string; dueDate: string }) => void;
  editingRecord?: BookIssueRecord | null;
}

export const TransactionModal = ({ isOpen, onClose, onSubmit, editingRecord }: TransactionModalProps) => {
  const getTodayString = () => new Date().toISOString().split("T")[0];
  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const [memberSearch, setMemberSearch] = useState(editingRecord ? editingRecord.memberName : "");
  const [selectedMember, setSelectedMember] = useState<MemberSearchItem | null>(
    editingRecord
      ? {
          member_id: editingRecord.memberId,
          name: editingRecord.memberName,
          phone_number: "",
          membership_status: "ACTIVE",
          expiry_date: "",
          plan_name: "Active Plan",
          maxAllowed: 20,
          currentBorrows: 0,
          compliance: { status: "GOOD", message: "", isBlocked: false }
        }
      : null
  );
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  const [bookSearch, setBookSearch] = useState(editingRecord ? editingRecord.bookTitle : "");
  const [selectedBook, setSelectedBook] = useState<BookSearchItem | null>(
    editingRecord
      ? {
          book_id: editingRecord.bookId,
          title: editingRecord.bookTitle,
          author: "",
          available_copies: 1,
          compliance: { status: "AVAILABLE", message: "", isBlocked: false }
        }
      : null
  );
  const [showBookDropdown, setShowBookDropdown] = useState(false);

  const [dueDate, setDueDate] = useState(editingRecord ? editingRecord.dueDate : "");
  const [borrowMetrics, setBorrowMetrics] = useState<LocalBorrowMetrics>({
    currentBorrows: 0,
    maxAllowed: 20,
    isExpired: false,
    expiryDate: "",
    complianceStatus: "GOOD",
    complianceMessage: "",
  });

  // Async load allowance metrics safely when a member is selected
  useEffect(() => {
    if (selectedMember && isOpen && !editingRecord) {
      axiosClient.get(`/issues/member-allowance/${selectedMember.member_id}`).then((res) => {
        const metrics = res.data?.data || res.data;
        setBorrowMetrics({
          currentBorrows: metrics.currentBorrows || 0,
          maxAllowed: metrics.maxAllowed || 20,
          isExpired: selectedMember.membership_status === "EXPIRED" || selectedMember.compliance?.status === "EXPIRED",
          expiryDate: selectedMember.expiry_date || "",
          complianceStatus: selectedMember.compliance?.status || "GOOD",
          complianceMessage: selectedMember.compliance?.message || "",
        });
      });
    }
  }, [selectedMember, isOpen, editingRecord]);

  const { data: suggestedMembers = [] } = useQuery<MemberSearchItem[]>({
    queryKey: ["memberQuerySuggestions", memberSearch],
    queryFn: async () => {
      if (!memberSearch || editingRecord) return [];
      const res = await axiosClient.get(`/members/search?q=${memberSearch}`);
      return res.data?.data || res.data || [];
    },
    enabled: memberSearch.length > 0 && !editingRecord,
  });

  const { data: suggestedBooks = [] } = useQuery<BookSearchItem[]>({
    queryKey: ["bookQuerySuggestions", bookSearch],
    queryFn: async () => {
      if (!bookSearch || editingRecord) return [];
      const res = await axiosClient.get(`/books/search?q=${bookSearch}`);
      return res.data?.data || res.data || [];
    },
    enabled: bookSearch.length > 0 && !editingRecord,
  });

  if (!isOpen) return null;

  // Real-time computation checking input content boundaries
  const hasMemberText = memberSearch.trim().length > 0;
  const isSelectedMemberMatchingInput = selectedMember && selectedMember.name === memberSearch;
  const showMemberInfoCard = hasMemberText && isSelectedMemberMatchingInput && !editingRecord;

  const reachedPlanCap = borrowMetrics.currentBorrows >= borrowMetrics.maxAllowed || borrowMetrics.complianceStatus === "LIMIT_EXCEEDED";
  const isSubmissionBlocked = (!editingRecord && (borrowMetrics.isExpired || reachedPlanCap || (selectedBook && selectedBook.available_copies <= 0))) || !selectedMember || !selectedBook || !dueDate;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmissionBlocked) return;

    onSubmit({
      memberId: selectedMember.member_id,
      bookId: selectedBook.book_id,
      borrowDate: getTodayString(),
      dueDate,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 animate-zoom-in">
        <div className="bg-teal-600 p-5 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">{editingRecord ? "Adjust Loan Parameters" : "Issue New Book Voucher"}</h3>
          <button type="button" onClick={onClose} className="text-teal-200 hover:text-white text-lg">✕</button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          
          {/* 1. MEMBER LOOKUP INPUT SECTION */}
          <div className="relative">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">Member Name</label>
            <input
              type="text"
              disabled={!!editingRecord}
              value={memberSearch}
              onChange={(e) => { 
                setMemberSearch(e.target.value); 
                setShowMemberDropdown(true); 
              }}
              placeholder="Search member name (e.g. Alex...)"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100"
            />
            {showMemberDropdown && suggestedMembers.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50 divide-y divide-gray-50">
                {suggestedMembers.map((m) => {
                  const isBlocked = m.compliance?.isBlocked;
                  const complianceStatus = m.compliance?.status;

                  return (
                    <li
                      key={m.member_id}
                      onClick={() => {
                        if (isBlocked) {
                          toast.error(m.compliance?.message || "Cannot select member profile due to active policy blocks.");
                          return;
                        }
                        setMemberSearch(m.name);
                        setSelectedMember(m);
                        setShowMemberDropdown(false);
                      }}
                      className={`p-2.5 text-xs flex justify-between items-center transition-colors cursor-pointer ${
                        isBlocked 
                          ? "bg-rose-50/70 text-rose-800 hover:bg-rose-100/80" 
                          : complianceStatus === "WARNING_LAST_SLOT"
                            ? "bg-amber-50/60 text-amber-900 hover:bg-amber-100/70"
                            : "hover:bg-slate-50 text-gray-700"
                      }`}
                    >
                      <div>
                        <span className={`font-bold block ${isBlocked ? "line-through text-rose-900" : ""}`}>{m.name}</span>
                        <span className="text-gray-400 font-mono text-2xs">📞 {m.phone_number || "No Contact Profile"}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-2xs font-extrabold tracking-wide uppercase ${
                        isBlocked ? "bg-rose-200 text-rose-900" : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {complianceStatus === "EXPIRED" ? "Expired (Blocked)" : complianceStatus === "LIMIT_EXCEEDED" ? "Limit Full" : m.plan_name}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* DYNAMIC MEMBER INFO OVERLAY DISPLAY CARD */}
          {showMemberInfoCard && (
            <div className={`p-3 rounded-xl border text-xs space-y-1 ${
              borrowMetrics.complianceStatus === "LIMIT_EXCEEDED" || borrowMetrics.isExpired
                ? "bg-rose-50 border-rose-200 text-rose-900" 
                : borrowMetrics.complianceStatus === "WARNING_LAST_SLOT"
                  ? "bg-amber-50 border-amber-200 text-amber-900"
                  : "bg-teal-50/50 border-teal-100 text-teal-950"
            }`}>
              <div className="font-bold flex justify-between">
                <span>Current Plan Allocation Load:</span>
                <span>{borrowMetrics.currentBorrows} / {borrowMetrics.maxAllowed} Assets Held</span>
              </div>
              <p className="text-2xs opacity-90 font-medium">
                {borrowMetrics.complianceMessage || `✓ Profile clear. Member has ${borrowMetrics.maxAllowed - borrowMetrics.currentBorrows} open checkout channels.`}
              </p>
            </div>
          )}

          {/* 2. BOOK LOOKUP INPUT SECTION */}
          <div className="relative">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">Book Name</label>
            <input
              type="text"
              disabled={!!editingRecord}
              value={bookSearch}
              onChange={(e) => { 
                setBookSearch(e.target.value); 
                setShowBookDropdown(true); 
              }}
              placeholder="Seach book name or author name..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100"
            />
            {showBookDropdown && suggestedBooks.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50 divide-y divide-gray-50">
                {suggestedBooks.map((b) => {
                  const outOfStock = b.compliance?.isBlocked || b.available_copies <= 0;
                  return (
                    <li
                      key={b.book_id}
                      onClick={() => {
                        if (outOfStock) {
                          toast.error("Asset unavailable: Zero matching items remain on library storage shelves.");
                          return;
                        }
                        setBookSearch(b.title);
                        setSelectedBook(b);
                        setShowBookDropdown(false);
                      }}
                      className={`p-2.5 text-xs flex justify-between items-center cursor-pointer transition-colors ${
                        outOfStock ? "bg-rose-50/80 text-rose-800 hover:bg-rose-100/70" : "hover:bg-slate-50 text-gray-700"
                      }`}
                    >
                      <div>
                        <span className="font-bold block">📖 {b.title}</span>
                        <span className="text-gray-400 text-2xs block">Author: {b.author}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-2xs font-bold ${
                        outOfStock ? "bg-rose-200 text-rose-900" : "bg-slate-100 text-slate-700"
                      }`}>
                        {outOfStock ? "Out of Stock" : `Copies: ${b.available_copies}`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* DYNAMIC SELECTED BOOK INFORMATION DISPLAY BLOCK */}
          {selectedBook && bookSearch.trim() === selectedBook.title && (
            <div className={`p-3 rounded-xl border text-xs flex justify-between items-center ${
              selectedBook.available_copies <= 0 ? "bg-rose-50 border-rose-200 text-rose-950" : "bg-slate-50 border-gray-200 text-gray-800"
            }`}>
              <div>
                <h4 className="font-bold text-gray-900">📚 Selected Book</h4>
                <p className="text-2xs text-gray-500 font-medium">{selectedBook.title} — By {selectedBook.author}</p>
              </div>
              {/* <div className="text-right">
                <span className={`text-2xs font-extrabold px-2 py-0.5 rounded-md block ${
                  selectedBook.available_copies <= 0 ? "bg-rose-200 text-rose-900" : "bg-teal-100 text-teal-900"
                }`}>
                  {selectedBook.available_copies <= 0 ? "Stock Depleted" : `${selectedBook.available_copies} Copies In Stack`}
                </span>
              </div> */}
            </div>
          )}

          {/* 3. CALENDAR WORK PERIOD SETTINGS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Borrow Date (Today)</label>
              <input type="date" readOnly value={getTodayString()} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 outline-hidden focus:ring-0" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">Return Date</label>
              <input
                type="date"
                value={dueDate}
                min={getTomorrowString()}
                max={borrowMetrics.expiryDate ? borrowMetrics.expiryDate.split("T")[0] : undefined}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>

          {/* 4. MODAL ACTION BUTTONS TERMINAL */}
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">Cancel</button>
            <button
              type="submit"
              disabled={isSubmissionBlocked}
              className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm rounded-xl transition-all cursor-pointer"
            >
              {editingRecord ? "Save Record Changes" : "Confirm Asset Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};