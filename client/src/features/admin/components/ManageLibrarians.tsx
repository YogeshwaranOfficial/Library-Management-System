import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { useAuthStore } from "../../../store/authStore";
import { LibrarianProfile } from "./LibrarianProfile";
import { LibrarianModal } from "./LibrarianModal";
import {
  Mail,
  Phone,
  ArrowRight,
  UserPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
  const [selectedLibrarian, setSelectedLibrarian] = useState<UserRecord | null>(
    null,
  );
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

  // 💡 FIXED: If a librarian card has been clicked, display their profile views context immediately
  if (selectedLibrarian) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <LibrarianProfile
          profile={selectedLibrarian}
          onBack={() => setSelectedLibrarian(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)] max-w-6xl relative animate-fade-in font-sans">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card-bg p-5 mb-6 rounded-2xl border border-slate-100 shadow-xs shrink-0">
        <div>
          <h2 className="text-xl font-bold text-text-main tracking-tight">
            Library Operators
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Manage staff terminals, clearance logs, and authority
            configurations.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-amber-50 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <UserPlus size={14} />
          Add Librarian
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-xs text-slate-400 font-bold animate-pulse flex-1">
          Sifting team allocation profiles...
        </div>
      ) : (
        <div className="flex flex-col flex-1 justify-between">
          {/* SCROLLABLE GRID AREA */}
          <div className="pb-8 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {librariansList.length === 0 ? (
                <div className="col-span-full bg-card-bg text-center py-12 text-sm text-slate-400 border rounded-2xl border-dashed border-border-main">
                  No registered operator accounts tracked on this network.
                </div>
              ) : (
                librariansList.map((librarian: UserRecord) => (
                  <div
                    key={librarian.user_id}
                    onClick={() => setSelectedLibrarian(librarian)}
                    className="group bg-card-bg p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-border-main transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 bg-slate-900 text-amber-50 rounded-xl flex items-center justify-center font-bold text-sm uppercase">
                          {librarian.name.slice(0, 2)}
                        </div>
                        <span className="text-[9px] font-mono font-bold tracking-widest text-text-main bg-slate-100 px-2.5 py-1 rounded-md uppercase border border-border-main/40">
                          OP-{librarian.user_id.slice(-4).toUpperCase()}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-text-main group-hover:text-slate-800 transition-colors tracking-tight">
                        {librarian.name}
                      </h3>

                      <div className="mt-3 space-y-1.5 text-xs text-slate-500 font-medium">
                        <p className="flex items-center gap-2 select-all">
                          <Mail size={13} className="text-slate-400" />{" "}
                          {librarian.gmail}
                        </p>
                        <p className="flex items-center gap-2 select-all">
                          <Phone size={13} className="text-slate-400" />{" "}
                          {librarian.phone_number || "No Phone Registered"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-text-main transition-colors">
                      <span className="uppercase tracking-wide text-[10px]">
                        View Full Operator Profile
                      </span>
                      <ArrowRight
                        size={14}
                        className="transform group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* STICKY FIXED PAGINATION BAR */}
          <div className="sticky bottom-4 left-0 right-0 z-10 mt-auto px-5 py-4 border border-slate-100 rounded-2xl bg-slate-50/50 backdrop-blur-xs flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg transition-all">
            <div className="text-sm text-slate-500 font-medium">
              <span>
                Page {currentPage} / {totalPages}{" "}
                <span className="text-slate-300 mx-2">|</span> Total{" "}
                {totalCount} Librarians
              </span>
            </div>
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

      {/* CREATION FILE OVERLAY PORTAL CONTAINER */}
      <LibrarianModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
