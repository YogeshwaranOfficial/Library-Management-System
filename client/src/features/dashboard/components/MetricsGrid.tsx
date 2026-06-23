import type { DashboardSummaryMetrics } from "../../../types/dashboard";
import { 
  BookOpen, 
  Layers, 
  Users, 
  AlertCircle, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  Activity, 
  ShieldAlert, 
  Book
} from "lucide-react";

interface MetricsBannerProps {
  data: DashboardSummaryMetrics | undefined;
}

export const MetricsGrid = ({ data }: MetricsBannerProps) => {
  
  return (
    <div className="w-full bg-white p-6 md:p-8 font-sans text-slate-800">
      
      {/* SECTION HEADER BLOCK */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-black text-[#1A365D] tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600 animate-pulse" />
          Librarian Dashboard
        </h2>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Live administrative dashboard displaying physical volume tracking variables, structural metrics, and fiscal pipelines.
        </p>
      </div>

      {/* METRIC CORE MATRIX GRID CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 w-full">
        
        {/* CARD 1: CATALOG INDEX */}
        <div className="group relative flex flex-col justify-between bg-slate-900 rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-slate-800 transition-all duration-300 min-h-64">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-100  group-hover:scale-125 transition-all duration-500 z-0" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=600&auto=format&fit=crop')" }}
          />
          <div className="absolute inset-0 bg-linear-to-b from-slate-950/60 via-slate-900/90 to-slate-950 z-10" />
          
          <div className="relative z-20 p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-blue-400 tracking-wider uppercase">Catalog Index</span>
              <BookOpen className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">{data?.totalBooks || 0}</h1>
              <h3 className="text-xs font-bold text-slate-200 mt-0.5">Total Books Registered</h3>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
              Accurately tracks regular platform interactions, digital checkouts, and resource vectors.
            </p>
          </div>

          {/* <div className="relative z-20 p-4 bg-slate-950/80 border-t border-slate-800/60 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleToggle("catalog", "a")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                toggleStates.catalog.a ? "bg-white text-slate-950" : "bg-slate-800/60 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <span className={`w-1 h-1 rounded-full ${toggleStates.catalog.a ? "bg-emerald-500" : "bg-slate-500"}`} />
              System Verified
            </button>
            <button
              onClick={() => handleToggle("catalog", "sideB")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                toggleStates.catalog.b ? "bg-white text-slate-950" : "bg-slate-800/60 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <span className={`w-1 h-1 rounded-full ${toggleStates.catalog.b ? "bg-emerald-500" : "bg-slate-500"}`} />
              In-Shelf
            </button>
          </div> */}
        </div>

        {/* CARD 2: CIRCULATION LIVE */}
        <div className="group relative flex flex-col justify-between bg-slate-900 rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-slate-800 transition-all duration-300 min-h-64">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-100  group-hover:scale-125 transition-all duration-500 z-0" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=600&auto=format&fit=crop')" }}
          />
          <div className="absolute inset-0 bg-linear-to-b from-slate-950/60 via-slate-900/90 to-slate-950 z-10" />
          
          <div className="relative z-20 p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-emerald-400 tracking-wider uppercase">Circulation Live</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">{data?.availableBooks || 0}</h1>
              <h3 className="text-xs font-bold text-slate-200 mt-0.5">Available Inventory Copies</h3>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
              Live updates cross-referencing checkout requests against physical core assets.
            </p>
          </div>

          {/* <div className="relative z-20 p-4 bg-slate-950/80 border-t border-slate-800/60 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleToggle("circulation", "a")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                toggleStates.circulation.a ? "bg-white text-slate-950" : "bg-slate-800/60 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <span className={`w-1 h-1 rounded-full ${toggleStates.circulation.a ? "bg-emerald-500" : "bg-slate-500"}`} />
              Reservable
            </button>
            <button
              onClick={() => handleToggle("circulation", "sideB")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                toggleStates.circulation.b ? "bg-white text-slate-950" : "bg-slate-800/60 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <span className={`w-1 h-1 rounded-full ${toggleStates.circulation.b ? "bg-emerald-500" : "bg-slate-500"}`} />
              Sync Process
            </button>
          </div> */}
        </div>

        {/* CARD 3: MEMBER ANALYTICS */}
        <div className="group relative flex flex-col justify-between bg-slate-900 rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-slate-800 transition-all duration-300 min-h-64">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-100  group-hover:scale-125 transition-all duration-500 z-0" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=600&auto=format&fit=crop')" }}
          />
          <div className="absolute inset-0 bg-linear-to-b from-slate-950/60 via-slate-900/90 to-slate-950 z-10" />
          
          <div className="relative z-20 p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-indigo-400 tracking-wider uppercase">Member Analytics</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">{data?.activeMembers || 0}</h1>
              <h3 className="text-xs font-bold text-slate-200 mt-0.5">Active Members Base</h3>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
              Maps structural platform engagement trends and historical profile validation entries.
            </p>
          </div>

          {/* <div className="relative z-20 p-4 bg-slate-950/80 border-t border-slate-800/60 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleToggle("members", "a")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                toggleStates.members.a ? "bg-white text-slate-950" : "bg-slate-800/60 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <span className={`w-1 h-1 rounded-full ${toggleStates.members.a ? "bg-emerald-500" : "bg-slate-500"}`} />
              Verified Users
            </button>
            <button
              onClick={() => handleToggle("members", "sideB")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                toggleStates.members.b ? "bg-white text-slate-950" : "bg-slate-800/60 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <span className={`w-1 h-1 rounded-full ${toggleStates.members.b ? "bg-emerald-500" : "bg-slate-500"}`} />
              Active Checkouts
            </button>
          </div> */}
        </div>

        {/* CARD 4: EXCEPTION METRICS */}
        <div className="group relative flex flex-col justify-between bg-slate-900 rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-slate-800 transition-all duration-300 min-h-64">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-100 group-hover:scale-125 transition-all duration-500 z-0" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600&auto=format&fit=crop')" }}
          />
          <div className="absolute inset-0 bg-linear-to-b from-slate-950/60 via-slate-900/90 to-slate-950 z-10" />
          
          <div className="relative z-20 p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-amber-500 tracking-wider uppercase">Exception Metrics</span>
              <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">{data?.overdueCount || 0}</h1>
              <h3 className="text-xs font-bold text-slate-200 mt-0.5">Books Overdue Queue</h3>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
              Algorithmic parameter locks catching operational return anomalies and late system logs.
            </p>
          </div>

          {/* <div className="relative z-20 p-4 bg-slate-950/80 border-t border-slate-800/60 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleToggle("exceptions", "a")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                toggleStates.exceptions.a ? "bg-white text-slate-950" : "bg-slate-800/60 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <span className={`w-1 h-1 rounded-full ${toggleStates.exceptions.a ? "bg-amber-500" : "bg-slate-500"}`} />
              Lock Triggered
            </button>
            <button
              onClick={() => handleToggle("exceptions", "sideB")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                toggleStates.exceptions.b ? "bg-white text-slate-950" : "bg-slate-800/60 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <span className={`w-1 h-1 rounded-full ${toggleStates.exceptions.b ? "bg-emerald-500" : "bg-slate-500"}`} />
              Fines Pending
            </button>
          </div> */}
        </div>

        {/* CARD 5: FINANCIAL LEDGER */}
        <div className="group relative flex flex-col justify-between bg-slate-900 rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-slate-800 transition-all duration-300 min-h-64">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-100 group-hover:scale-125 transition-all duration-500 z-0" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop')" }}
          />
          <div className="absolute inset-0 bg-linear-to-b from-slate-950/60 via-slate-900/90 to-slate-950 z-10" />
          
          <div className="relative z-20 p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-rose-400 tracking-wider uppercase">Financial Ledger</span>
              <DollarSign className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight truncate">₹{data?.totalOutstandingFines || 0}</h1>
              <h3 className="text-xs font-bold text-slate-200 mt-0.5">Outstanding Receivables</h3>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
              Aggregated economic pipeline tracking unreturned structural materials under fee protocols.
            </p>
          </div>

          {/* <div className="relative z-20 p-4 bg-slate-950/80 border-t border-slate-800/60 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleToggle("financial", "a")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                toggleStates.financial.a ? "bg-white text-slate-950" : "bg-slate-800/60 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <span className={`w-1 h-1 rounded-full ${toggleStates.financial.a ? "bg-emerald-500" : "bg-slate-500"}`} />
              Pipeline Clear
            </button>
            <button
              onClick={() => handleToggle("financial", "sideB")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                toggleStates.financial.b ? "bg-white text-slate-950" : "bg-slate-800/60 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <span className={`w-1 h-1 rounded-full ${toggleStates.financial.b ? "bg-rose-500" : "bg-slate-500"}`} />
              Accruing Logs
            </button>
          </div> */}
        </div>

      </div>

      {/* DASHBOARD STATUS FOOTER ADORNMENT */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 text-[11px] font-bold tracking-wide text-slate-500 uppercase shadow-xs">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          All relational core indicators synced successfully
        </div>
        <div className="flex items-center gap-4 text-slate-400 font-semiboldNormal">
          <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Latency: 12ms</span>
          <span className="flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5 text-indigo-500" /> Encryption: TLS 1.3</span>
          <span className="flex items-center gap-1"><Book className="w-3.5 h-3.5 text-amber-500" /> Nodes: 3 Active</span>
        </div>
      </div>

    </div>
  );
};