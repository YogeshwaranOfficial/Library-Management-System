import React from "react";
import { Users, ShieldAlert, BookOpen } from "lucide-react";

export const AdminPanel: React.FC = () => {


  return (
    <div className="space-y-6 max-w-6xl">
      {/* Premium Welcome Banner Matrix card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-light/10 shadow-xs">
        <h2 className="text-xl font-bold text-slate-secondary tracking-tight">
          Welcome back, {"System Admin"}
        </h2>
        <p className="text-xs text-slate-light mt-0.5 font-medium">
          System access initialization verified. Use the main layout directory console to evaluate infrastructure configurations.
        </p>
      </div>

      {/* Grid Display Metrics Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-light/10 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-sage-primary/10 text-sage-primary flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-light uppercase tracking-wider">System Users</p>
            <h3 className="text-xl font-black text-slate-secondary mt-0.5">Active Directory</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-light/10 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-sage-primary/10 text-sage-primary flex items-center justify-center">
            <ShieldAlert size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-light uppercase tracking-wider">Librarians</p>
            <h3 className="text-xl font-black text-slate-secondary mt-0.5">Assigned Officers</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-light/10 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-sage-primary/10 text-sage-primary flex items-center justify-center">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-light uppercase tracking-wider">Core Logs</p>
            <h3 className="text-xl font-black text-slate-secondary mt-0.5">Operational</h3>
          </div>
        </div>
      </div>
    </div>
  );
};