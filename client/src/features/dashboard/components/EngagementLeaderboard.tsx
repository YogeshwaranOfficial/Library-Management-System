// Editorial Visual Assets
import { Trophy } from "lucide-react";

interface TopUser {
  id: string;
  name: string;
  loans: number;
  onTimeRate: number;
}

export const EngagementLeaderboard = ({ members }: { members: TopUser[] }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 h-full flex flex-col justify-between text-left font-sans select-none">
    <div>
      <h3 className="text-[11px] font-bold text-[#718096] uppercase tracking-wider flex items-center gap-1.5">
        <Trophy size={14} className="text-amber-500" /> Elite Reader Engagement
      </h3>
      <p className="text-xs text-[#718096] mt-1 leading-relaxed font-medium">
        Top-performing student accounts returning assets on time.
      </p>
    </div>

    <div className="divide-y divide-gray-100 flex-1 flex flex-col justify-center min-h-40">
      {members.slice(0, 3).map((member, index) => (
        <div
          key={member.id}
          className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono font-bold text-[#1A365D] bg-amber-50 border border-amber-100 h-5 w-6 rounded-md flex items-center justify-center">
              #{index + 1}
            </span>
            <span
              className="text-xs font-bold text-[#2D3748] truncate max-w-27.5 sm:max-w-35"
              title={member.name}
            >
              {member.name}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-[#1A365D] font-mono">
              {member.loans} Loans
            </p>
            <p className="text-[10px] font-bold text-emerald-600 mt-0.5 uppercase tracking-wide">
              {member.onTimeRate}% On-Time
            </p>
          </div>
        </div>
      ))}
    </div>

    {/* <div className="bg-slate-50 border border-gray-200 text-slate-600 text-[10px] font-bold p-2.5 rounded-xl text-center uppercase tracking-wider">
      Automated Reward Incentives Applied
    </div> */}
  </div>
);