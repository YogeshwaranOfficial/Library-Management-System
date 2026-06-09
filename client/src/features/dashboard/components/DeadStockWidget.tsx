interface DeadBook { id: string; title: string; shelf: string }

export const DeadStockWidget = ({ items }: { items: DeadBook[] }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between min-h-65">
    <div>
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">📦 Relocation "Dead Stock"</h3>
      <p className="text-xs text-gray-500 mt-0.5">Inventory titles with zero checkouts over the past 6 months.</p>
    </div>
    <div className="space-y-2 my-3 overflow-y-auto max-h-35 pr-1">
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 italic py-4 text-center">All assets show healthy conversion rates.</p>
      ) : (
        items.map(item => (
          <div key={item.id} className="flex justify-between items-center bg-gray-50 border border-gray-100 p-2 rounded-xl">
            <span className="text-xs font-medium text-gray-700 truncate max-w-42.5">{item.title}</span>
            <span className="text-[10px] font-mono bg-gray-200 px-1.5 py-0.5 rounded text-gray-600 font-bold">
              Shelf: {item.shelf}
            </span>
          </div>
        ))
      )}
    </div>
    <button className="w-full py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors">
      Optimize Warehouse Storage
    </button>
  </div>
);