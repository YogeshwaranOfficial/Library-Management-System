import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { useAuthStore } from "../../../store/authStore";
import { LibrarianProfile } from "./LibrarianProfile";
import { LibrarianModal } from "./LibrarianModal";
import { Mail, Phone, ArrowRight, Plus } from "lucide-react";

interface UserRecord {
  user_id: string;
  name: string;
  gmail: string;
  phone_number: string;
  created_at: string;
  role: "READER" | "LIBRARIAN";
}

interface PaginatedLibrarianResponse {
  data: UserRecord[];
  totalCount: number;
}

interface ServerApiResponse {
  success: boolean;
  message: string;
  data: PaginatedLibrarianResponse | UserRecord[];
}

export const ManageLibrarians: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const [selectedLibrarian, setSelectedLibrarian] = useState<UserRecord | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading } = useQuery<ServerApiResponse>({
    queryKey: ["adminUsersMasterFeed", token, currentPage],
    queryFn: async () => {
      const offset = (currentPage - 1) * itemsPerPage;
      const res = await axiosClient.get("/admin/librarians", {
        params: {
          limit: itemsPerPage,
          offset: offset,
        },
      });
      return res.data;
    },
    enabled: !!token,
  });

  const responsePayload = data?.data;

  const librariansList: UserRecord[] = Array.isArray(data)
    ? data
    : Array.isArray(responsePayload)
      ? responsePayload
      : responsePayload &&
        "data" in responsePayload &&
        Array.isArray(responsePayload.data)
        ? responsePayload.data
        : [];

  const totalCount: number = Array.isArray(data)
    ? librariansList.length
    : responsePayload && "totalCount" in responsePayload
      ? responsePayload.totalCount
      : 0;

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  if (selectedLibrarian) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-6">
        <LibrarianProfile
          profile={selectedLibrarian}
          onBack={() => setSelectedLibrarian(null)}
          onSaveSuccess={() => setSelectedLibrarian(null)} // ✨ Closes profile view on save to refresh dashboard view automatically
        />
      </div>
    );
  }

  return (
    <div className="min-h-full w-full flex flex-col bg-white text-[#2D3748] antialiased pb-16 pt-10 px-8 relative font-sans select-none text-left">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1A365D]">Library Operators</h2>
          <p className="text-xs text-[#718096] mt-1.5 font-semibold max-w-2xl leading-relaxed">
            Manage staff terminals, clearance logs, and authority configurations.
          </p>
        </div>
        
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center p-1.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white rounded-full transition-all cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto mb-1 mx-1"
          title="Add Librarian"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>

      <div className="h-px bg-gray-200 w-full mb-6" />

      {isLoading ? (
        <div className="py-24 text-xs font-semibold text-[#718096] tracking-widest uppercase animate-pulse flex-1 text-center">
          Syncing Team Allocation Profiles...
        </div>
      ) : (
        <div className="flex flex-col flex-1 justify-between">
          <div className="pb-8 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
              {librariansList.length === 0 ? (
                <div className="col-span-full py-20 text-left text-sm text-[#718096] font-medium">
                  No registered operator accounts tracked on server indexing.
                </div>
              ) : (
                librariansList.map((librarian: UserRecord) => {
                  return (
                    <div
                      key={librarian.user_id}
                      onClick={() => setSelectedLibrarian(librarian)}
                      className="group transition-all duration-150 cursor-pointer border border-gray-100 border-l-4 bg-white hover:bg-blue-50/40 border-l-transparent hover:border-l-blue-500 p-5 rounded-md flex flex-col justify-between h-44 shadow-xs hover:shadow-2xs"
                    >
                      <div className="w-full">
                        <div className="flex justify-between items-start mb-3">
                          <div className="w-7 h-7 bg-slate-100 text-[#1A365D] font-semibold text-xs rounded-md flex items-center justify-center shrink-0 uppercase">
                            {librarian.name ? librarian.name.slice(0, 2).toUpperCase() : "LB"}
                          </div>
                          
                          <span className="font-mono text-[10px] font-bold text-[#718096] uppercase tracking-wide">
                            OP-{librarian.user_id.slice(-4).toUpperCase()}
                          </span>
                        </div>

                        <h3 className="font-bold text-[#1A365D] text-sm truncate group-hover:text-[#2B6CB0] transition-colors tracking-tight">
                          {librarian.name}
                        </h3>

                        <div className="mt-2 space-y-1 text-xs text-slate-800 font-medium w-full">
                          <p className="flex items-center gap-2 select-all font-semibold text-[#2D3748] truncate">
                            <Mail size={12} className="text-gray-400 shrink-0" /> {librarian.gmail}
                          </p>
                          <p className="flex items-center gap-2 select-all text-[11px] font-medium text-slate-500 truncate">
                            <Phone size={12} className="text-gray-400 shrink-0" /> {librarian.phone_number || "No Phone Registered"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto pt-2.5 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-[#718096] uppercase tracking-wider group-hover:text-slate-900 transition-colors">
                        <span className="tracking-widest">View Librarian Profile</span>
                        <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {totalPages > 0 && (
            <div className="py-4 border-t border-gray-100 flex justify-between items-center text-xs text-[#718096] tracking-wide mt-auto select-none bg-white w-full">
              <span>
                Page <span className="font-semibold text-gray-800">{currentPage}</span> of <span className="font-semibold text-gray-800">{totalPages}</span>
                <span className="text-slate-300 mx-2">|</span> Total <span className="font-semibold text-gray-800">{totalCount}</span> Librarians
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

      <LibrarianModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};