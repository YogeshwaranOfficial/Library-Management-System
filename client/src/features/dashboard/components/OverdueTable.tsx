import type { OverdueRecord } from "../../../types/dashboard";

export const OverdueTable = ({ records }: { records: OverdueRecord[] | undefined }) => {
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6 font-sans">
        <p className="text-sm text-slate-400 font-semibold">
          System verification clear: No overdue inventory items currently registered.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-xs font-sans text-left bg-white">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/70">
            <th className="py-4 px-6 font-bold">Book Title Identifier</th>
            <th className="py-4 px-6 font-bold">Borrower Account Reference</th>
            <th className="py-4 px-6 font-bold">Expected Return Date</th>
            <th className="py-4 px-6 font-bold">Delay Period</th>
            <th className="py-4 px-6 font-bold text-right">Accumulated Penalties</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-slate-100 text-slate-700">
          {records.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50/40 transition-colors group">
              <td className="py-4 px-6 font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                {row.title}
              </td>
              <td className="py-4 px-6 text-slate-600 font-medium">
                <span className="font-mono text-[10px] bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-md text-slate-600 font-bold mr-2 uppercase tracking-wide">
                  ID: {row.memberId}
                </span>
                {row.borrowerName}
              </td>
              <td className="py-4 px-6 text-slate-500 font-semibold">{row.dueDate}</td>
              <td className="py-4 px-6">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-wide">
                  {row.daysLate} days overdue
                </span>
              </td>
              <td className="py-4 px-6 font-bold text-slate-900 text-right font-mono text-base">
                ₹{row.fineAmount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};