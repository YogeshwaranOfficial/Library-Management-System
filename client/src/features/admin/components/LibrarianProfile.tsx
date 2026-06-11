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
      <div className="space-y-6 max-w-4xl animate-fade-in font-sans">
        
        {/* Navigation Action Strip */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer group uppercase tracking-wider"
        >
          <ArrowLeft size={14} className="transform group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {/* Identity Details Box */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
          
          {/* Banner Layout: Swapped to high-contrast dark signature panel */}
          <div className="h-24 bg-slate-900 p-6 flex items-center justify-between border-b border-amber-100/20">
            <span className="text-[10px] font-mono font-bold tracking-widest text-amber-50/60 uppercase">
              System Node: Active Operator
            </span>
            
            {/* FLOATING ACTION MANAGEMENT SYSTEM PORTAL BUTTONS */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-amber-50 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-white/5"
              >
                <Edit3 size={12} /> Edit Profile
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/20 hover:bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-rose-500/10"
              >
                <UserX size={12} /> Delete Account
              </button>
            </div>
          </div>

          <div className="p-6 relative">
            {/* Avatar block using core premium styling metrics */}
            <div className="absolute -top-10 left-6 h-20 w-20 bg-slate-900 border-4 border-white text-amber-50 rounded-2xl flex items-center justify-center font-bold text-2xl uppercase shadow-md">
              {profile.name.slice(0, 2)}
            </div>

            <div className="pt-12 md:flex md:items-center md:justify-between border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {profile.name}
                </h2>
                <p className="text-xs text-slate-600 font-medium mt-1 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-slate-900" /> Assigned Library Officer
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 bg-slate-50 border border-slate-200/60 px-4 py-2 rounded-xl text-left md:text-right">
                <p className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase">Account ID</p>
                <p className="text-xs text-slate-900 font-bold uppercase mt-0.5 tracking-wide">
                  LIB-{profile.user_id.slice(-6).toUpperCase()}
                </p>
              </div>
            </div>

            {/* Matrix Data Grid Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium bg-slate-50 p-3 rounded-xl border border-slate-200/60 select-all">
                  <Mail size={15} className="text-slate-400" />
                  <span>{profile.gmail}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</label>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium bg-slate-50 p-3 rounded-xl border border-slate-200/60 select-all">
                  <Phone size={15} className="text-slate-400" />
                  <span>{profile.phone_number || "No Phone Registered"}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registration Date</label>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <Calendar size={15} className="text-slate-400" />
                  <span>{new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* OVERLAY LAYERS MODAL PORTALS CONTAINER */}
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