interface OverdueRecord {
  title: string;
  borrower: string;
  dueDate: string;
  daysLate: number;
  fine: number;
}

export const OverdueTable = ({ records }: { records?: OverdueRecord[] }) => {
  // Fallback structural matrix placeholder matching image blueprint data
  const fallbackRecords: OverdueRecord[] = [
    { title: "Harry Potter and the Sorcerer's Stone", borrower: "102 (Raj)", dueDate: "29 May", daysLate: 5, fine: 50 },
    { title: "Harry Potter and the Chamber of Secrets", borrower: "102 (Raj)", dueDate: "29 May", daysLate: 5, fine: 50 },
    { title: "The Book Book", borrower: "103 (Raj)", dueDate: "29 May", daysLate: 5, fine: 50 },
    { title: "Maxitime and the Future", borrower: "103 (Raj)", dueDate: "29 May", daysLate: 1, fine: 20 },
  ];

  const dataList = records || fallbackRecords;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-sm font-semibold text-gray-600 bg-gray-50">
            <th className="py-3 px-4">Book Title</th>
            <th className="py-3 px-4">Borrowed By (Member ID)</th>
            <th className="py-3 px-4">Due Date</th>
            <th className="py-3 px-4">Days Late</th>
            <th className="py-3 px-4">Calculated Fine (₹)</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
          {dataList.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
              <td className="py-3 px-4 font-medium text-gray-900">{row.title}</td>
              <td className="py-3 px-4">{row.borrower}</td>
              <td className="py-3 px-4">{row.dueDate}</td>
              <td className="py-3 px-4 text-red-600 font-medium">{row.daysLate} days</td>
              <td className="py-3 px-4 font-semibold text-gray-900">₹{row.fine}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};