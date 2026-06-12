import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { useAuthStore } from "../../../store/authStore";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
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
    <div className="flex flex-col min-h-screen max-w-6xl mx-auto relative animate-fade-in pb-12 font-sans text-xs sm:text-sm text-text-main text-left">
      {/* 1. Page Header Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card-bg p-5 mb-5 rounded-2xl border border-border-main shadow-xs shrink-0">
        <div>
          <h2 className="text-xl font-bold text-text-main tracking-tight">
            Users Database Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">
            Click any system row ledger to view access settings, check full
            operational logs, or customize user system parameters.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedUser(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          <Plus size={14} /> Add New User
        </button>
      </div>

      {/* 2. Standardized Control Pipeline Filter Ribbon */}
      <div className="flex flex-col md:flex-row gap-3 bg-card-bg p-4 mb-5 rounded-2xl border border-border-main shadow-2xs shrink-0">
        {/* Search Anchored Input */}
        <div className="relative flex-1 w-full">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search users by name or email database..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-border-main text-text-main rounded-xl text-xs sm:text-sm font-medium outline-hidden focus:bg-card-bg focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all placeholder-slate-400"
          />
        </div>

        {/* Dropdowns Action Block */}
        <div className="flex flex-wrap md:flex-nowrap gap-2.5 w-full md:w-auto items-center">
          {/* Reset Filters Control */}
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-4 py-2 h-8.5 text-xs font-bold text-slate-500 bg-slate-50 border border-border-main hover:bg-slate-100 hover:text-text-main rounded-xl cursor-pointer transition-all text-center whitespace-nowrap flex items-center justify-center gap-1.5 uppercase"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* 3. Central Interactive Data Matrix Table */}
      <div className="flex flex-col flex-1 space-y-5">
        {isLoading ? (
          <div className="text-center py-24 text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">
            Syncing System Account Directory...
          </div>
        ) : (
          <div className="bg-card-bg rounded-2xl border border-border-main shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-main text-[11px] font-bold text-slate-400 uppercase bg-slate-50 tracking-wider">
                    <th className="py-3.5 px-5">System ID</th>
                    <th className="py-3.5 px-5">User Name</th>
                    <th className="py-3.5 px-5">Email Address</th>
                    <th className="py-3.5 px-5">Phone Number</th>
                    <th className="py-3.5 px-5">Entry Date</th>
                  </tr>
                </thead>
                <tbody className="text-xs sm:text-sm divide-y divide-slate-100 text-text-main">
                  {usersList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-20 text-center text-xs text-slate-500 font-medium>"
                      >
                        No active matching subscriber accounts found on server
                        indexing.
                      </td>
                    </tr>
                  ) : (
                    usersList.map((user: UserRecord) => (
                      <tr
                        key={user.user_id}
                        onClick={() => setSelectedUser(user)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group select-none"
                      >
                        <td className="py-3.5 px-5 font-mono text-[11px] font-bold text-slate-400 uppercase">
                          USR-{user.user_id.slice(-4)}
                        </td>
                        <td className="py-3.5 px-5 font-bold text-text-main">
                          {user.name}
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-slate-800">
                            {user.gmail}
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="text-[11px] sm:text-xs text-slate-800 mt-0.5 font-medium">
                            {user.phone_number || "No Phone Contact"}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-slate-500 text-xs">
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. Pagination Navigation Footer Deck */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>
                Page {currentPage} / {totalPages}{" "}
                <span className="text-slate-300 mx-2">|</span> Total{" "}
                {totalCount} Users
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1 || totalPages <= 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                  }}
                  className="p-2 border border-border-main bg-card-bg hover:bg-slate-50 text-slate-600 rounded-lg disabled:opacity-30 cursor-pointer transition-colors shadow-xs"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages || totalPages <= 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                  }}
                  className="p-2 border border-border-main bg-card-bg hover:bg-slate-50 text-slate-600 rounded-lg disabled:opacity-30 cursor-pointer transition-colors shadow-xs"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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
