import type { OverdueRecord } from "../../../types/dashboard";
import { ShieldAlert, ShieldCheck, Users, Layers3 } from "lucide-react";

export const OverdueCounter = ({
  records,
}: {
  records: OverdueRecord[] | undefined;
}) => {
  const overdueCount = records?.length || 0;

  // 1. Calculate unique member data map distribution properties safely
  const memberBookCounts: Record<string, number> = {};

  if (records) {
    records.forEach((r) => {
      if (r.memberId) {
        memberBookCounts[r.memberId] = (memberBookCounts[r.memberId] || 0) + 1;
      }
    });
  }

  const uniqueMembersCount = Object.keys(memberBookCounts).length;

  // 2. Aggregate counts into operational distribution tiers
  const distributionTiers: Record<number, number> = {};
  Object.values(memberBookCounts).forEach((booksCount) => {
    distributionTiers[booksCount] = (distributionTiers[booksCount] || 0) + 1;
  });

  // Sort tiers numerically descending so the highest hoarders appear first
  const sortedTiers = Object.keys(distributionTiers)
    .map(Number)
    .sort((a, b) => b - a);

  if (overdueCount === 0) {
    return (
      <div className="bg-white p-2 rounded-2xl flex flex-col justify-between h-full text-left font-sans select-none">
        <div className="border-b border-slate-100 pb-3.5 mb-4">
          <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 ">
            <ShieldCheck size={12} className="text-emerald-600" />
            Operations Liability
          </h3>
          <h4 className="text-lg font-black text-slate-900 tracking-tight mt-1">
            Overdue Hold Queue
          </h4>
        </div>

        <div className="text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6 flex flex-col items-center justify-center flex-1 my-2">
          <ShieldCheck size={32} className="text-emerald-600 mb-2" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider ">
            System Verification Clear
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs font-medium">
            No unreturned items or overdue log instances registered in the
            backend registry.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-2 rounded-2xl  flex flex-col justify-between h-full text-left font-sans select-none">
      {/* HEADER BLOCK */}
      <div className="border-b border-slate-100 pb-3.5 mb-4">
        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 ">
          <ShieldAlert size={12} className="text-rose-600 animate-pulse" />
          Operations Liability
        </h3>
        <h4 className="text-lg font-black text-slate-900 tracking-tight mt-1">
          Overdue Hold Queue
        </h4>
        <p className="text-xs font-normal text-slate-500 mt-0.5 leading-relaxed">
          Real-time analytical tracking of unreturned assets grouped by patron
          liability profiles.
        </p>
      </div>

      {/* CORE DISPLAY: Two-Column High Contrast Metrics Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 my-2 min-h-0 overflow-hidden">
        {/* LEFT COLUMN: Total Book Sum & Total Unique Users Overview */}
        <div className="md:col-span-5 flex flex-col gap-3 h-full">
          {/* Total Vol Counters */}
          <div className="bg-rose-50/40 border border-rose-100/60 rounded-xl p-4 flex flex-col items-center justify-center text-center flex-1">
            <span className="text-4xl font-black text-rose-600 tracking-tighter ">
              {overdueCount}
            </span>
            <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wide mt-1">
              Books Overdue
            </span>
          </div>

          {/* Unique Patrons Core Count */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 shrink-0 shadow-3xs">
              <Users size={14} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-900">
                {uniqueMembersCount}{" "}
                {uniqueMembersCount === 1 ? "Memebr" : "Members"}
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Have Overdue
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Tier Distribution List Matrix */}
        <div className="md:col-span-7 flex flex-col bg-slate-50 border border-slate-100 rounded-xl p-3 h-full justify-start">
          <div className="flex items-center gap-1.5 border-b border-slate-200/60 pb-2 mb-2 shrink-0">
            <Layers3 size={12} className="text-slate-400" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ">
              Overdue Breakdown
            </span>
          </div>

          {/* ⚡ Dynamic scroll kicks in exactly after 2 tiers are displayed */}
          <div className="space-y-1.5 overflow-y-auto pr-0.5 flex-1 custom-scrollbar max-h-18.5">
            {sortedTiers.map((booksPerUser) => {
              const matchingUsersCount = distributionTiers[booksPerUser];
              const isHighHoarder = booksPerUser >= 3;

              return (
                <div
                  key={booksPerUser}
                  className="flex items-center justify-between bg-white border border-slate-200/80 p-2 rounded-lg shadow-3xs transition-colors hover:border-slate-300 h-8 shrink-0"
                >
                  <span className="text-xs font-medium text-slate-600">
                    <span className="font-bold text-slate-900 ">
                      {matchingUsersCount}
                    </span>{" "}
                    {matchingUsersCount === 1 ? "member has" : "members have"}
                  </span>

                  <span
                    className={`text-[10px]  font-black px-2 py-0.5 rounded-md border ${
                      isHighHoarder
                        ? "bg-rose-50 border-rose-200 text-rose-600 shadow-3xs"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    {booksPerUser} {booksPerUser === 1 ? "book" : "books"} each
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
