import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { useAuthStore } from "../../../store/authStore";
import { LibrarianProfile } from "../components/LibrarianProfile";
import { Mail, Phone, ArrowRight } from "lucide-react";

interface UserRecord {
  user_id: string;
  name: string;
  gmail: string;
  phone_number: string;
  created_at: string;
  role: "READER" | "LIBRARIAN";
}

export const ManageLibrarians: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const [selectedLibrarianId, setSelectedLibrarianId] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery<UserRecord[]>({
    queryKey: ["adminUsersMasterFeed", token],
    queryFn: async () => {
      const res = await axiosClient.get("/admin/librarians");
      return res.data?.data || res.data || [];
    },
    enabled: !!token,
  });

  const librarians = users.filter((user) => user.role === "LIBRARIAN");

  // Dynamic context profile drill-down layout viewport interceptor
  if (selectedLibrarianId) {
    const targetProfile = librarians.find((l) => l.user_id === selectedLibrarianId);
    if (targetProfile) {
      return (
        <LibrarianProfile 
          profile={targetProfile} 
          onBack={() => setSelectedLibrarianId(null)} 
        />
      );
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {isLoading ? (
        <div className="text-center py-20 text-xs text-slate-light font-bold animate-pulse">
          Sifting team allocation profiles...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {librarians.length === 0 ? (
            <div className="col-span-full bg-white text-center py-12 text-sm text-slate-light border rounded-2xl">
              No registered operator accounts tracked on this network.
            </div>
          ) : (
            librarians.map((librarian) => (
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
      )}
    </div>
  );
};