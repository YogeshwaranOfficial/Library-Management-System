import type { OverdueRecord } from "../../../types/dashboard";

export const OverdueTable = ({ records }: { records: OverdueRecord[] | undefined }) => {
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <p className="text-sm text-gray-500 font-medium">System verification clear: No overdue inventory items currently registered.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50/70">
            <th className="py-3.5 px-4">Book Title Identifier</th>
            <th className="py-3.5 px-4">Borrower Account Reference</th>
            <th className="py-3.5 px-4">Expected Return Date</th>
            <th className="py-3.5 px-4">Delay Period</th>
            <th className="py-3.5 px-4 text-right">Accumulated Penalties</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-gray-100 text-gray-700 bg-white">
          {records.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50/40 transition-colors group">
              <td className="py-3.5 px-4 font-medium text-gray-900 group-hover:text-teal-brand transition-colors">
                {row.title}
              </td>
              <td className="py-3.5 px-4 text-gray-600">
                <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-semibold mr-1.5">
                  ID: {row.memberId}
                </span>
                {row.borrowerName}
              </td>
              <td className="py-3.5 px-4 text-gray-500">{row.dueDate}</td>
              <td className="py-3.5 px-4">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                  {row.daysLate} days overdue
                </span>
              </td>
              <td className="py-3.5 px-4 font-bold text-gray-900 text-right text-base">
                ₹{row.fineAmount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};