import React, { useState } from "react";
import { X, User, Mail, Phone, Calendar, Shield, Edit2, Trash2, Check, RotateCcw } from "lucide-react";// KeyRound 
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { DeleteUserModal } from "./DeleteUserModal"; // 💡 Import the new Modal

interface UserRecord {
  user_id: string;
  name: string;
  gmail: string;
  phone_number: string;
  password?: string; // 💡 Added password field structure support
  created_at: string;
  role: "READER" | "LIBRARIAN";
}

interface UserDetailsModalProps {
  user: UserRecord | null;
  onClose: () => void;
}

interface BackendErrorResponse {
  success: boolean;
  message: string;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose }) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // 💡 Tracks delete modal portal

  const [name, setName] = useState(user?.name || "");
  const [gmail, setGmail] = useState(user?.gmail || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || "");
  const [password, setPassword] = useState(user?.password || ""); // 💡 Holds raw admin state string
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 1. UPDATE MUTATION
  const updateMutation = useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      const response = await axiosClient.patch(`/admin/user/${user?.user_id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("User account information synchronized successfully.");
      queryClient.invalidateQueries({ queryKey: ["adminUsersMasterFeed"] });
      setIsEditing(false);
    },
    onError: (error: AxiosError<BackendErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to update record details.");
    },
  });

  // 2. DELETE MUTATION
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosClient.delete(`/admin/user/${user?.user_id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("User file purged from system registry completely.");
      queryClient.invalidateQueries({ queryKey: ["adminUsersMasterFeed"] });
      setIsDeleteModalOpen(false); // Close portal layer
      onClose(); // Close master detail file overlay
    },
    onError: (error: AxiosError<BackendErrorResponse>) => {
      toast.error(error.response?.data?.message || "Purge instruction failed.");
      setIsDeleteModalOpen(false);
    },
  });

  if (!user) return null;

  const validateForm = () => {
    const localErrors: Record<string, string> = {};
    if (!name.trim()) localErrors.name = "Full name";
    
    const gmailRegex = /^[a-z0-9](\.?[a-z0-9]){4,29}@gmail\.com$/;
    if (!gmail.trim()) localErrors.gmail = "Email address";
    else if (!gmailRegex.test(gmail.toLowerCase())) localErrors.gmail = "Must register a valid structured @gmail.com handle.";

    const phoneRegex = /^\d{10}$/;
    if (!phoneNumber) localErrors.phoneNumber = "Phone Number";
    else if (!phoneRegex.test(phoneNumber)) localErrors.phoneNumber = "Must be a 10-digit numeric character lineup.";

    if (!password) {
      localErrors.password = "Password";
    } else if (password.length < 6) {
      localErrors.password = "Security strings must be at least 6 characters long.";
    }

    setErrors(localErrors);
    return Object.keys(localErrors).length === 0;
  };

  const handleUpdateSubmit = () => {
    if (!validateForm()) return;

    updateMutation.mutate({
      name: name.trim(),
      gmail: gmail.trim().toLowerCase(),
      phone_number: phoneNumber,
      password: password, // 💡 Passing plain text directly for now (until we handle backend bcrypt hashing next)
    });
  };

  const handleRevert = () => {
    setName(user.name);
    setGmail(user.gmail);
    setPhoneNumber(user.phone_number);
    setPassword(user.password || "");
    setErrors({});
    setIsEditing(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-secondary/40 backdrop-blur-xs font-sans p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-light/10 overflow-hidden animate-fade-in">
          
          {/* Modal Top Banner Header */}
          <div className="bg-canvas-dominant p-5 border-b border-slate-light/10 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-secondary uppercase tracking-wider">
                {isEditing ? "Edit User Details" : "User Information"}
              </h3>
              <p className="text-[11px] text-slate-light mt-0.5 font-semibold font-data uppercase">
                UUID: USR-{user.user_id.slice(-6)}
              </p>
            </div>
            <button type="button" onClick={onClose} className="p-1.5 hover:bg-slate-light/10 text-slate-light hover:text-slate-secondary rounded-lg transition-colors cursor-pointer">
              <X size={16} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            
            {/* Full Name Entry Row */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-light uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-light/60" size={14} />
                <input
                  type="text"
                  value={name}
                  disabled={!isEditing}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-bold transition-all outline-hidden ${
                    isEditing 
                      ? `bg-white border text-slate-secondary focus:ring-4 ${errors.name ? "border-utility-crimson focus:ring-utility-crimson/5" : "border-sage-primary focus:ring-sage-primary/5"}` 
                      : "bg-canvas-dominant/60 border border-transparent text-slate-secondary/80 cursor-not-allowed"
                  }`}
                />
              </div>
              {errors.name && <p className="text-[11px] text-utility-crimson font-medium mt-0.5">{errors.name}</p>}
            </div>

            {/* Gmail Address Entry Row */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-light uppercase tracking-wider block">Email ID</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-light/60" size={14} />
                <input
                  type="text"
                  value={gmail}
                  disabled={!isEditing}
                  onChange={(e) => setGmail(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-bold transition-all outline-hidden ${
                    isEditing 
                      ? `bg-white border text-slate-secondary focus:ring-4 ${errors.gmail ? "border-utility-crimson focus:ring-utility-crimson/5" : "border-sage-primary focus:ring-sage-primary/5"}` 
                      : "bg-canvas-dominant/60 border border-transparent text-slate-secondary/80 cursor-not-allowed"
                  }`}
                />
              </div>
              {errors.gmail && <p className="text-[11px] text-utility-crimson font-medium mt-0.5">{errors.gmail}</p>}
            </div>

            {/* Phone Number Row */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-light uppercase tracking-wider block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-slate-light/60" size={14} />
                <input
                  type="text"
                  maxLength={10}
                  value={phoneNumber}
                  disabled={!isEditing}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-bold transition-all outline-hidden ${
                    isEditing 
                      ? `bg-white border text-slate-secondary focus:ring-4 ${errors.phoneNumber ? "border-utility-crimson focus:ring-utility-crimson/5" : "border-sage-primary focus:ring-sage-primary/5"}` 
                      : "bg-canvas-dominant/60 border border-transparent text-slate-secondary/80 cursor-not-allowed"
                  }`}
                />
              </div>
              {errors.phoneNumber && <p className="text-[11px] text-utility-crimson font-medium mt-0.5">{errors.phoneNumber}</p>}
            </div>

            {/* 💡 ADDED: Plain Text System Access Key Entry (Admin Eyes Only View) */}
            {/* <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-light uppercase tracking-wider block">Password (Plain Password)</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 text-slate-light/60" size={14} />
                <input
                  type="text" // 💡 Keep it text to display plain string as requested
                  value={password}
                  disabled={!isEditing}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="No active password configuration synced"
                  className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-bold transition-all outline-hidden font-data tracking-wide ${
                    isEditing 
                      ? `bg-white border text-slate-secondary focus:ring-4 ${errors.password ? "border-utility-crimson focus:ring-utility-crimson/5" : "border-sage-primary focus:ring-sage-primary/5"}` 
                      : "bg-canvas-dominant/60 border border-transparent text-slate-secondary/60 cursor-not-allowed"
                  }`}
                />
              </div>
              {errors.password && <p className="text-[11px] text-utility-crimson font-medium mt-0.5">{errors.password}</p>}
            </div> */}

            {/* Immutable Static Metadata Columns */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-canvas-dominant p-3 rounded-xl border border-slate-light/5">
                <span className="text-[9px] font-bold text-slate-light uppercase tracking-wider block mb-1">Role</span>
                <div className="flex items-center gap-1.5 text-slate-secondary text-xs font-bold">
                  <Shield size={13} className="text-sage-primary" />
                  <span>{user.role}</span>
                </div>
              </div>
              <div className="bg-canvas-dominant p-3 rounded-xl border border-slate-light/5">
                <span className="text-[9px] font-bold text-slate-light uppercase tracking-wider block mb-1">System Enrollment Date</span>
                <div className="flex items-center gap-1.5 text-slate-secondary text-xs font-bold">
                  <Calendar size={13} className="text-slate-light" />
                  <span className="font-data">{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Action Control Interface Tray Footers */}
            <div className="border-t border-slate-light/10 pt-4 flex items-center justify-between gap-3">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleRevert}
                    className="flex items-center gap-1.5 px-4 py-2 bg-canvas-dominant hover:bg-slate-light/10 text-slate-secondary text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    <RotateCcw size={13} /> Revert Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateSubmit}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-1.5 px-5 py-2 bg-sage-primary hover:bg-sage-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Check size={13} /> {updateMutation.isPending ? "Saving Sync..." : "Commit Edit"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)} // 💡 Opens secure overlay stack portal
                    className="flex items-center gap-1.5 px-4 py-2 bg-utility-crimson/10 hover:bg-utility-crimson text-utility-crimson hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 size={13} /> Delete User
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-5 py-2 bg-slate-secondary hover:bg-slate-secondary/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Edit2 size={13} /> Edit user
                </button>
              </>
            )}
          </div>

          </div>
        </div>
      </div>

      {/* 💡 Secure Action Overlay Portal Portal Layer */}
      <DeleteUserModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        userName={user.name}
        isPending={deleteMutation.isPending}
      />
    </>
  );
};