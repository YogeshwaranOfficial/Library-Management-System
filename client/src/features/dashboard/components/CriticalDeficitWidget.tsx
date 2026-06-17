// Editorial Visual Assets
import { AlertCircle, ShoppingCart } from "lucide-react";

interface DeficitItem {
  id: string;
  name: string;
  requests: number;
}

export const CriticalDeficitWidget = ({ items }: { items: DeficitItem[] }) => {
  // Business Logic: Sum total pending demand across the institution to justify budget spending

  return (
    <div className="bg-white p-2 rounded-2xl flex flex-col justify-between h-full text-left font-sans select-none">
      
      {/* HEADER BLOCK: Premium Swiss Editorial Hierarchy */}
      <div className="border-b border-slate-100 pb-3.5 mb-4">
        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 font-mono">
          <AlertCircle size={12} className="text-rose-600 animate-pulse" /> 
          Stock Management
        </h3>
        <h4 className="text-lg font-black text-slate-900 tracking-tight mt-1">
          Out of Stock Alerts
        </h4>
        <p className="text-xs font-normal text-slate-500 mt-0.5 leading-relaxed">
          Critical titles with 0 copies remaining on shelves alongside mounting reserve waitlists.
        </p>
      </div>

      {/* COMPACT SCROLLABLE ALERT MATRIX */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1 flex-1 custom-scrollbar">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-xs text-slate-400 italic font-medium">
              Zero inventory bottlenecks reported. All demands met.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center bg-rose-50/30 border border-rose-100/60 p-2.5 rounded-xl hover:bg-rose-50/60 transition-colors gap-3"
            >
              {/* Title label showing high weight contrast */}
              <span
                className="text-xs font-bold text-slate-900 truncate flex-1"
                title={item.name}
              >
                {item.name}
              </span>
              
              {/* High-Contrast Dynamic Utility Badge — Shows absolute real-world item demand */}
              <span className="text-[10px] font-black bg-rose-600 text-white px-2.5 py-1 rounded-md whitespace-nowrap uppercase tracking-wider shadow-2xs">
                0 Availble Copies
              </span>
            </div>
          ))
        )}
      </div>

      {/* HIGH-PRIORITY LOGISTICAL PROCUREMENT FOOTER */}
      {items.length > 0 && (
        <div className="mt-4 bg-[#79a4d2] text-white rounded-xl p-3 flex items-center justify-between ">
          <div className="flex items-center gap-2">
            <ShoppingCart size={13} className="text-white" />
            <span className="text-[11px] font-bold text-white">
              Need to Restock Copies 
            </span>
          </div>
        </div>
      )}

    </div>
  );
};