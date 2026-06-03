interface SimulatorProps { totalOutstanding: number; discount: number; onChange: (v: number) => void }

export const AmnestySimulator = ({ totalOutstanding, discount, onChange }: SimulatorProps) => {
  const waivedFine = (totalOutstanding * (discount / 100)).toFixed(0);
  const projectedRecovery = (totalOutstanding - Number(waivedFine)).toFixed(0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">⚡ Bulk Amnesty Clearance Simulator</h3>
        <p className="text-xs text-gray-500 mt-0.5">Model the financial recovery outcome of offering a percentage-based amnesty fine relief.</p>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-gray-700">
          <span>Relief Rate: {discount}%</span>
          <span className="text-amber-600">Projected Cash Collection: ₹{projectedRecovery}</span>
        </div>
        <input 
          type="range" min="0" max="100" value={discount} onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
        />
      </div>
      <div className="text-[11px] text-gray-400 font-medium italic">
        Offering this clearance drops ₹{waivedFine} in toxic debt and creates an immediate collection incentive for unreturned books.
      </div>
    </div>
  );
};