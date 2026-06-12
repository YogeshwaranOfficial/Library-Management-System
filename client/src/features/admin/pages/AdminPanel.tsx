import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { useAuthStore } from "../../../store/authStore";
import { Users, ArrowUpRight, ShieldCheck } from "lucide-react";

export const AdminPanel: React.FC = () => {
  const token = useAuthStore((state) => state.token);

  // Hook 1: Readers Count inside AdminPanel.tsx
  const { data: readersData, isLoading: isLoadingReaders } = useQuery({
    queryKey: ["adminReadersMasterFeed", token],
    queryFn: async () => {
      const res = await axiosClient.get("/admin/readers", {
        params: { limit: 1, offset: 0 },
      });
      return res.data?.data || res.data;
    },
    enabled: !!token,
  });

  // Hook 2: Librarians Count inside AdminPanel.tsx
  const { data: librariansData, isLoading: isLoadingLibrarians } = useQuery({
    queryKey: ["adminUsersMasterFeed", token],
    queryFn: async () => {
      const res = await axiosClient.get("/admin/librarians", {
        params: { limit: 1, offset: 0 },
      });
      return res.data?.data || res.data;
    },
    enabled: !!token,
  });

  const totalReaders = readersData?.totalCount ?? 0;
  const totalLibrarians = librariansData?.totalCount ?? 0;

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in font-sans selection:bg-amber-100">
      {/* Premium Welcome Banner Matrix card */}
      <div className="bg-card-bg p-8 rounded-2xl border border-border-main/60 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 h-full w-1.5 bg-slate-900" />
        <h2 className="text-xl font-bold text-text-main tracking-tight">
          Welcome back, System Admin
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-medium max-w-2xl">
          System access initialization verified. Select a configuration node
          below to audit, update, and manage active directory accounts.
        </p>
      </div>

      {/* Grid Display Metrics Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Gateway Card 1: Manage Users */}
        <Link
          to="/admin/users"
          className="group bg-card-bg p-6 rounded-2xl border border-border-main/60 shadow-xs hover:shadow-md hover:border-slate-900 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-text-main flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Directory Control
              </p>
              <h3 className="text-lg font-bold text-text-main tracking-tight mt-0.5">
                {isLoadingReaders ? (
                  <span className="text-xs font-bold animate-pulse text-slate-400">
                    Computing Matrix...
                  </span>
                ) : (
                  `${totalReaders} Active Readers`
                )}
              </h3>
            </div>
          </div>
          <div className="text-slate-400 group-hover:text-text-main transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
            <ArrowUpRight size={18} />
          </div>
        </Link>

        {/* Gateway Card 2: Manage Librarians */}
        <Link
          to="/admin/librarians"
          className="group bg-card-bg p-6 rounded-2xl border border-border-main/60 shadow-xs hover:shadow-md hover:border-slate-900 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-text-main flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Staff Management
              </p>
              <h3 className="text-lg font-bold text-text-main tracking-tight mt-0.5">
                {isLoadingLibrarians ? (
                  <span className="text-xs font-bold animate-pulse text-slate-400">
                    Computing Matrix...
                  </span>
                ) : (
                  `${totalLibrarians} Librarians Assigned`
                )}
              </h3>
            </div>
          </div>
          <div className="text-slate-400 group-hover:text-text-main transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
            <ArrowUpRight size={18} />
          </div>
        </Link>
      </div>
    </div>
  );
};
