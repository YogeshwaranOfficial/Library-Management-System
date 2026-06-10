import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { useAuthStore } from "../../../store/authStore";
import { LibrarianProfile } from "../components/LibrarianProfile";
import { LibrarianModal } from "../components/LibrarianModal"; 
import { Mail, Phone, ArrowRight, UserPlus, ChevronLeft, ChevronRight } from "lucide-react"; 

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
  const [selectedLibrarianId, setSelectedLibrarianId] = useState<string | null>(null);
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
        }
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
      : (responsePayload && "data" in responsePayload && Array.isArray(responsePayload.data))
        ? responsePayload.data
        : [];

  const totalCount: number = Array.isArray(data) 
    ? librariansList.length 
    : (responsePayload && "totalCount" in responsePayload)
      ? responsePayload.totalCount
      : 0;

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  if (selectedLibrarianId) {
    const liveTargetProfile = librariansList.find((l: UserRecord) => l.user_id === selectedLibrarianId);
    if (liveTargetProfile) {
      return (
        <LibrarianProfile 
          profile={liveTargetProfile} 
          onBack={() => setSelectedLibrarianId(null)} 
        />
      );
    }
  }

  return (
    // 💡 CHANGED: Set structural flex container layout to calculate structural heights accurately
    <div className="flex flex-col min-h-[calc(100vh-6rem)] max-w-6xl relative animate-fade-in">
      
      {/* HEADER CONTROLS (STAYS AT THE TOP) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 mb-6 rounded-2xl border border-slate-light/10 shadow-xs shrink-0">
        <div>
          <h2 className="text-base font-black text-slate-secondary uppercase tracking-wider">Library Operators</h2>
          <p className="text-xs text-slate-light font-medium mt-0.5">Manage staff terminals, clearance logs, and authority configurations.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-sage-primary hover:bg-sage-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <UserPlus size={14} />
          Add Librarian
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-xs text-slate-light font-bold animate-pulse flex-1">
          Sifting team allocation profiles...
        </div>
      ) : (
        // 💡 CHANGED: Nested contents now wrap into an explicit layout flow architecture
        <div className="flex flex-col flex-1 justify-between">
          
          {/* SCROLLABLE GRID BOX AREA */}
          <div className="pb-8 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {librariansList.length === 0 ? (
                <div className="col-span-full bg-white text-center py-12 text-sm text-slate-light border rounded-2xl">
                  No registered operator accounts tracked on this network.
                </div>
              ) : (
                librariansList.map((librarian: UserRecord) => (
                  <div 
                    key={librarian.user_id}
                    onClick={() => setSelectedLibrarianId(librarian.user_id)}
                    className="group bg-white p-5 rounded-2xl border border-slate-light/10 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 bg-slate-secondary text-white rounded-xl flex items-center justify-center font-bold text-sm uppercase">
                          {librarian.name.slice(0, 2)}
                        </div>
                        <span className="text-[9px] font-mono font-bold tracking-widest text-sage-primary bg-sage-primary/5 px-2 py-0.5 rounded-md uppercase">
                          LIBRARIAN-{librarian.user_id.slice(-4).toUpperCase()}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-secondary group-hover:text-sage-primary transition-colors">
                        {librarian.name}
                      </h3>
                      
                      <div className="mt-3 space-y-1.5 text-xs text-slate-light font-medium">
                        <p className="flex items-center gap-2"><Mail size={13} /> {librarian.gmail}</p>
                        <p className="flex items-center gap-2"><Phone size={13} /> {librarian.phone_number}</p>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-light/5 flex items-center justify-between text-xs font-bold text-slate-light group-hover:text-slate-secondary transition-colors">
                      <span>Profile</span>
                      <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 💡 FIXED: STICKY LOCKED BOTTOM PAGINATION CONTROLS BAR */}
          <div className="sticky bottom-4 left-0 right-0 z-10 mt-auto px-5 py-4 border border-slate-light/10 rounded-2xl bg-white/95 backdrop-blur-xs flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md transition-all">
            <div className="text-xs text-slate-light font-medium">
              Showing <span className="font-bold text-slate-secondary">{librariansList.length}</span> of{" "}
              <span className="font-bold text-slate-secondary">{totalCount}</span> operators logged
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

      <LibrarianModal 
        key={selectedLibrarianId || "create-librarian-instance"}
        isOpen={isCreateModalOpen || !!selectedLibrarianId} 
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedLibrarianId(null); 
        }}
        librarianToEdit={librariansList.find((l: UserRecord) => l.user_id === selectedLibrarianId) || null}
      />
    </div>
  );
};