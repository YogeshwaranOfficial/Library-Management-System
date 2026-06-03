interface TopUser { id: string; name: string; loans: number; onTimeRate: number }

export const EngagementLeaderboard = ({ members }: { members: TopUser[] }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 h-full flex flex-col justify-between">
    <div>
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">🎖️ Elite Reader Engagement</h3>
      <p className="text-xs text-gray-500">Top-performing student accounts returning assets on time.</p>
    </div>
    <div className="divide-y divide-gray-100 flex-1 flex flex-col justify-center min-h-40">
      {members.slice(0, 3).map((member, index) => (
        <div key={member.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-black text-teal-600 bg-teal-50 h-5 w-5 rounded-full flex items-center justify-center">
              #{index + 1}
            </span>
            <span className="text-xs font-bold text-gray-800 truncate max-w-27.5">{member.name}</span>
          </div>
          <div className="text-right">
            <p className="text-xs font-extrabold text-gray-900">{member.loans} Loans</p>
            <p className="text-[10px] font-semibold text-emerald-600">{member.onTimeRate}% On-Time</p>
          </div>
        </div>
      ))}
    </div>
    <div className="bg-emerald-50 text-emerald-800 text-[10px] font-bold p-2 rounded-xl text-center">
      🎉 Run Automated Reward Incentives Applied
    </div>
  </div>
);