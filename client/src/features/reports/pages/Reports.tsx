import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { useAuthStore } from "../../../store/authStore";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  FileText, 
  User, 
  BookOpen, 
  Download, 
  Eye,
  RefreshCw,
  CheckCircle,
  Clock,
  Loader2,
  AlertTriangle
} from "lucide-react";

// --- STRUCTURAL API DATA CONTRACT INTERFACES ---
interface SeedOption {
  id: string;
  name: string;
  subtext?: string;
}

interface DropdownMemberItem {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface DropdownBookItem {
  id: string;
  title: string;
  author: string;
}

interface FormattedProfileHeader {
  id: string;
  name: string;
  phone: string;
  email: string;
  extraIdentifier?: string;
}

interface ReportLogItem {
  id: string;
  member: string;
  book: string;
  date: string;
  dueDate: string;
  returnDate: string;
  status: string;
  condition: string;
  fine: string;
}

interface CompiledReportState {
  type: "MEMBER" | "BOOK";
  duration: string;
  profile: FormattedProfileHeader;
  logs: ReportLogItem[];
}

export const ReportsPage: React.FC = () => {
  const token = useAuthStore((state) => state.token);

  // Core Selector Configurations
  const [pivotMode, setPivotMode] = useState<"NONE" | "MEMBER" | "BOOK">("NONE");
  const [primarySelection, setPrimarySelection] = useState<string>("");
  const [secondarySelection, setSecondarySelection] = useState<string>("");
  const [timeWindow, setTimeWindow] = useState<string>("ALL");
  
  // Controls statement compile visualization trigger
  const [triggerCompile, setTriggerCompile] = useState(false);

  // 1. React Query Phase: Fetch Master Members List (Bypassing Pagination)
  const { data: masterMembers = [], isLoading: isMembersLoading } = useQuery<DropdownMemberItem[]>({
    queryKey: ["reportsMasterMembersList", token],
    queryFn: async () => {
      const res = await axiosClient.get("/members", {
        params: { limit: 1000 } // Overrides repository default limit of 10 to fetch all members
      });
      const rootData = res.data?.data || res.data;
      const rawRecords = rootData?.rows || rootData?.data || [];
      
      return Array.isArray(rawRecords)
        ? rawRecords.map((dbRow: unknown): DropdownMemberItem => {
            const row = dbRow as Record<string, unknown>;
            const userObj = (row.user || {}) as Record<string, unknown>;
            return {
              id: String(row.member_id || row.id || ""),
              name: String(userObj.name || "Unknown Member"),
              phone: String(userObj.phone_number || "No Phone"),
              email: String(userObj.gmail || "No Email Registered"),
            };
          })
        : [];
    },
    enabled: !!token,
  });

  // 2. React Query Phase: Fetch Master Books List (Bypassing Pagination)
  const { data: masterBooks = [], isLoading: isBooksLoading } = useQuery<DropdownBookItem[]>({
    queryKey: ["reportsMasterBooksList", token],
    queryFn: async () => {
      const res = await axiosClient.get("/books", {
        params: { limit: 1000 } // Overrides repository default limit to avoid cutting off your collection
      });
      const rootData = res.data?.data || res.data;
      const rawRecords = Array.isArray(rootData) 
        ? rootData 
        : rootData?.rows || rootData?.data || [];

      return rawRecords.map((dbRow: unknown): DropdownBookItem => {
        const row = dbRow as Record<string, unknown>;
        return {
          id: String(row.book_id || row.id || ""),
          title: String(row.book_name || row.title || "Unknown Title"),
          author: String(row.book_author || row.author || "Unknown Author"),
        };
      });
    },
    enabled: !!token,
  });

  // 3. React Query Phase: Dynamic Cascade Child Options Lookup
  const { data: dependentOptions = [], isLoading: isCascading } = useQuery<SeedOption[]>({
    queryKey: ["reportsDependentCascade", token, pivotMode, primarySelection],
    queryFn: async () => {
      if (pivotMode === "NONE" || !primarySelection) return [];
      const res = await axiosClient.get("/reports/dependent-options", {
        params: {
          pivot: pivotMode,
          primaryId: primarySelection,
        },
      });
      return res.data?.data || res.data || [];
    },
    enabled: !!token && pivotMode !== "NONE" && !!primarySelection,
  });

  // 4. React Query Phase: Compile Analytical Payload Matrices Summary
  const { data: compiledReport = null, isLoading: isCompiling, error: compileError } = useQuery<CompiledReportState | null>({
    queryKey: ["reportsCompiledMatrix", token, pivotMode, primarySelection, secondarySelection, timeWindow],
    queryFn: async () => {
      const res = await axiosClient.get("/reports", {
        params: {
          pivot: pivotMode,
          primaryId: primarySelection,
          secondaryId: secondarySelection || undefined,
          duration: timeWindow,
        },
      });
      return res.data?.data || res.data || null;
    },
    enabled: !!token && triggerCompile && pivotMode !== "NONE" && !!primarySelection,
  });

  const handleCompilePreview = () => {
    if (!primarySelection || pivotMode === "NONE") return;
    setTriggerCompile(true);
  };

  const handleReset = () => {
    setPivotMode("NONE");
    setPrimarySelection("");
    setSecondarySelection("");
    setTimeWindow("ALL");
    setTriggerCompile(false);
  };

  // ✅ HANDLER: Generates a dynamically constructed PDF mirroring the preview screen
  const generateReportPDF = () => {
    if (!compiledReport) return;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    
    // 1. BRANDING BANNER HEADER
    doc.setFillColor(26, 54, 93); // Deep Corporate Blue (#1A365D)
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("LIBRARY MANAGEMENT SYSTEM", 15, 18);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Official System Compiled Ledger — ${compiledReport.type} REPORT`, 15, 26);
    
    // 2. PROFILE TARGET SUMMARY METADATA BLOCK
    doc.setTextColor(45, 55, 72);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("TARGET PROFILE REGISTRY METADATA", 15, 54);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Conditionally resolve field contexts to mirror UI labels accurately
    const metadataRows = compiledReport.type === "BOOK" 
      ? [
          `Volume Asset Title:   ${compiledReport.profile.name || "N/A"}`,
          `Primary Creator/Author: ${compiledReport.profile.phone || "N/A"}`,
          `System ISBN Code:       ${compiledReport.profile.email || "N/A"}`
        ]
      : [
          `Member Full Name:       ${compiledReport.profile.name || "N/A"}`,
          `Phone Number Contact:   ${compiledReport.profile.phone || "N/A"}`,
          `Account Email ID:       ${compiledReport.profile.email || "N/A"}`
        ];

    doc.text(metadataRows, 15, 63);

    // 3. STATISTICAL METRIC TOTALS SUMMARY BOX
    doc.setFillColor(247, 250, 252);
    doc.rect(135, 54, 60, 24, "F");
    doc.setTextColor(26, 54, 93);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("REPORT SUMMARY", 139, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Time Scope: ${compiledReport.duration}`, 139, 66);
    doc.text(`Total Records Found: ${compiledReport.logs.length} rows`, 139, 72);

    // Clean rule separator line
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 88, 195, 88);

