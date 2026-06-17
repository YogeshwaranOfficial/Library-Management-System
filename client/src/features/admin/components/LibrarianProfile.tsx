import React, { useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Edit3,
  UserX,
} from "lucide-react";
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
  onSaveSuccess?: () => void; // ✨ Added callback prop
}

export const LibrarianProfile: React.FC<LibrarianProfileProps> = ({
  profile,
  onBack,
  onSaveSuccess,
}) => {
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosClient.delete(
        `/admin/librarian/${profile.user_id}`,
      );
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
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-[#718096] hover:text-[#1A365D] transition-colors cursor-pointer group uppercase tracking-wider"
        >
          <ArrowLeft size={14} className="transform group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="h-24 bg-[#1A365D] p-6 flex items-center justify-between border-b border-gray-200/20">
            <span className="text-[11px] font-sans font-bold tracking-wider text-slate-200 uppercase">
              System Node: Active Operator
            </span>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-white/10"
              >
                <Edit3 size={12} /> Edit Profile
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-rose-600/10"
              >
                <UserX size={12} /> Delete Account
              </button>
            </div>
          </div>

          <div className="p-6 relative">
            <div className="absolute -top-10 left-6 h-20 w-20 bg-[#1A365D] border-4 border-white text-white rounded-2xl flex items-center justify-center font-bold text-2xl uppercase shadow-md">
              {profile.name.slice(0, 2)}
            </div>

            <div className="pt-12 md:flex md:items-center md:justify-between border-b border-gray-200 pb-6">
              <div>
                <h2 className="text-xl font-bold text-[#1A365D] tracking-tight">{profile.name}</h2>
                <p className="text-xs text-[#718096] font-medium mt-1 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#1A365D]" /> Assigned Library Officer
                </p>
              </div>

              <div className="mt-4 md:mt-0 bg-slate-50 border border-gray-200 px-4 py-2 rounded-xl text-left md:text-right">
                <p className="text-[11px] font-bold tracking-wider text-[#718096] uppercase">Account ID</p>
                <p className="text-sm text-[#2D3748] font-bold uppercase mt-0.5 tracking-wide">
                  LIB-{profile.user_id.slice(-6).toUpperCase()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block">Email Address</label>
                <div className="flex items-center gap-2.5 text-sm text-[#2D3748] font-medium bg-slate-50 p-3 rounded-xl border border-gray-200 select-all">
                  <Mail size={15} className="text-[#718096]" />
                  <span>{profile.gmail}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block">Phone Number</label>
                <div className="flex items-center gap-2.5 text-sm text-[#2D3748] font-medium bg-slate-50 p-3 rounded-xl border border-gray-200 select-all">
                  <Phone size={15} className="text-[#718096]" />
                  <span>{profile.phone_number || "No Phone Registered"}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block">Registration Date</label>
                <div className="flex items-center gap-2.5 text-sm text-[#2D3748] font-medium bg-slate-50 p-3 rounded-xl border border-gray-200">
                  <Calendar size={15} className="text-[#718096]" />
                  <span>
                    {new Date(profile.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LibrarianModal
        key={isEditModalOpen ? `edit-${profile.user_id}` : "closed"}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        librarianToEdit={profile}
        onSaveSuccess={onSaveSuccess} // ✨ Pass callback directly down to the save operation
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