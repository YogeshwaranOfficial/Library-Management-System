// Editorial Visual Assets
import { Trophy, CheckCircle2 } from "lucide-react";

interface TopUser {
  id: string;
  name: string;
  loans: number;
  onTimeRate: number;
}

export const EngagementLeaderboard = ({ members }: { members: TopUser[] }) => {
  return (
    <div className="bg-white p-2 rounded-2xl flex flex-col justify-between h-full text-left font-sans select-none">
      {/* HEADER BLOCK: Premium Swiss Editorial Hierarchy */}
      <div className="border-b border-slate-100 pb-3.5 mb-4">
        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 ">
          <Trophy size={12} className="text-amber-500 animate-bounce" />
          Top Readers
        </h3>
        <h4 className="text-lg font-black text-slate-900 tracking-tight mt-1">
          Elite Reader Engagement
        </h4>
        <p className="text-xs font-normal text-slate-500 mt-0.5 leading-relaxed">
          Top-performing member accounts maintaining high circulation volume and
          exemplary return compliance metrics.
        </p>
      </div>

      {/* STACKED ROSTER CONTAINER */}
      <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-start">
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center flex-1">
            <p className="text-xs text-slate-400 italic font-medium">
              No reader metrics logged for this current cycle.
            </p>
          </div>
        ) : (
          members.slice(0, 3).map((member, index) => {
            const isFirst = index === 0;
            return (
              <div
                key={member.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-4 group hover:bg-slate-50/50 transition-colors rounded-lg px-1"
              >
                {/* Left Side: Avatar Rank and Label Identification */}
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`text-[10px]  font-black h-5 w-6 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                      isFirst
                        ? "bg-amber-50 border-amber-200 text-amber-700 shadow-3xs"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    #{index + 1}
                  </span>
                  <span
                    className="text-xs font-bold text-slate-900 truncate"
                    title={member.name}
                  >
                    {member.name}
                  </span>
                </div>

                {/* Right Side: Account Activity Performance Stats */}
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-slate-900 ">
                    {member.loans} Loans
                  </p>
                  <p className="text-[10px] font-extrabold text-emerald-600 mt-0.5 uppercase tracking-wider  flex items-center justify-end gap-0.5">
                    <CheckCircle2 size={10} strokeWidth={3} />
                    {member.onTimeRate}% On-Time
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