    // 4. DATA LOG ENTRIES TABLE ASSEMBLY
    doc.setTextColor(26, 54, 93);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`RELATIONAL ACTIVITY ENTRIES (${compiledReport.logs.length})`, 15, 98);

    const customTableHeaders = [
      "Reference ID",
      compiledReport.type === "BOOK" ? "Borrower Account" : "Allocated Title",
      "Borrow Date",
      "Due Date",
      "Return Date",
      "Condition",
      "Fine"
    ];

    const customTableRows = compiledReport.logs.map((log) => [
      log.id ? log.id.slice(0, 8).toUpperCase() : "N/A",
      compiledReport.type === "BOOK" ? log.member : log.book,
      log.date || "—",
      log.dueDate || "—",
      log.returnDate || "—",
      log.condition || "NORMAL",
      log.fine || "—"
    ]);

    autoTable(doc, {
      startY: 103,
      margin: { left: 15, right: 15 },
      head: [customTableHeaders],
      body: customTableRows,
      headStyles: { 
        fillColor: compiledReport.type === "BOOK" ? [43, 108, 176] : [26, 54, 93], 
        fontStyle: "bold" 
      },
      styles: { fontSize: 8.5, font: "helvetica" },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 53 },
        5: { halign: "center" },
        6: { halign: "right" }
      }
    });

    const fileSafePrefix = (compiledReport.profile.name || "Report").replace(/\s+/g, "_");
    doc.save(`${fileSafePrefix}_compiled_${compiledReport.duration.toLowerCase()}_report.pdf`);
  };

  const isMasterSeeding = isMembersLoading || isBooksLoading;

  return (
    <div className="p-8 bg-[#ffffff] min-h-screen font-sans text-slate-800 w-full">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-6 mb-8 gap-4 w-full">
        <div>
          <h1 className="text-3xl font-black text-[#1A365D] tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#2B6CB0]" />
            Dynamic Report Builder
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
           single place to get all types of reports needed by the librarain about the members, books, issues, fines.
          </p>
        </div>
        {pivotMode !== "NONE" && (
          <button 
            onClick={handleReset}
            className="px-4 py-2.5 bg-white text-slate-500 border border-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-4 h-4" /> Clear All
          </button>
        )}
      </div>

      {/* ERROR FEEDBACK BANNER */}
      {compileError && (
        <div className="w-full mb-8 p-5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-4 text-sm text-red-800 font-semibold shadow-xs">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>Failed to process target accounting matrices. Relational compile tracking loop broken during assembly.</div>
        </div>
      )}

      {/* CARD HUB SELECTORS */}
      <div className="bg-white rounded-2xl p-2 shadow-xs w-full mb-8">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
          <span>Choose one</span>
          {isMasterSeeding && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            type="button"
            disabled={isMasterSeeding}
            onClick={() => { setPivotMode("MEMBER"); setPrimarySelection(""); setSecondarySelection(""); setTriggerCompile(false); }}
            className={`p-6 border text-left rounded-xl transition-all cursor-pointer flex items-start gap-5 ${
              pivotMode === "MEMBER" 
                ? "border-[#2B6CB0] bg-blue-50/40 ring-1 ring-[#2B6CB0]" 
                : "border-slate-200 bg-white hover:border-slate-300 disabled:opacity-60"
            }`}
          >
            <div className={`p-3.5 rounded-xl ${pivotMode === "MEMBER" ? "bg-[#2B6CB0] text-white" : "bg-slate-100 text-slate-500"}`}>
              <User className="w-7 h-7" />
            </div>
            <div>
              <span className="block font-black text-sm uppercase tracking-wide text-slate-700">Members Report</span>
              <span className="block text-xs text-slate-400 font-medium mt-1 leading-normal">Choose the member and get the entire details about the member with their activities.</span>
            </div>
          </button>

          <button
            type="button"
            disabled={isMasterSeeding}
            onClick={() => { setPivotMode("BOOK"); setPrimarySelection(""); setSecondarySelection(""); setTriggerCompile(false); }}
            className={`p-6 border text-left rounded-xl transition-all cursor-pointer flex items-start gap-5 ${
              pivotMode === "BOOK" 
                ? "border-[#2B6CB0] bg-blue-50/40 ring-1 ring-[#2B6CB0]" 
                : "border-slate-200 bg-white hover:border-slate-300 disabled:opacity-60"
            }`}
          >
            <div className={`p-3.5 rounded-xl ${pivotMode === "BOOK" ? "bg-[#2B6CB0] text-white" : "bg-slate-100 text-slate-500"}`}>
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <span className="block font-black text-sm uppercase tracking-wide text-slate-700">Books Report</span>
              <span className="block text-xs text-slate-400 font-medium mt-1 leading-normal">Choose one book and get the entire information about the books.</span>
            </div>
          </button>
        </div>

        {/* DEPENDENT FILTER DROPDOWNS */}
        {pivotMode !== "NONE" && (
          <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                {pivotMode === "MEMBER" ? "1. Select Target Member" : "1. Select Target Book Title"}
              </label>
              <select
                value={primarySelection}
                onChange={(e) => { setPrimarySelection(e.target.value); setSecondarySelection(""); setTriggerCompile(false); }}
                className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-400 transition-all shadow-xs"
              >
                <option value="">{pivotMode === "MEMBER" ? "Choose Member" : "Choose Book Title"}</option>
                {pivotMode === "MEMBER" 
                  ? masterMembers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>)
                  : masterBooks.map(b => <option key={b.id} value={b.id}>{b.title} — {b.author}</option>)
                }
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>{pivotMode === "MEMBER" ? "2. Cross-Reference Book Selection" : "2. Cross-Reference Member Interactions"}</span>
                {isCascading && <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />}
              </label>
              <select
                value={secondarySelection}
                onChange={(e) => { setSecondarySelection(e.target.value); setTriggerCompile(false); }}
                disabled={!primarySelection || isCascading}
                className="w-full bg-white border border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 rounded-xl p-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-400 transition-all shadow-xs"
              >
                <option value="">{pivotMode === "MEMBER" ? "All Volumes Handled By Member" : "All Members Who Borrowed This Volume"}</option>
                {dependentOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} {item.subtext ? `(${item.subtext})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">3. Define Statement Period</label>
              <select
                value={timeWindow}
                onChange={(e) => { setTimeWindow(e.target.value); setTriggerCompile(false); }}
                disabled={!primarySelection}
                className="w-full bg-white border border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 rounded-xl p-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-400 transition-all shadow-xs"
              >
                <option value="ALL">Compelete Statements</option>
                <option value="WEEKLY">Last Week Statements</option>
                <option value="MONTHLY">Last Month Statements</option>
                <option value="YEARLY">Annual Statements</option>
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end pt-4">
              <button
                type="button"
                onClick={handleCompilePreview}
                disabled={!primarySelection || isCompiling}
                className="px-6 py-3.5 bg-[#1A365D] hover:bg-[#2B6CB0] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                {isCompiling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Compiling Matrices...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" /> Report Preview
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* OUTPUT REPORT RENDER MATRIX CONTAINER */}
      {triggerCompile && compiledReport ? (
        <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden mb-12">
          <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-5">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl mt-0.5">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                  Compiled Statement Draft Ready
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Scope Focus: {compiledReport.type} PROFILE // Statement Window: {compiledReport.duration}
                </p>
              </div>
            </div>

            {/* ✅ FIXED: Trigger the updated dynamic code engine mapping variables seamlessly */}
            <button
              onClick={generateReportPDF}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold uppercase tracking-widest text-white rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Statement PDF
            </button>
          </div>

          <div className="p-8 space-y-8">
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-8 text-sm">
              <div className="sm:col-span-3 border-b border-slate-200 pb-2 mb-2 text-xs font-black text-slate-400 uppercase tracking-wider">
                Target Profile Registry
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 font-bold uppercase text-[11px] tracking-wider mb-0.5">
                  {compiledReport.type === "BOOK" ? "Volume Asset Title:" : "Registry Subject Name:"}
                </span> 
                <strong className="text-base text-slate-800">{compiledReport.profile.name}</strong>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 font-bold block uppercase text-[11px] tracking-wider mb-0.5">
                  {compiledReport.type === "BOOK" ? "Primary Creator/Author:" : "Contact Detail Vector:"}
                </span> 
                <span className="font-bold text-base text-slate-600">{compiledReport.profile.phone}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 font-bold block uppercase text-[11px] tracking-wider mb-0.5">
                  {compiledReport.type === "BOOK" ? "System ISBN Code:" : "System Parameter Account Labels:"}
                </span> 
                <span className="font-semibold text-base text-slate-600">{compiledReport.profile.email}</span>
              </div>
              {compiledReport.profile.extraIdentifier && (
                <div className="sm:col-span-3 mt-2 pt-3 border-t border-dotted border-slate-200 text-sm text-slate-500 font-bold">
                  {compiledReport.profile.extraIdentifier}
                </div>
              )}
            </div>

            <div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Relational Activity Entries ({compiledReport.logs.length})</div>
              
              {compiledReport.logs.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden text-sm shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-black uppercase text-xs tracking-wider text-slate-400">
                          <th className="p-4 pl-6">Reference ID</th>
                          {compiledReport.type === "BOOK" ? <th className="p-4">Borrower Account</th> : <th className="p-4">Allocated Title</th>}
                          <th className="p-4">Borrow Date</th>
                          <th className="p-4">Due Date</th>
                          <th className="p-4">Return Date</th>
                          <th className="p-4 text-center">Condition</th>
                          <th className="p-4 text-right pr-6">Fine</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium text-slate-700 text-sm">
                        {compiledReport.logs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 pl-6 text-slate-400 font-bold">{log.id.slice(0, 8).toUpperCase()}</td>
                            <td className="p-4 font-bold text-slate-900 truncate max-w-md">
                              {compiledReport.type === "BOOK" ? log.member : log.book}
                            </td>
                            <td className="p-4 text-slate-500">{log.date}</td>
                            <td className="p-4 text-slate-500">{log.dueDate}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-md font-bold text-xs tracking-wide ${
                                log.status === "RETURNED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" : "bg-blue-50 text-blue-700 border border-blue-200/50"
                              }`}>
                                {log.returnDate}
                              </span>
                            </td>
                            <td className="p-4 text-center font-bold text-slate-500">{log.condition}</td>
                            <td className="p-4 text-right font-black text-slate-900 pr-6">{log.fine}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                  <Clock className="w-8 h-8 text-slate-300" />
                  <span className="text-sm font-bold">No circulation records found matching this option block parameter slice.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full border border-dashed border-slate-200 rounded-2xl p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-4 mt-12">
          <div className="p-4 bg-slate-100 rounded-2xl text-slate-400 shadow-2xs">
            <FileText className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide">Reporting Engine Dormant</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium mt-1.5">
              Please specify a focus target view query direction above. Once parameters match, the live layout compiler maps individual tracking arrays instantly onto the field.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};