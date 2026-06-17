import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { useAuthStore } from "../../../store/authStore";
import {
  Plus,
  Search,
  Users,
  X,
  RotateCcw,
} from "lucide-react";
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

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  const { data, isLoading } = useQuery<ServerApiResponse>({
    queryKey: [
      "adminUsersMasterFeed",
      token,
      currentPage,
      searchQuery,
      roleFilter,
    ],
    queryFn: async () => {
      const offset = (currentPage - 1) * itemsPerPage;

      const res = await axiosClient.get("/admin/readers", {
        params: {
          limit: itemsPerPage,
          offset: offset,
          search: searchQuery || undefined,
          role: roleFilter || undefined,
        },
      });

      return res.data;
    },
    enabled: !!token,
  });

  const responsePayload = data?.data;

  const usersList: UserRecord[] = Array.isArray(data)
    ? data
    : Array.isArray(responsePayload)
      ? responsePayload
      : responsePayload &&
          "data" in responsePayload &&
          Array.isArray(responsePayload.data)
        ? responsePayload.data
        : [];

  const totalCount: number = Array.isArray(data)
    ? usersList.length
    : responsePayload && "totalCount" in responsePayload
      ? responsePayload.totalCount
      : 0;

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  const handleClearFilters = () => {
    setSearchQuery("");
    setRoleFilter("");
    setCurrentPage(1);
  };

 return (
    /* Standardized corporate canvas padding with exact alignment configurations */
    <div className="min-h-screen bg-white text-[#2D3748] antialiased pb-16 pt-10 px-8 lg:px-14 font-sans select-none text-left">
      
      {/* ==================== ZONES A & B: HEADER & TRACKER ==================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#718096] text-[11px] font-bold uppercase tracking-widest mb-1.5">
            <Users size={13} className="stroke-[2.5]" /> Directory
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A365D]">
            Users Database Management
          </h1>
          <p className="text-xs text-[#718096] mt-1.5 font-semibold max-w-2xl leading-relaxed">
            Click any system row ledger to view access settings, check full operational logs, or customize user system parameters.
          </p>
        </div>

        {/* Standardized tracker statistics blocks from reference */}
        <div className="flex items-center gap-10 select-none pb-0.5 self-start md:self-auto">
          <div>
            <span className="block text-2xl font-bold text-[#1A365D] tracking-tight leading-none text-right">
              {totalCount}
            </span>
            <span className="text-[10px] font-semibold text-[#718096] uppercase tracking-wider mt-2 block">
              Total Users
            </span>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200 w-full mb-6" />

      {/* ==================== ZONE C: UTILITIES HEADER ==================== */}
      <div className="flex items-center justify-between gap-4 mb-4 h-9">
        <div className="text-[10px] font-bold tracking-widest text-[#1A365D] uppercase">
          Users Ledger
        </div>

        <div className="flex items-center gap-3">
          {/* Exact standardized rounded search field element from reference menu */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-sm focus-within:border-gray-300 focus-within:bg-white transition-all w-64">
            <Search size={13} className="text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search users by name or email database..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-0 outline-none w-full text-xs font-medium text-[#1A365D] placeholder-[#A0AEC0] p-0 focus:ring-0 focus:outline-none"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                className="text-gray-400 hover:text-gray-600 ml-1 shrink-0"
              >
                <X size={11} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleClearFilters}
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
            title="Reset Filters"
          >
            <RotateCcw size={15} />
          </button>

          <div className="w-px h-4 bg-gray-200 mx-0.5" />

          {/* Clean institutional plus button framework matches exactly */}
          <button
            type="button"
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center p-1.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white rounded-full transition-all cursor-pointer shadow-2xs shrink-0"
            title="Add New User"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ==================== ZONE D: GRID DISPLAY VIEW ==================== */}
      <div className="w-full transition-all duration-300">
        <div className="w-full">
          {isLoading ? (
            <div className="py-24 text-xs font-semibold text-[#718096] tracking-widest uppercase animate-pulse">
              Syncing System Account Directory...
            </div>
          ) : (
            <div className="w-full">
              <div className="overflow-x-auto w-full">
                {/* FIX: Swapped arbitrary 'min-w-[800px]' with canonical Tailwind v4 'min-w-200' */}
                <table className="w-full text-left border-collapse table-fixed min-w-200">
                  <thead>
                    <tr className="border-b border-gray-200 text-[11px] font-bold text-[#718096] uppercase tracking-widest bg-transparent select-none">
                      <th className="pb-3 pr-4 font-bold tracking-widest w-[18%] pl-3">System ID</th>
                      <th className="pb-3 px-4 font-bold tracking-widest w-[25%]">User Name</th>
                      <th className="pb-3 px-4 font-bold tracking-widest w-[27%]">Email Address</th>
                      <th className="pb-3 px-4 font-bold tracking-widest w-[18%]">Phone Number</th>
                      <th className="pb-3 px-4 font-bold tracking-widest w-[12%]">Entry Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100 font-medium text-[#2D3748]">
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-20 text-left text-sm text-[#718096] font-medium pl-3">
                          No active matching subscriber accounts found on server indexing.
                        </td>
                      </tr>
                    ) : (
                      /* FIX: Changed structural iteration hook type mapping from 'any' to explicit 'UserRecord' contract */
                      usersList.map((user: UserRecord) => {
                        const isCurrentSelection = selectedUser?.user_id === user.user_id;
                        return (
                          <tr
                            key={user.user_id}
                            onClick={() => setSelectedUser(user)}
                            className={`transition-all duration-150 cursor-pointer border-l-4 ${
                              isCurrentSelection 
                                ? 'bg-slate-50/80 border-l-4 border-l-blue-500' 
                                : 'hover:bg-blue-50/40 border-l-4 border-l-transparent'
                            }`}
                          >
                            <td className="py-3.5 pr-4 pl-3 font-mono text-[11px] font-bold text-[#718096] uppercase truncate">
                              USR-{user.user_id.slice(-4)}
                            </td>
                            
                            <td className="py-3.5 px-4 font-bold text-[#1A365D] truncate">
                              <div className="flex items-center gap-3 truncate">
                                <div className="w-7 h-7 bg-slate-100 text-[#1A365D] font-semibold text-xs rounded-md flex items-center justify-center shrink-0">
                                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                </div>
                                <span className={`font-semibold tracking-tight text-sm truncate ${isCurrentSelection ? "text-[#2B6CB0]" : "text-[#1A365D]"}`}>
                                  {user.name}
                                </span>
                              </div>
                            </td>
                            
                            <td className="py-3.5 px-4 font-semibold text-slate-800 truncate">
                              {user.gmail}
                            </td>

                            <td className="py-3.5 px-4 text-[11px] sm:text-xs text-slate-800 font-medium truncate">
                              {user.phone_number || "No Phone Contact"}
                            </td>

                            <td className="py-3.5 px-4 font-semibold text-[#718096] text-xs truncate">
                              {new Date(user.created_at).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* RESTORED: Pagination navigation metrics block elements under the layout frame */}
              {totalPages > 0 && (
                <div className="py-4 border-t border-gray-100 flex justify-between items-center text-xs text-[#718096] tracking-wide mt-2 select-none pl-3">
                  <span>
                    Page <span className="font-semibold text-gray-800">{currentPage}</span> of <span className="font-semibold text-gray-800">{totalPages}</span>
                    <span className="text-slate-300 mx-2">|</span> Total <span className="font-semibold text-gray-800">{totalCount}</span> Users
                  </span>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      disabled={currentPage === 1 || totalPages <= 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPage((prev) => Math.max(prev - 1, 1));
                      }}
                      className="text-gray-600 font-semibold tracking-wider disabled:opacity-20 cursor-pointer hover:text-[#2B6CB0] flex items-center gap-1 transition-colors"
                    >
                      ← Previous
                    </button>
                    <button
                      type="button"
                      disabled={currentPage === totalPages || totalPages <= 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                      }}
                      className="text-gray-600 font-semibold tracking-wider disabled:opacity-20 cursor-pointer hover:text-[#2B6CB0] flex items-center gap-1 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ==================== GLOBAL OVERLAY MODALS ==================== */}
      <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <UserDetailsModal
        key={selectedUser?.user_id || "none"}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
};