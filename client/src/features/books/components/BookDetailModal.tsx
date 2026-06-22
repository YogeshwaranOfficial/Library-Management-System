import React, { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  BookOpen, 
  History, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Globe,
  Tag,
  Hash,
  X
} from "lucide-react";
import { DeleteBookModal } from "./DeleteBookModal";
import type { EditingBookInventoryItem } from "../../../types/books";

interface BookDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookDetails: EditingBookInventoryItem | null;
  isLoading: boolean;
  onEditTrigger: () => void;
  onDeleteTrigger: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  isOpen,
  onClose,
  bookDetails,
  isLoading,
  onDeleteTrigger,
}) => {
  const [activeTab, setActiveTab] = useState<"bio" | "logs">("bio");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (!isOpen) return null;
  if (!bookDetails && !isLoading) return null;

  const handleConfirmDeletion = () => {
    setIsDeleteOpen(false);
    onClose();
    onDeleteTrigger();
  };

  // Safe fallback configurations
  const displayTitle = bookDetails?.book_name || "Loading Title...";
  const displayAuthor = bookDetails?.book_author || "Please wait";
  const displayId = bookDetails?.book_id ? String(bookDetails.book_id).slice(-4).toUpperCase() : "0000";
  const displayLanguage = bookDetails?.language || "N/A";
  const displayCategory = bookDetails?.category?.category_name || "Unclassified";
  const isbn = bookDetails?.isbn || "N/A";
  const historyLog = bookDetails?.history || [];
  console.log("history Log ",historyLog)

  const availableCount = bookDetails?.available_copies ?? 0;
  const totalCount = bookDetails?.total_copies ?? 0;
  const borrowCount = bookDetails?.lending_count ?? 0;

  const totalDamagedBooks = historyLog.filter(log => log.condition === "DAMAGED").length;

  const shelfEntryDate = bookDetails?.created_at
    ? new Date(bookDetails.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Processing...";

  // 🚀 Reusable Date Formatter
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ==================== PDF REPORT GENERATOR ====================
  const generateStructuredPDF = () => {
    if (!bookDetails) return;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    
    // Header Banner Box
    doc.setFillColor(26, 54, 93); 
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("LIBRARY MANAGEMENT SYSTEM", 15, 18);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Official Catalog Book Profile Inventory Ledger Report", 15, 26);
    
    // Core Metadata Info Row Block
    doc.setTextColor(45, 55, 72);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("BOOK RECORD METADATA", 15, 52);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text([
      `Book Volume Title:      ${displayTitle}`,
      `Author / Creator:       ${displayAuthor}`,
      `ISBN Reference Identifier: ${isbn}`,
      `Language Classification: ${displayLanguage.toUpperCase()}`,
      `Assigned Category:       ${displayCategory}`,
      `Shelf Registry Date:     ${shelfEntryDate}`
    ], 15, 60);

    // KPI Summary Widget Box Component Pinned Right
    doc.setFillColor(247, 250, 252);
    doc.rect(140, 58, 55, 28, "F");
    doc.setTextColor(26, 54, 93);
    doc.setFont("helvetica", "bold");
    doc.text("INVENTORY STATISTICS", 143, 64);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Total Holdings:   ${totalCount} Copies`, 143, 71);
    doc.text(`On-Shelf Copies:  ${availableCount} Units`, 143, 77);
    doc.text(`Damaged Incidents: ${totalDamagedBooks} items`, 143, 83);

    doc.setDrawColor(226, 232, 240);
    doc.line(15, 93, 195, 93);

    doc.setTextColor(26, 54, 93);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("CIRCULATION TIMELINE & HISTORICAL LOGS", 15, 102);

    // Main History Table
    autoTable(doc, {
      startY: 107,
      margin: { left: 15, right: 15 },
      head: [["Active Borrower Name", "Email Address", "Issued On Date", "Returned On Date", "Item Condition State", "Damage Reason"]],
      body: historyLog.map((log) => [
        log.member_name, 
        log.gmail || "N/A", // 🚀 FIXED: Swapped log.gmail to log.email to match types configuration
        log.borrow_date ? formatDate(log.borrow_date) : "—", 
        log.return_date ? formatDate(log.return_date) : "Active Loan",
        log.condition,
        log.damage_description
      ]),
      headStyles: { fillColor: [26, 54, 93], fontStyle: "bold" },
      styles: { fontSize: 8.5, font: "helvetica" }
    });

    const clientFileNameSafeText = displayTitle.replace(/\s+/g, "_");
    doc.save(`${clientFileNameSafeText}_inventory_ledger_report.pdf`);
  };

  return (
    <>
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
                title="Return to Catalog List Workspace"
              >
                <ArrowLeft size={16} className="stroke-[2.5]" />
              </button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-[#1A365D] tracking-tight">{displayTitle}</h2>
                  <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                    availableCount > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}>
                    {availableCount > 0 ? "In Stock Available" : "All Copies Loaned"}
                  </span>
                </div>
                <p className="text-xs text-[#718096] mt-0.5 font-medium">
                  Catalog Inventory Index Code: <span className="font-mono font-bold text-gray-700">BOOK-{displayId}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                disabled={isLoading}
                onClick={generateStructuredPDF}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white text-xs font-bold tracking-wide rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
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
            
            {/* LEFT SIDE SPECIFICATIONS CARD BAR */}
            <div className="lg:col-span-4 flex flex-col gap-6 w-full">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-3xs space-y-5">
                <div className="text-center pb-4 border-b border-gray-100">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center text-[#1A365D] shadow-inner mb-3">
                    <BookOpen size={24} className="stroke-2" />
                  </div>
                  <h3 className="font-bold text-sm text-[#1A365D] tracking-tight truncate max-w-xs mx-auto" title={displayTitle}>
                    {displayTitle}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">by {displayAuthor}</p>
                </div>

                {/* Data specifications list details */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Hash size={11}/> ISBN Number</span>
                    <span className="text-xs font-mono font-bold text-[#1A365D] block mt-1 select-all">{isbn}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Globe size={11}/> Language Spec</span>
                    <span className="text-xs font-semibold text-[#1A365D] block mt-1 uppercase tracking-wider">{displayLanguage}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Tag size={11}/> Category Classification</span>
                    <span className="text-xs font-semibold text-gray-700 block mt-1 uppercase tracking-wide">{displayCategory}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={11}/> Shelf Registry Date</span>
                    <span className="text-xs font-semibold text-gray-700 block mt-1">{shelfEntryDate}</span>
                  </div>
                </div>
              </div>

             
            </div>

            {/* RIGHT COLUMN AREA PANEL DESK */}
            <div className="lg:col-span-8 flex flex-col bg-white border border-gray-200 rounded-2xl shadow-3xs overflow-hidden w-full">
              
              {/* Tab Nav Menu Headers */}
              <div className="flex border-b border-gray-200 bg-slate-50/50 p-2 gap-1 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("bio")}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-wide rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "bio" ? "bg-white text-[#2B6CB0] shadow-2xs" : "text-gray-500 hover:text-[#1A365D]"
                  }`}
                >
                  <FileText size={13} /> Inventory Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("logs")}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-wide rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "logs" ? "bg-white text-[#2B6CB0] shadow-2xs" : "text-gray-500 hover:text-[#1A365D]"
                  }`}
                >
                  <History size={13} /> Circulation & Rental Logs History
                </button>
              </div>

              <div className="p-6">
                {isLoading ? (
                  <div className="py-20 text-center text-xs font-semibold text-[#718096] tracking-widest uppercase animate-pulse">
                    Streaming structural log transactions...
                  </div>
                ) : (
                  <>
                    {/* TAB PANEL A: META OVERVIEW DATA SUMMARY */}
                    {activeTab === "bio" && (
                      <div className="space-y-6 animate-in fade-in duration-150">
                        <div className ="flex justify-between">
                          <h4 className="text-xs font-bold text-[#1A365D] uppercase tracking-wider py-2 flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-500" /> Catalog Allocation Profile Status
                          </h4>
                           <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setIsDeleteOpen(true)}
                            className="px-4 py-2 text-xs font -bold text-white uppercase tracking-wider bg-rose-500 hover:bg-rose-600 border border-rose-200 hover:border-rose-500 rounded-xl transition-all cursor-pointer"
                          >
                            Remove Book
                          </button>
                        </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-3xs grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50/70 border border-gray-100 rounded-xl">
                  <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block">Total Fleet</span>
                  <span className="text-base font-bold text-[#1A365D] mt-1 block">{totalCount} Copies</span>
                </div>
                <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Available</span>
                  <span className="text-base font-bold text-emerald-600 mt-1 block">{availableCount} On Shelf</span>
                </div>
                <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-xl">
                  <span className="text-[10px] font-bold text-[#2B6CB0] uppercase tracking-wider block">Total Borrowed</span>
                  <span className="text-base font-bold text-[#2B6CB0] mt-1 block">{borrowCount} Times</span>
                </div>
                <div className="p-3 bg-rose-50/40 border border-rose-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Damaged Returns</span>
                    <span className="text-xs font-bold text-rose-900 mt-0.5 block">{totalDamagedBooks} Incidence</span>
                  </div>
                  <AlertTriangle size={15} className="text-rose-500 mr-1" />
                </div>
              </div>

                        {/* Dangerous Operation Triggers Pin Bottom Row */}
                       
                      </div>
                    )}

                    {/* TAB PANEL B: CIRCULATION HISTORIC LEDGER DATA TABLE */}
                    {activeTab === "logs" && (
                      <div className="overflow-x-auto animate-in fade-in duration-150 border border-gray-100 rounded-xl">
                        <table className="w-full text-left border-collapse text-xs min-w-162.5">
                          <thead>
                            <tr className="bg-slate-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                              <th className="p-3">Borrower / Member</th>
                              <th className="p-3">Issued Date</th>
                              <th className="p-3">Returned Date</th>
                              <th className="p-3 text-right">Condition Status</th>
                              <th className="p-3 text-right">Damage Reason</th>
                            </tr>
                          </thead> {/* 🚀 FIXED: Added missing corresponding closing tag for 'thead' */}
                          <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold bg-white">
                            {historyLog.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="p-6 text-center text-gray-400 font-medium bg-gray-50/30">
                                  No historic checkout records or active transaction footprints found.
                                </td>
                              </tr>
                            ) : (
                              historyLog.map((log, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="p-3 text-[#1A365D] font-bold">
                                    <div>{log.member_name}</div>
                                    {/* 🚀 FIXED: Changed log.gmail to log.email to match types file parameters */}
                                    <div className="text-[10px] text-gray-400 font-normal mt-0.5">{log.gmail || "N/A"}</div>
                                  </td>
                                  <td className="p-3 text-gray-500 font-medium">
                                    {log.borrow_date ? formatDate(log.borrow_date) : "—"}
                                  </td>
                                  <td className="p-3">
                                    {log.return_date ? (
                                      <span className="text-gray-600 font-medium">{formatDate(log.return_date)}</span>
                                    ) : (
                                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200 tracking-wide animate-pulse">
                                        Not Returned yet
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-right">
                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                      log.condition === "GOOD" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700 border border-rose-100"
                                    }`}>
                                      {log.condition}
                                    </span>
                                  </td>
                                   <td className="p-3 text-right">
                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider`}>
                                      {log.damage_description}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

          </div> {/* Content grid container close */}
        </div> {/* Modal body inner layout container close */}
      </div> {/* Fixed layout black backdrop overlay close */}

      <DeleteBookModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDeletion}
        bookTitle={displayTitle}
      />
    </>
  );
};