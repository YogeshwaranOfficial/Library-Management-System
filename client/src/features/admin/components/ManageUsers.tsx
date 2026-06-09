import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { useAuthStore } from "../../../store/authStore";
import { Search, UserPlus } from "lucide-react";
import { UserModal } from "./UserModal"; 
import { UserDetailsModal } from "./UserDetailsModal"; // 👈 1. IMPORT USER DETAILS VIEWER MODAL

interface UserRecord {
  user_id: string;
  name: string;
  gmail: string;
  phone_number: string;
  created_at: string;
  role: "READER" | "LIBRARIAN";
}

export const ManageUsers: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 💡 NEW STATE: Track explicitly selected row user profiles for focused details view
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  const { data: users = [], isLoading } = useQuery<UserRecord[]>({
    queryKey: ["adminUsersMasterFeed", token],
    queryFn: async () => {
      const res = await axiosClient.get("/admin/readers");
      return res.data?.data || res.data || [];
    },
    enabled: !!token,
  });

  const filteredReaders = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.gmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Control Filter Toolbar card row */}
      <div className="flex bg-white p-4 rounded-2xl border border-slate-light/10 shadow-xs gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-light" size={16} />
          <input
            type="text"
            placeholder="Search users by name or email database..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Structural Data Matrix Table Block */}
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
                {filteredReaders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-slate-light">
                      No matching user files found inside the database logs.
                    </td>
                  </tr>
                ) : (
                  filteredReaders.map((user) => (
                    // 💡 MODIFIED: Added triggering click parameters and pointer cursor to table row elements
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
        </div>
      )}

    {/* Add New User Overlay Portal Modal Frame */}
      <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* 💡 FIXED: Key prop forces component to clean-mount every time selectedUser changes, removing lint dependency loops completely */}
      <UserDetailsModal 
        key={selectedUser?.user_id || "none"} 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)} 
      />
    </div>
  );
};