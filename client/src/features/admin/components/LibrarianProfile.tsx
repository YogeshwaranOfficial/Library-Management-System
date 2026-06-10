import React, { useState } from "react";
import { ArrowLeft, Mail, Phone, Calendar, ShieldCheck, Edit3, UserX } from "lucide-react";
import { LibrarianModal } from "./LibrarianModal";
import { DeleteLibrarianProfile } from "./DeleteLibrarianProfile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { toast } from "sonner";

interface UserRecord {
  user_id: string;
  name: string;
  gmail: string;
  phone_number: string;
  created_at: string;
  role: "READER" | "LIBRARIAN";
}

interface LibrarianProfileProps {
  profile: UserRecord;
  onBack: () => void;
}

export const LibrarianProfile: React.FC<LibrarianProfileProps> = ({ profile, onBack }) => {
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // PURGE MUTATION EXECUTION LINK
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosClient.delete(`/admin/librarian/${profile.user_id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Librarian profile deleted successfully.");
      
      // 💡 FIXED: Matches the exact tracking feed array cache tag key used in ManageLibrarians
      queryClient.invalidateQueries({ queryKey: ["adminUsersMasterFeed"] }); 
      
      setIsDeleteModalOpen(false);
      onBack(); 
    },
    onError: () => {
      toast.error("Failed to cleanly flush operator entry.");
      setIsDeleteModalOpen(false);
    },
  });

  return (
    <>
      <div className="space-y-6 max-w-4xl animate-fade-in">
        
        {/* Navigation Action Strip */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-light hover:text-slate-secondary transition-colors cursor-pointer group"
        >
          <ArrowLeft size={14} className="transform group-hover:-translate-x-0.5 transition-transform" />
          Back to Operators Hub
        </button>

        {/* Identity Details Box */}
        <div className="bg-white rounded-2xl border border-slate-light/10 shadow-xs overflow-hidden">
          
          {/* Banner Layout containing Upper Right Floating Action Options */}
          <div className="h-24 bg-linear-to-r from-slate-secondary/90 to-slate-secondary p-6 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-widest text-white/40 uppercase">
              System Node: Active
            </span>
            
            {/* FLOATING ACTION MANAGEMENT SYSTEM PORTAL BUTTONS */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                <Edit3 size={12} /> Edit Profile
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-utility-crimson/20 hover:bg-utility-crimson text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                <UserX size={12} /> Delete Account
              </button>
            </div>
          </div>

          <div className="p-6 relative">
            <div className="absolute -top-10 left-6 h-20 w-20 bg-sage-primary border-4 border-white text-white rounded-2xl flex items-center justify-center font-black text-2xl uppercase shadow-md">
              {profile.name.slice(0, 2)}
            </div>

            <div className="pt-12 md:flex md:items-center md:justify-between border-b border-slate-light/5 pb-6">
              <div>
                <h2 className="text-xl font-black text-slate-secondary tracking-tight">
                  {profile.name}
                </h2>
                <p className="text-xs text-sage-primary font-bold mt-0.5 flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Assigned Library Officer
                </p>
              </div>
              <div className="mt-4 md:mt-0 bg-canvas-dominant border border-slate-light/10 px-3 py-1.5 rounded-xl text-right">
                <p className="text-[10px] font-mono font-bold tracking-wider text-slate-light uppercase">Account ID</p>
                <p className="font-data text-xs text-slate-secondary font-bold uppercase mt-0.5">
                  LIB-{profile.user_id.slice(-6).toUpperCase()}
                </p>
              </div>
            </div>

            {/* Matrix Data Grid Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-light uppercase tracking-wider block">Email Id</label>
                <div className="flex items-center gap-2 text-sm text-slate-secondary font-semibold bg-canvas-dominant/50 p-3 rounded-xl border border-slate-light/5">
                  <Mail size={15} className="text-slate-light" />
                  <span>{profile.gmail}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-light uppercase tracking-wider block">Phone Number</label>
                <div className="flex items-center gap-2 text-sm text-slate-secondary font-semibold bg-canvas-dominant/50 p-3 rounded-xl border border-slate-light/5">
                  <Phone size={15} className="text-slate-light" />
                  <span className="font-data">{profile.phone_number}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-light uppercase tracking-wider block">Registration Date</label>
                <div className="flex items-center gap-2 text-sm text-slate-secondary font-semibold bg-canvas-dominant/50 p-3 rounded-xl border border-slate-light/5">
                  <Calendar size={15} className="text-slate-light" />
                  <span className="font-data">{new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* OVERLAY LAYERS MODAL PORTALS CONTAINER */}
      {/* 💡 FIXED: Key binding ensures pristine input components mount when switching open states */}
      <LibrarianModal 
        key={isEditModalOpen ? `edit-${profile.user_id}` : "closed"}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        librarianToEdit={profile}
      />

      <DeleteLibrarianProfile 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        librarianName={profile.name}
        isPending={deleteMutation.isPending}
      />
    </>
  );
};