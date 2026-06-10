import React from "react";
import { Link } from "react-router-dom"; 
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { useAuthStore } from "../../../store/authStore";
import { Users, ShieldCheck, ArrowUpRight } from "lucide-react";

export const AdminPanel: React.FC = () => {
  const token = useAuthStore((state) => state.token);

  // Hook 1: Readers Count inside AdminPanel.tsx
  const { data: readersData, isLoading: isLoadingReaders } = useQuery({
    queryKey: ["adminReadersMasterFeed", token],
    queryFn: async () => {
      // Pass a query parameter limit to get the aggregate counter matrix
      const res = await axiosClient.get("/admin/readers", { params: { limit: 1, offset: 0 } });
      return res.data?.data || res.data;
    },
    enabled: !!token,
  });

  // Hook 2: Librarians Count inside AdminPanel.tsx
  const { data: librariansData, isLoading: isLoadingLibrarians } = useQuery({
    queryKey: ["adminUsersMasterFeed", token],
    queryFn: async () => {
      const res = await axiosClient.get("/admin/librarians", { params: { limit: 1, offset: 0 } });
      return res.data?.data || res.data;
    },
    enabled: !!token,
  });

  // Safely extract totalCount properties from the new controller wrapper object format
  const totalReaders = readersData?.totalCount ?? 0;
  const totalLibrarians = librariansData?.totalCount ?? 0;

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      {/* Premium Welcome Banner Matrix card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-light/10 shadow-xs">
        <h2 className="text-xl font-bold text-slate-secondary tracking-tight">
          Welcome back, {"System Admin"}
        </h2>
        <p className="text-xs text-slate-light mt-0.5 font-medium">
          System access initialization verified. Select a configuration node below to audit active directory accounts.
        </p>
      </div>

      {/* Grid Display Metrics Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Gateway Card 1: Manage Users */}
        <Link
          to="/admin/users" 
          className="group bg-white p-6 rounded-2xl border border-slate-light/10 shadow-xs hover:shadow-md hover:border-sage-primary/20 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sage-primary/10 text-sage-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-light uppercase tracking-wider">Manage Users</p>
              <h3 className="text-2xl font-black text-slate-secondary mt-0.5">
                {isLoadingReaders ? (
                  <span className="text-xs font-bold animate-pulse text-slate-light/50">Computing...</span>
                ) : (
                  `${totalReaders} Active Readers` // 💡 FIXED: Removed .length runtime bug
                )}
              </h3>
            </div>
          </div>
          <div className="text-slate-light/40 group-hover:text-sage-primary transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
            <ArrowUpRight size={18} />
          </div>
        </Link>

        {/* Gateway Card 2: Manage Librarians */}
        <Link
          to="/admin/librarians" 
          className="group bg-white p-6 rounded-2xl border border-slate-light/10 shadow-xs hover:shadow-md hover:border-slate-secondary/20 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-secondary/10 text-slate-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-light uppercase tracking-wider">Manage Librarians</p>
              <h3 className="text-2xl font-black text-slate-secondary mt-0.5">
                {isLoadingLibrarians ? (
                  <span className="text-xs font-bold animate-pulse text-slate-light/50">Computing...</span>
                ) : (
                  `${totalLibrarians} Librarins Assigned` // 💡 FIXED: Removed .length runtime bug
                )}
              </h3>
            </div>
          </div>
          <div className="text-slate-light/40 group-hover:text-slate-secondary transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
            <ArrowUpRight size={18} />
          </div>
        </Link>

      </div>
    </div>
  );
};