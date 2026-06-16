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
    /* CANVAS ALIGNMENT FIX: Swapped max-w limitations for w-full workspace layout framework */
    <div className="min-h-full w-full flex flex-col bg-white text-[#2D3748] antialiased pb-16 pt-10 px-8 relative font-sans selection:bg-[#2B6CB0]/10 select-none text-left">
      
      {/* Premium Welcome Banner Matrix card - Made to stretch perfectly */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden text-left mb-6">
        <div className="absolute top-0 left-0 h-full w-1.5 bg-[#1A365D]" />
        <h2 className="text-xl font-bold text-[#1A365D] tracking-tight">
          Welcome back, System Admin
        </h2>
        <p className="text-sm text-[#718096] mt-1 font-semibold max-w-2xl leading-relaxed">
          System access initialization verified. Select a configuration node
          below to audit, update, and manage active directory accounts.
        </p>
      </div>

      {/* Grid Display Metrics Blocks - flex-1 allows this section to claim remaining canvas whitespace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-left flex-1">
        
        {/* Gateway Card 1: Manage Users */}
        <Link
          to="/admin/users"
          className="group bg-white p-6 rounded-md border border-gray-100 border-l-4 border-l-transparent hover:border-l-blue-500 hover:bg-blue-50/40 transition-all duration-150 cursor-pointer flex items-center justify-between h-32 shadow-xs hover:shadow-2xs"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#1A365D] flex items-center justify-center transition-all duration-300 shrink-0">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#718096] uppercase tracking-widest">
                Directory Control
              </p>
              <h3 className="text-xl font-bold text-[#1A365D] tracking-tight mt-0.5 group-hover:text-[#2B6CB0] transition-colors">
                {isLoadingReaders ? (
                  <span className="text-xs font-bold animate-pulse text-[#718096] tracking-widest uppercase">
                    Computing Matrix...
                  </span>
                ) : (
                  `${totalReaders} Active Readers`
                )}
              </h3>
            </div>
          </div>
          <div className="text-gray-400 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
            <ArrowUpRight size={18} />
          </div>
        </Link>

        {/* Gateway Card 2: Manage Librarians */}
        <Link
          to="/admin/librarians"
          className="group bg-white p-6 rounded-md border border-gray-100 border-l-4 border-l-transparent hover:border-l-blue-500 hover:bg-blue-50/40 transition-all duration-150 cursor-pointer flex items-center justify-between h-32 shadow-xs hover:shadow-2xs"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#1A365D] flex items-center justify-center transition-all duration-300 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#718096] uppercase tracking-widest">
                Staff Management
              </p>
              <h3 className="text-xl font-bold text-[#1A365D] tracking-tight mt-0.5 group-hover:text-[#2B6CB0] transition-colors">
                {isLoadingLibrarians ? (
                  <span className="text-xs font-bold animate-pulse text-[#718096] tracking-widest uppercase">
                    Computing Matrix...
                  </span>
                ) : (
                  `${totalLibrarians} Librarians Assigned`
                )}
              </h3>
            </div>
          </div>
          <div className="text-gray-400 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
            <ArrowUpRight size={18} />
          </div>
        </Link>
      </div>
    </div>
  );
};
