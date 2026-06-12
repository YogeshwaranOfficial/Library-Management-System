import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import type { BookIssueRecord } from "../../../types/transactions";
import { toast } from "sonner";
import { X, User, BookOpen, Calendar, HelpCircle } from "lucide-react";

// 🛡️ Explicit type extension to handle conditional backend properties without using 'any'
interface ExtendedBookIssueRecord extends BookIssueRecord {
  membershipExpiryDate?: string;
  expiryDate?: string;
}

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
  editingRecord?: ExtendedBookIssueRecord | null;
}

export const TransactionModal = ({ isOpen, onClose, onSubmit, editingRecord }: TransactionModalProps) => {
  const getTodayString = () => new Date().toISOString().split("T")[0];
  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  // Helper utility to safely extract clean YYYY-MM-DD from any timestamp variations
  const formatToISODate = (dateInput?: string | null) => {
    if (!dateInput) return "";
    return dateInput.split("T")[0];
  };

  // ✨ Structural fallback for edit sessions
  const fixedRecordExpiry = editingRecord ? (editingRecord.membershipExpiryDate || editingRecord.expiryDate || "") : "";

  // ✨ Initial State Configuration
  const [memberSearch, setMemberSearch] = useState(editingRecord ? editingRecord.memberName : "");
  const [selectedMember, setSelectedMember] = useState<MemberSearchItem | null>(
    editingRecord
      ? {
          member_id: editingRecord.memberId,
          name: editingRecord.memberName,
          phone_number: editingRecord.memberPhone || "",
          membership_status: "ACTIVE",
          expiry_date: fixedRecordExpiry,
          plan_name: "Active Loan Lifecycle",
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
          author: editingRecord.bookAuthor || "",
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
    expiryDate: fixedRecordExpiry,
    complianceStatus: "GOOD",
    complianceMessage: "",
  });

  // ✨ Async Network Lifecycle Synchronization
  useEffect(() => {
    if (selectedMember && isOpen) {
      axiosClient.get(`/issues/member-allowance/${selectedMember.member_id}`)
        .then((res) => {
          const metrics = res.data?.data || res.data;
          
          // Fallback parsing priority order for custom API schemas
          const dynamicExpiry = metrics.expiryDate || metrics.membershipExpiryDate || selectedMember.expiry_date || fixedRecordExpiry;

          setBorrowMetrics({
            currentBorrows: metrics.currentBorrows || 0,
            maxAllowed: metrics.maxAllowed || 20,
            isExpired: selectedMember.membership_status === "EXPIRED" || selectedMember.compliance?.status === "EXPIRED",
            expiryDate: dynamicExpiry,
            complianceStatus: selectedMember.compliance?.status || "GOOD",
            complianceMessage: selectedMember.compliance?.message || "",
          });
        })
        .catch(() => {
          // Keep the baseline structural record expiration values safe even if server fails
          setBorrowMetrics(prev => ({ 
            ...prev, 
            expiryDate: fixedRecordExpiry 
          }));
        });
    }
  }, [selectedMember, isOpen, editingRecord, fixedRecordExpiry]);

  // Data Providers
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

  const hasMemberText = memberSearch.trim().length > 0;
  const isSelectedMemberMatchingInput = selectedMember && selectedMember.name === memberSearch;
  
  // Ensure info card stays loaded instantly on edit parameters
  const showMemberInfoCard = !!editingRecord || (hasMemberText && isSelectedMemberMatchingInput);

  const reachedPlanCap = borrowMetrics.currentBorrows >= borrowMetrics.maxAllowed || borrowMetrics.complianceStatus === "LIMIT_EXCEEDED";
  
  // 🔒 Fixed Absolute Calendaring System
  const cleanDueDate = formatToISODate(dueDate);
  const maxAllowedDate = formatToISODate(borrowMetrics.expiryDate);
  const minAllowedDate = editingRecord ? formatToISODate(editingRecord.borrowedDate) : getTomorrowString();

  const isDateRangeInvalid = !!(maxAllowedDate && cleanDueDate > maxAllowedDate) || (cleanDueDate < minAllowedDate);

  const isSubmissionBlocked = 
    !selectedMember || 
    !selectedBook || 
    !dueDate ||
    isDateRangeInvalid ||
    (!editingRecord && (borrowMetrics.isExpired || reachedPlanCap || (selectedBook && selectedBook.available_copies <= 0)));

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmissionBlocked) return;

    onSubmit({
      memberId: selectedMember.member_id,
      bookId: selectedBook.book_id,
      borrowDate: editingRecord ? editingRecord.borrowedDate : getTodayString(),
      dueDate,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans text-xs sm:text-sm text-slate-700 text-left">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-light/10 animate-zoom-in">
        
        {/* HEADER BLOCK BRANDED SYSTEM */}
        <div className="bg-slate-900 p-5 text-white flex justify-between items-center border-b border-slate-light/10">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Circulation Terminal</h3>
            <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">{editingRecord ? "Edit issue details" : "Issue New Book"}</h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
          
          {/* 1. MEMBER LOOKUP INPUT SECTION */}
          <div className="relative">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Member Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              <input
                type="text"
                disabled={!!editingRecord}
                value={memberSearch}
                onChange={(e) => { 
                  setMemberSearch(e.target.value); 
                  setShowMemberDropdown(true); 
                }}
                placeholder="Search member profile index..."
                className="w-full pl-10 pr-4 py-2 bg-canvas-dominant border border-slate-light/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            
            {showMemberDropdown && suggestedMembers.length > 0 && !editingRecord && (
              <ul className="absolute left-0 right-0 mt-1 bg-white border border-slate-light/10 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50 divide-y divide-slate-light/5">
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
                      className={`p-3 text-xs flex justify-between items-center transition-colors cursor-pointer ${
                        isBlocked 
                          ? "bg-rose-50/70 text-rose-800 hover:bg-rose-100/80" 
                          : complianceStatus === "WARNING_LAST_SLOT"
                            ? "bg-amber-50/60 text-amber-900 hover:bg-amber-100/70"
                            : "hover:bg-canvas-dominant text-slate-700"
                      }`}
                    >
                      <div>
                        <span className={`font-bold block text-xs sm:text-sm ${isBlocked ? "line-through text-rose-900/60" : "text-slate-900"}`}>{m.name}</span>
                        <span className="text-slate-500 font-mono text-[11px]">📞 {m.phone_number || "No Contact Profile"}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                        isBlocked ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"
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
            <div className={`p-4 rounded-xl border text-xs space-y-1.5 transition-all ${
              borrowMetrics.complianceStatus === "LIMIT_EXCEEDED" || borrowMetrics.isExpired
                ? "bg-rose-50/50 border-rose-100 text-rose-950" 
                : borrowMetrics.complianceStatus === "WARNING_LAST_SLOT"
                  ? "bg-amber-50/50 border-amber-100 text-amber-950"
                  : "bg-slate-50 border-slate-200 text-slate-700"
            }`}>
              <div className="font-bold flex justify-between items-center">
                <span className="text-slate-500 uppercase text-[11px] tracking-wide">Plan Load Allocation:</span>
                <span className="font-bold text-xs sm:text-sm text-slate-900">{borrowMetrics.currentBorrows} / {borrowMetrics.maxAllowed} Assets Held</span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {borrowMetrics.complianceMessage || `✓ Active operational context verified. Authorized for custom parameters.`}
              </p>
              {maxAllowedDate && (
                <p className="text-[11px] text-rose-600 font-mono font-bold uppercase tracking-wider pt-1 border-t border-slate-200">
                  📅 Plan Expiration Boundary: {maxAllowedDate}
                </p>
              )}
            </div>
          )}

          {/* 2. BOOK LOOKUP INPUT SECTION */}
          <div className="relative">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Book Asset Index</label>
            <div className="relative">
              <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              <input
                type="text"
                disabled={!!editingRecord}
                value={bookSearch}
                onChange={(e) => { 
                  setBookSearch(e.target.value); 
                  setShowBookDropdown(true); 
                }}
                placeholder="Search catalog by system title or author..."
                className="w-full pl-10 pr-4 py-2 bg-canvas-dominant border border-slate-light/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            
            {showBookDropdown && suggestedBooks.length > 0 && !editingRecord && (
              <ul className="absolute left-0 right-0 mt-1 bg-white border border-slate-light/10 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50 divide-y divide-slate-light/5">
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
                      className={`p-3 text-xs flex justify-between items-center cursor-pointer transition-colors ${
                        outOfStock ? "bg-rose-50/80 text-rose-800 hover:bg-rose-100/70" : "hover:bg-canvas-dominant text-slate-700"
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 block">📖 {b.title}</span>
                        <span className="text-slate-500 text-[11px] block mt-0.5 font-medium">Author: {b.author}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                        outOfStock ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"
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
              selectedBook.available_copies <= 0 ? "bg-rose-50/50 border-rose-100 text-rose-950" : "bg-canvas-dominant border-slate-light/10 text-slate-700"
            }`}>
              <div className="flex gap-2.5 items-center">
                <HelpCircle size={14} className="text-slate-400" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Target Media Profile Anchored</h4>
                  <p className="text-xs text-slate-500 font-medium w-64 truncate mt-0.5">{selectedBook.title} {selectedBook.author && `— By ${selectedBook.author}`}</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. CALENDAR WORK PERIOD SETTINGS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Borrow Signature</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400/70 pointer-events-none" size={14} />
                <input 
                  type="date" 
                  readOnly 
                  value={editingRecord ? formatToISODate(editingRecord.borrowedDate) : getTodayString()} 
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-400 outline-hidden select-none" 
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Return Due Deadline</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                <input
                  type="date"
                  value={cleanDueDate}
                  min={minAllowedDate}
                  max={maxAllowedDate || undefined}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-canvas-dominant border border-slate-light/10 rounded-xl text-xs font-mono font-bold text-slate-800 outline-hidden focus:bg-white focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all cursor-pointer"
                />
              </div>
              {maxAllowedDate && (
                <span className="text-[11px] text-rose-600 font-bold block mt-1 pl-1 uppercase tracking-wide">
                  * Tied to membership boundaries
                </span>
              )}
            </div>
          </div>

          {/* 4. MODAL ACTION BUTTONS TERMINAL */}
          <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-light/10">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmissionBlocked}
              className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed shadow-xs rounded-xl transition-all cursor-pointer"
            >
              {editingRecord ? "Save Changes" : "Create Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};