import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { useAuthStore } from "../../../store/authStore";
import { Search, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
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

// 💡 NEW TYPE: Defines the Axios wrapper shape from your Express server
interface ServerApiResponse {
  success: boolean;
  message: string;
  data: PaginatedUserResponse | UserRecord[];
}

export const ManageUsers: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  // 💡 FIXED: Configured hook typing explicitly
  const { data, isLoading } = useQuery<ServerApiResponse>({
    queryKey: ["adminUsersMasterFeed", token, currentPage, searchQuery],
    queryFn: async () => {
      const offset = (currentPage - 1) * itemsPerPage;
      
      const res = await axiosClient.get("/admin/readers", {
        params: {
          limit: itemsPerPage,
          offset: offset,
          search: searchQuery || undefined 
        }
      });
      
      return res.data;
    },
    enabled: !!token,
  });

  // 💡 FIXED: Extracted nested fields cleanly without utilizing explicit 'any' hooks
  const responsePayload = data?.data;

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <div className="flex bg-white p-4 rounded-2xl border border-slate-light/10 shadow-xs gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-light" size={16} />
          <input
            type="text"
            placeholder="Search users by name or email database..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 bg-canvas-dominant border border-slate-light/10 rounded-xl text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-sage-primary/10 focus:border-sage-primary outline-hidden transition-all"
          />
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sage-primary hover:bg-sage-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
        >
          <UserPlus size={15} /> Add New User
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-xs text-slate-light font-bold animate-pulse">
          Loading library account directory...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-light/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-light/10 text-[10px] font-bold text-slate-light uppercase bg-canvas-dominant tracking-wider">
                  <th className="py-4 px-5">System ID</th>
                  <th className="py-4 px-5">Full Name</th>
                  <th className="py-4 px-5">Email Address</th>
                  <th className="py-4 px-5">Phone Profile</th>
                  <th className="py-4 px-5">Entry Timestamp</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-light/5 text-slate-secondary font-medium">
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-slate-light">
                      No matching user files found inside the database logs.
                    </td>
                  </tr>
                ) : (
                  usersList.map((user: UserRecord) => (
                    <tr 
                      key={user.user_id} 
                      onClick={() => setSelectedUser(user)} 
                      className="hover:bg-canvas-dominant/60 transition-colors select-none cursor-pointer"
                    >
                      <td className="py-4 px-5 font-data text-xs text-slate-light uppercase">
                        USR-{user.user_id.slice(-4)}
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-secondary">{user.name}</td>
                      <td className="py-4 px-5 text-slate-light">{user.gmail}</td>
                      <td className="py-4 px-5 font-data text-xs text-slate-light">{user.phone_number}</td>
                      <td className="py-4 px-5 text-xs text-slate-light">
                        <span className="font-data">{new Date(user.created_at).toLocaleDateString()}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 border-t border-slate-light/10 bg-canvas-dominant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-light font-medium">
              Showing <span className="font-bold text-slate-secondary">{usersList.length}</span> of{" "}
              <span className="font-bold text-slate-secondary">{totalCount}</span> metrics accounts logged
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 border border-slate-light/10 rounded-xl bg-white text-slate-secondary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-canvas-dominant cursor-pointer transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-sage-primary text-white shadow-xs"
                      : "bg-white border border-slate-light/10 text-slate-secondary hover:bg-canvas-dominant"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-2 border border-slate-light/10 rounded-xl bg-white text-slate-secondary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-canvas-dominant cursor-pointer transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <UserDetailsModal 
        key={selectedUser?.user_id || "none"} 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)} 
      />
    </div>
  );
};