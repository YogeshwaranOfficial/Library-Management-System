import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { useAuthStore } from "../../../store/authStore";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { UserModal } from "./UserModal"; 
import { UserDetailsModal } from "./UserDetailsModal"; 

interface UserRecord {
  user_id: string;
  name: string;
  gmail: string;
  phone_number: string;
  created_at: string;
  role: "READER" | "LIBRARIAN";
}

interface PaginatedUserResponse {
  data: UserRecord[];
  totalCount: number;
}

interface ServerApiResponse {
  success: boolean;
  message: string;
  data: PaginatedUserResponse | UserRecord[];
}

export const ManageUsers: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  
  // Server-driven lookup filter parameters matching your portal pattern
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const itemsPerPage = 10;

  // Card Overlay state tracking management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  // Core background querying pipeline mapping directly to server indices
  const { data, isLoading } = useQuery<ServerApiResponse>({
    queryKey: ["adminUsersMasterFeed", token, currentPage, searchQuery, roleFilter],
    queryFn: async () => {
      const offset = (currentPage - 1) * itemsPerPage;
      
      const res = await axiosClient.get("/admin/readers", {
        params: {
          limit: itemsPerPage,
          offset: offset,
          search: searchQuery || undefined,
          role: roleFilter || undefined // Built-in support for granular filter parameters
        }
      });
      
      return res.data;
    },
    enabled: !!token,
  });

  const responsePayload = data?.data;

  // Normalizing records gracefully safely checking standard API patterns
  const usersList: UserRecord[] = Array.isArray(data) 
    ? data 
    : Array.isArray(responsePayload) 
      ? responsePayload 
      : (responsePayload && "data" in responsePayload && Array.isArray(responsePayload.data))
        ? responsePayload.data
        : [];

  const totalCount: number = Array.isArray(data) 
    ? usersList.length 
    : (responsePayload && "totalCount" in responsePayload)
      ? responsePayload.totalCount
      : 0;
  
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  const handleClearFilters = () => {
    setSearchQuery("");
    setRoleFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in bg-transparent font-sans text-xs sm:text-sm text-slate-700 pb-12">
      
      {/* Page Core Header Block - Spacious Layout Ivory Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Users Database Management</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
            Click any system row ledger to view access settings, check full operational logs, or customize user system parameters.
          </p>
        </div>
        <button
          onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap cursor-pointer shadow-xs self-stretch sm:self-auto justify-center"
        >
          <Plus size={14} />
          <span>Add New User</span>
        </button>
      </div>

      {/* Control Utility Filter Toolbar Line */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search users by name or email database..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs sm:text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:border-slate-900 outline-hidden focus:ring-4 focus:ring-slate-900/5 transition-all"
          />
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="grid grid-cols-2 sm:flex gap-3 w-full md:w-auto">

          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer col-span-2 sm:col-auto whitespace-nowrap"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Master Content Ledger Grid Table */}
      {isLoading ? (
        <div className="text-center py-24 text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">
          Syncing System Account Directory...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] sm:text-xs font-bold text-slate-400 uppercase bg-slate-50/50 tracking-wider">
                    <th className="py-4 px-6">System ID</th>
                    <th className="py-4 px-6">User Name</th>
                    <th className="py-4 px-6">Contact Credentials</th>
                    <th className="py-4 px-6">Account Role</th>
                    <th className="py-4 px-6">Entry Date</th>
                  </tr>
                </thead>
                <tbody className="text-xs sm:text-sm divide-y divide-slate-100 text-slate-700">
                  {usersList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-xs text-slate-500 font-medium">
                        No active matching subscriber accounts found on server indexing.
                      </td>
                    </tr>
                  ) : (
                    usersList.map((user: UserRecord) => (
                      <tr 
                        key={user.user_id} 
                        onClick={() => setSelectedUser(user)} 
                        className="hover:bg-slate-50 transition-colors cursor-pointer group select-none"
                      >
                        <td className="py-4 px-6 font-semibold text-slate-400 font-mono tracking-tight text-xs uppercase">
                          USR-{user.user_id.slice(-4)}
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900 transition-colors">
                          {user.name}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-800">{user.gmail}</div>
                          <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5 font-medium">
                            {user.phone_number || "No Phone Contact"}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] sm:text-xs font-bold border ${
                            user.role === "LIBRARIAN"
                              ? "bg-amber-50 text-amber-800 border-amber-200/60"
                              : "bg-slate-100 text-slate-700 border-slate-200/60"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-500 text-xs">
                          {new Date(user.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Navigation Footer Deck */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>
                Page {currentPage} / {totalPages} <span className="text-slate-300 mx-2">|</span> Total {totalCount} Users
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1 || totalPages <= 1}
                  onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(prev - 1, 1)); }}
                  className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg disabled:opacity-30 cursor-pointer transition-colors shadow-xs"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages || totalPages <= 1}
                  onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(prev + 1, totalPages)); }}
                  className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg disabled:opacity-30 cursor-pointer transition-colors shadow-xs"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Popup Form Modals Layers */}
      <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <UserDetailsModal 
        key={selectedUser?.user_id || "none"} 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)} 
      />
    </div>
  );
};