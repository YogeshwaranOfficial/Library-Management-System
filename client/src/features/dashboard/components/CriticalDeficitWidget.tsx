interface DeficitItem { 
  id: string; 
  name: string; 
  requests: number; // This represents our calculated demand/urgency score
}

export const CriticalDeficitWidget = ({ items }: { items: DeficitItem[] }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between min-h-65">
    <div>
      <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider">🚨 Procurement Alerts</h3>
      {/* 💡 UPDATED: Reflects that these are completely out-of-stock items */}
      <p className="text-xs text-gray-500 mt-0.5">Critical titles with 0 copies remaining on the shelves.</p>
    </div>
    
    <div className="space-y-2.5 my-3 overflow-y-auto max-h-35 pr-1">
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 italic py-4 text-center">Zero inventory bottlenecks reported.</p>
      ) : (
        items.map(item => (
          <div key={item.id} className="flex justify-between items-center bg-red-50/50 border border-red-100 p-2 rounded-xl">
            <span className="text-xs font-semibold text-gray-800 truncate max-w-35" title={item.name}>
              {item.name}
            </span>
            {/* 💡 UPDATED: Changed from "Holds Pending" to a clear restock urgency level */}
            <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
              {item.requests > 1 ? `High Demand (0 Left)` : `0 Copies Available`}
            </span>
          </div>
        ))
      )}
    </div>
    
    {/* Keep this ready for when we link the purchase order handler */}
    <button className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors">
      Quick Restock Request
    </button>
  </div>
);