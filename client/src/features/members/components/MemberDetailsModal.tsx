import React, { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  ArrowLeft, 
  Download, 
  Phone, 
  Mail, 
  Calendar, 
  CreditCard, 
  BookOpen, 
  History, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle,
  FileText,
  X
} from "lucide-react";

interface AutoTableHookWithFinalY {
  finalY: number;
}

export interface BackendMemberDetails {
  member_id: string;
  name: string;
  email: string;
  phone: string;
  join_date: string;
  current_plan: {
    name: string;
    expiry_date: string;
  };
  plan_history: Array<{
    name: string;
    start_date: string;
    end_date: string;
    books_borrowed_count: number;
  }>;
  borrowing_logs: Array<{
    book_title: string;
    plan_context: string;
    borrow_date: string;
    return_date: string;
    status: string;
    fine_paid: number;
    paid_status: boolean;
  }>;
}

interface MemberDetailsPageProps {
  member: BackendMemberDetails | null; 
  onClose: () => void; 
}

export const MemberDetailsPage: React.FC<MemberDetailsPageProps> = ({ member, onClose }) => {
  const [activeTab, setActiveTab] = useState<"bio" | "plans" | "logs">("bio");

  if (!member) return null;

  const targetLogs = member.borrowing_logs || [];
  const targetHistory = member.plan_history || [];

  // ✅ FIXED: Corrected fallback accumulator fallback statement to avoid NaN conditions
  const totalFinesPaid = targetLogs.reduce((acc, curr) => acc + (Number(curr.fine_paid) || 0), 0);
  const totalDamagedBooks = targetLogs.filter(b => b.status === "DAMAGED").length;
  const totalLifetimeLent = targetHistory.reduce((acc, curr) => acc + (Number(curr.books_borrowed_count) || 0), 0);

  const generateStructuredPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    
    doc.setFillColor(26, 54, 93); 
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("LIBRARY MANAGEMENT SYSTEM", 15, 18);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Official Member Profile Account Ledger Report", 15, 26);
    
    doc.setTextColor(45, 55, 72);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("MEMBER PROFILE METADATA", 15, 52);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text([
      `Member Full Name:     ${member.name}`,
      `Account Email ID:     ${member.email}`,
      `Phone Number Contact: ${member.phone || "N/A"}`,
      `Registration Date:    ${member.join_date || "N/A"}`,
      `Active Current Plan:  ${member.current_plan?.name || "No Plan"}`,
      `Plan Expiration Date: ${member.current_plan?.expiry_date || "N/A"}`
    ], 15, 60);

    doc.setFillColor(247, 250, 252);
    doc.rect(140, 58, 55, 28, "F");
    doc.setTextColor(26, 54, 93);
    doc.setFont("helvetica", "bold");
    doc.text("LIFETIME COUNTS", 143, 64);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Total Borrowed: ${totalLifetimeLent} items`, 143, 71);
    doc.text(`Total Fines Paid: INR ${totalFinesPaid}`, 143, 77);
    doc.text(`Damaged Counts: ${totalDamagedBooks} items`, 143, 83);

    doc.setDrawColor(226, 232, 240);
    doc.line(15, 93, 195, 93);

    doc.setTextColor(26, 54, 93);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("MEMBERSHIP SUBSCRIPTION TIMELINE HISTORIES", 15, 102);

    autoTable(doc, {
      startY: 107,
      margin: { left: 15, right: 15 },
      head: [["Membership Plan Tier Name", "Activation Date", "Expiration Date", "Lending Volume"]],
      body: targetHistory.map((p, idx) => [
        idx === 0 && member.current_plan ? `${p.name} (Active)` : p.name, 
        p.start_date, 
        p.end_date, 
        `${p.books_borrowed_count} Books`
      ]),
      headStyles: { fillColor: [43, 108, 176], fontStyle: "bold" },
      styles: { fontSize: 9, font: "helvetica" }
    });

    const lastTableInstance = (doc as unknown as { lastAutoTable: AutoTableHookWithFinalY }).lastAutoTable;
    const logsYOffset = lastTableInstance.finalY + 12;
    doc.text("CATALOG LENDING JOURNAL & ITEM CONDITION LOGS", 15, logsYOffset);

    autoTable(doc, {
      startY: logsYOffset + 5,
      margin: { left: 15, right: 15 },
      head: [["Catalog Book Title", "Associated Plan Scope", "Timeline", "Condition Status Checked", "Fine Paid"]],
      body: targetLogs.map(l => [
        l.book_title, 
        l.plan_context, 
        `Out: ${l.borrow_date}\nIn: ${l.return_date || "—"}`, 
        l.status, 
        l.fine_paid > 0 ? `INR ${l.fine_paid}` : "-"
      ]),
      headStyles: { fillColor: [26, 54, 93], fontStyle: "bold" },
      styles: { fontSize: 8, font: "helvetica" }
    });

    const clientFileNameSafeText = member.name.replace(/\s+/g, "_");
    doc.save(`${clientFileNameSafeText}_library_ledger_report.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      <div className="relative w-full max-w-7xl max-h-[90vh] bg-slate-50 rounded-2xl shadow-2xl overflow-y-auto border border-gray-200 flex flex-col font-sans text-[#2D3748] animate-in zoom-in-95 duration-200">
        
        {/* ==================== WORKSPACE HEADER CONTROLS BAR ==================== */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 shadow-3xs">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center p-2 text-gray-500 hover:text-[#1A365D] hover:bg-gray-100 rounded-xl transition-all cursor-pointer border border-gray-200/80 bg-white shadow-3xs"
              title="Return to Members List Workspace"
            >
              <ArrowLeft size={16} className="stroke-[2.5]" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-[#1A365D] tracking-tight">{member.name}</h2>
                <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                  member.current_plan ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                }`}>
                  {member.current_plan ? "Active Account" : "No Plan Registered"}
                </span>
              </div>
              <p className="text-xs text-[#718096] mt-0.5 font-medium">
                Profile Card System Index: <span className="font-mono font-bold text-gray-700">REGISTER-{member.member_id?.split("-").pop()?.toUpperCase() || "0000"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={generateStructuredPDF}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white text-xs font-bold tracking-wide rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Download size={14} className="stroke-[2.5]" />
              Download Report
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ==================== CONTENT BODY MATRIX ROW LAYOUT ==================== */}
        <div className="p-6 w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start overflow-y-auto">
          
          {/* LEFT SIDE CONTACT INSIGHTS PROFILE BAR */}
          <div className="lg:col-span-4 flex flex-col gap-6 w-full">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-3xs space-y-5">
              <div className="text-center pb-4 border-b border-gray-100">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center text-lg font-bold text-[#1A365D] shadow-inner mb-3">
                  {member.name ? member.name.charAt(0).toUpperCase() : "?"}
                </div>
                <h3 className="font-bold text-sm text-[#1A365D] tracking-tight">{member.name}</h3>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Library Profile</p>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Mail size={11}/> Email Address</span>
                  <span className="text-xs font-semibold text-[#1A365D] block mt-1 break-all select-all">{member.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Phone size={11}/> Phone Contact</span>
                  <span className="text-xs font-semibold text-[#1A365D] block mt-1 select-all">{member.phone || "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={11}/> Entry Date Registration</span>
                  <span className="text-xs font-semibold text-gray-700 block mt-1">{member.join_date || "Not Specified"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><CreditCard size={11}/> Active Subscribed Tier</span>
                  <span className="text-xs font-semibold text-gray-700 block mt-1">
                    <span className="inline-block px-2 py-0.5 bg-gray-100 border border-gray-200 text-[#2D3748] rounded-md font-bold text-[11px]">
                      {member.current_plan?.name || "No Plan Tier"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* LIVE KPI AGGREGATION WIDGETS */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-3xs grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50/70 border border-gray-100 rounded-xl">
                <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block">Total Borrowed</span>
                <span className="text-base font-bold text-[#1A365D] mt-1 block">{totalLifetimeLent} Books</span>
              </div>
              <div className="p-3 bg-slate-50/70 border border-gray-100 rounded-xl">
                <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block">Total Fines</span>
                <span className="text-base font-bold text-amber-600 mt-1 block">₹{totalFinesPaid}</span>
              </div>
              <div className="p-3 bg-rose-50/40 border border-rose-100 rounded-xl col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Damaged Returns</span>
                  <span className="text-xs font-bold text-rose-900 mt-0.5 block">{totalDamagedBooks} Incident Record(s)</span>
                </div>
                <AlertTriangle size={15} className="text-rose-500 mr-1" />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN AREA PANEL DESK */}
          <div className="lg:col-span-8 flex flex-col bg-white border border-gray-200 rounded-2xl shadow-3xs overflow-hidden w-full">
            <div className="flex border-b border-gray-200 bg-slate-50/50 p-2 gap-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("bio")}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-wide rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "bio" ? "bg-white text-[#2B6CB0] shadow-2xs" : "text-gray-500 hover:text-[#1A365D]"
                }`}
              >
                <FileText size={13} /> Profile Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("plans")}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-wide rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "plans" ? "bg-white text-[#2B6CB0] shadow-2xs" : "text-gray-500 hover:text-[#1A365D]"
                }`}
              >
                <TrendingUp size={13} /> Membership History
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("logs")}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-wide rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "logs" ? "bg-white text-[#2B6CB0] shadow-2xs" : "text-gray-500 hover:text-[#1A365D]"
                }`}
              >
                <History size={13} /> Borrowing & Returns Journal
              </button>
            </div>

            <div className="p-6">
              {/* TAB CONTENT A: OVERVIEW */}
              {activeTab === "bio" && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A365D] uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                      <CheckCircle size={14} className="text-emerald-500" /> Active Plan Boundaries Snapshot
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs font-medium text-gray-700 bg-slate-50/60 border border-gray-100 rounded-xl p-4">
                      <div>
                        <span className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider">Active Subscription Tier</span>
                        <span className="font-bold text-[#1A365D] text-sm mt-1 block">{member.current_plan?.name || "No Plan Active"}</span>
                      </div>
                      <div>
                        <span className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider">Expiration Date Boundary Limit</span>
                        <span className="font-bold text-rose-600 text-sm mt-1 block">{member.current_plan?.expiry_date || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#1A365D] uppercase tracking-wider border-b border-gray-100 pb-2">
                      Account Standing Rules Policy
                    </h4>
                    <div className="mt-3 space-y-2 text-xs text-gray-600 font-medium">
                      <div className="flex items-start gap-2.5 bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2B6CB0] mt-1.5 shrink-0" />
                        <div>
                          Deleting this specific library ledger logging index record deletes catalog access clearances only. The system authentication login credentials will remain intact.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT B: HISTORIC SUBSCRIPTION RENEWALS */}
              {activeTab === "plans" && (
                <div className="overflow-x-auto animate-in fade-in duration-150 border border-gray-100 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs min-w-125">
                    <thead>
                      <tr className="bg-slate-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                        <th className="p-3">Membership Plan Name</th>
                        <th className="p-3">Activation Date</th>
                        <th className="p-3">Expiration Date</th>
                        <th className="p-3 text-right">Lending Counts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold">
                      {targetHistory.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-gray-400 font-medium bg-gray-50/30">
                            No subscription history ledger events found.
                          </td>
                        </tr>
                      ) : (
                        targetHistory.map((history, idx) => (
                          <tr key={idx} className={`transition-colors ${idx === 0 && member.current_plan ? 'bg-emerald-50/30 hover:bg-emerald-50/50' : 'hover:bg-slate-50/80'}`}>
                            <td className="p-3 text-[#1A365D] font-bold flex items-center gap-1.5">
                              {idx === 0 && member.current_plan ? (
                                <>
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                  {history.name} <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold uppercase ml-1">Active</span>
                                </>
                              ) : (
                                <>
                                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                                  <span className="text-gray-500 font-medium">{history.name}</span>
                                </>
                              )}
                            </td>
                            <td className="p-3 font-medium text-gray-600">{history.start_date}</td>
                            <td className="p-3 font-medium text-gray-500">{history.end_date}</td>
                            <td className="p-3 text-right text-gray-800 font-bold">{history.books_borrowed_count} Books</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB CONTENT C: CATALOG BORROW JOURNAL */}
              {activeTab === "logs" && (
                <div className="overflow-x-auto animate-in fade-in duration-150 border border-gray-100 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs min-w-162.5">
                    <thead>
                      <tr className="bg-slate-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                        <th className="p-3 w-[30%]">Book Name</th>
                        <th className="p-3">Borrowed Date</th>
                        <th className="p-3">Due Date</th>
                        <th className="p-3">Issue Status</th>
                        <th className="p-3 text-right">Fine</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold">
                      {targetLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-gray-400 font-medium bg-gray-50/30">
                            No book lending logs found for this member account.
                          </td>
                        </tr>
                      ) : (
                        targetLogs.map((log, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 text-[#1A365D] font-bold max-w-50 truncate" title={log.book_title}>
                              <div className="flex items-center gap-2">
                                <BookOpen size={13} className="text-gray-400 shrink-0" />
                                <span className="truncate">{log.book_title}</span>
                              </div>
                            </td>
                            <td className="p-3 text-gray-500 font-medium">{log.borrow_date}</td>
                            <td className="p-3 text-gray-400 font-normal">{log.return_date || "Still Out"}</td>
                            <td className="p-3">
                              <span className={`inline-flex items-center gap-1 font-bold text-[9px] px-2 py-0.5 rounded-full border uppercase ${
                                log.status === "DAMAGED"
                                  ? "bg-rose-50 text-rose-900 border-rose-200" 
                                  : log.status === "OVERDUE" ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                              }`}>
                                {log.status}
                              </span>
                            </td>
                            <td className={`p-3 text-right font-bold ${log.paid_status === true ? "text-emerald-600" : "text-rose-600"}`}>
                              {log.fine_paid > 0 ? `₹${log.fine_paid}` : "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};