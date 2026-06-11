// Editorial Visual Assets
import { AlertCircle } from "lucide-react";

interface DeficitItem { 
  id: string; 
  name: string; 
  requests: number; // This represents our calculated demand/urgency score
}

export const CriticalDeficitWidget = ({ items }: { items: DeficitItem[] }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between min-h-65 text-left font-sans">
    <div>
      <h3 className="text-[11px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
        <AlertCircle size={14} className="text-rose-600" /> Procurement Alerts
      </h3>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
        Critical titles with 0 copies remaining on the shelves.
      </p>
    </div>
    
    <div className="space-y-2.5 my-4 overflow-y-auto max-h-35 pr-1 flex-1">
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-6 text-center font-medium">
          Zero inventory bottlenecks reported.
        </p>
      ) : (
        items.map(item => (
          <div key={item.id} className="flex justify-between items-center bg-rose-50/40 border border-rose-100 p-2.5 rounded-xl transition-colors">
            <span className="text-xs font-bold text-slate-800 truncate max-w-35 sm:max-w-45" title={item.name}>
              {item.name}
            </span>
            <span className="text-[10px] font-mono font-bold bg-rose-600 text-white px-2.5 py-0.5 rounded-md whitespace-nowrap uppercase tracking-wider">
              {item.requests > 1 ? `High Demand` : `Out of Stock`}
            </span>
          </div>
        ))
      )}
    </div>
    
    {/* Keep this ready for when we link the purchase order handler
    <button className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-50 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer shadow-xs">
      Quick Restock Request
    </button> */}
  </div>
);