import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Edit2,
  Trash2,
  Check,
  RotateCcw,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../../../api/axiosClient";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { DeleteUserModal } from "./DeleteUserModal";

interface UserRecord {
  user_id: string;
  name: string;
  gmail: string;
  phone_number: string;
  password?: string;
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

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [gmail, setGmail] = useState(user?.gmail || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 1. UPDATE MUTATION
  const updateMutation = useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      const response = await axiosClient.patch(
        `/admin/user/${user?.user_id}`,
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("User account information synchronized successfully.");
      queryClient.invalidateQueries({ queryKey: ["adminUsersMasterFeed"] });
      setIsEditing(false);
      onClose();
    },
    onError: (error: AxiosError<BackendErrorResponse>) => {
      toast.error(
        error.response?.data?.message || "Failed to update record details.",
      );
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
      setIsDeleteModalOpen(false);
      onClose();
    },
    onError: (error: AxiosError<BackendErrorResponse>) => {
      toast.error(error.response?.data?.message || "Purge instruction failed.");
      setIsDeleteModalOpen(false);
    },
  });

  if (!user) return null;

  const validateForm = () => {
    const localErrors: Record<string, string> = {};
    if (!name.trim()) localErrors.name = "Full name entry is required.";

    const gmailRegex = /^[a-z0-9](\.?[a-z0-9]){4,29}@gmail\.com$/;
    if (!gmail.trim()) {
      localErrors.gmail = "Email address tracking parameters are required.";
    } else if (!gmailRegex.test(gmail.toLowerCase())) {
      localErrors.gmail = "Must register a valid structured @gmail.com handle.";
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneNumber) {
      localErrors.phoneNumber = "Phone connectivity parameters are required.";
    } else if (!phoneRegex.test(phoneNumber)) {
      localErrors.phoneNumber = "Must be a 10-digit numeric character lineup.";
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
    });
  };

  const handleRevert = () => {
    setName(user.name);
    setGmail(user.gmail);
    setPhoneNumber(user.phone_number);
    setErrors({});
    setIsEditing(false);
  };

  const handleMasterClose = () => {
    handleRevert();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm font-sans select-none">
        <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl transition-all overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]">
          
          {/* Header Framework */}
          <div className="flex items-center justify-between border-b border-gray-200 p-5 bg-white">
            <div>
              <h3 className="text-lg font-bold text-[#1A365D] tracking-tight">
                {isEditing ? "Edit User Profile" : "User Account Information"}
              </h3>
              <p className="text-[11px] text-[#718096] font-bold mt-1 tracking-wider uppercase">
                ID: USR-
                {user.user_id
                  ? user.user_id.split("-").pop()?.slice(-4).toUpperCase()
                  : "0000"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleMasterClose}
              className="text-[#718096] hover:text-[#1A365D] hover:bg-gray-100 transition-all text-xs font-bold cursor-pointer p-1.5 rounded-full"
            >
              ✕
            </button>
          </div>

          {/* Content Box Switcher Container */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#2D3748]">
            <div className="space-y-6">
              
              {/* Full Name Section */}
              <div>
                <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest mb-1">
                  Full Name
                </span>
                {isEditing ? (
                  <div className="relative mt-1">
                    <User
                      className="absolute left-3.5 top-3 text-gray-400"
                      size={15}
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold transition-all outline-hidden focus:bg-white focus:ring-4 ${
                        errors.name
                          ? "border-rose-300 focus:ring-rose-900/5 focus:border-rose-400 text-rose-900 bg-rose-50/20"
                          : "border-gray-200 text-[#2D3748] focus:ring-slate-900/5 focus:border-slate-400"
                      }`}
                    />
                  </div>
                ) : (
                  <span className="font-bold text-[#1A365D] block text-base pt-0.5">
                    {user.name}
                  </span>
                )}
                {errors.name && (
                  <p className="text-xs text-rose-700 font-bold mt-1 pl-1">
                    {errors.name}
                  </p>
                )}
              </div>

              <hr className="border-gray-100" />

              {/* Dynamic Interactive Grid Layout */}
              <div
                className={`grid grid-cols-1 ${isEditing ? "sm:grid-cols-2 gap-y-5 gap-x-6" : "sm:grid-cols-2 gap-y-5 gap-x-6"} text-sm`}
              >
                {/* Email Entry Section */}
                <div>
                  <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest mb-1">
                    Email Address
                  </span>
                  {isEditing ? (
                    <div className="relative mt-1">
                      <Mail
                        className="absolute left-3.5 top-3 text-gray-400"
                        size={15}
                      />
                      <input
                        type="text"
                        value={gmail}
                        onChange={(e) => setGmail(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold transition-all outline-hidden focus:bg-white focus:ring-4 ${
                          errors.gmail
                            ? "border-rose-300 focus:ring-rose-900/5 focus:border-rose-400 text-rose-900 bg-rose-50/20"
                            : "border-gray-200 text-[#2D3748] focus:ring-slate-900/5 focus:border-slate-400"
                        }`}
                      />
                    </div>
                  ) : (
                    <span className="font-semibold text-[#1A365D] mt-1 block select-all text-sm">
                      {user.gmail}
                    </span>
                  )}
                  {errors.gmail && (
                    <p className="text-xs text-rose-700 font-bold mt-1 pl-1">
                      {errors.gmail}
                    </p>
                  )}
                </div>

                {/* Phone Number Entry Section */}
                <div>
                  <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest mb-1">
                    Phone Number
                  </span>
                  {isEditing ? (
                    <div className="relative mt-1">
                      <Phone
                        className="absolute left-3.5 top-3 text-gray-400"
                        size={15}
                      />
                      <input
                        type="text"
                        maxLength={10}
                        value={phoneNumber}
                        onChange={(e) =>
                          setPhoneNumber(e.target.value.replace(/\D/g, ""))
                        }
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold transition-all outline-hidden focus:bg-white focus:ring-4 ${
                          errors.phoneNumber
                            ? "border-rose-300 focus:ring-rose-900/5 focus:border-rose-400 text-rose-900 bg-rose-50/20"
                            : "border-gray-200 text-[#2D3748] focus:ring-slate-900/5 focus:border-slate-400"
                        }`}
                      />
                    </div>
                  ) : (
                    <span className="font-semibold text-[#1A365D] mt-1 block select-all text-sm">
                      {user.phone_number || "—"}
                    </span>
                  )}
                  {errors.phoneNumber && (
                    <p className="text-xs text-rose-700 font-bold mt-1 pl-1">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Password Section - Only rendered when read-only */}
                {!isEditing && (
                  <div>
                    <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest mb-1">
                      Password
                    </span>
                    <span className="font-mono font-semibold text-[#2D3748] mt-1 block select-all text-sm tracking-wide">
                      ••••••••
                    </span>
                  </div>
                )}
              </div>

              {!isEditing && (
                <>
                  <hr className="border-gray-100" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 text-sm">
                    <div>
                      <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                        Security Role Status
                      </span>
                      <div className="mt-1.5">
                        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-[#2D3748] border border-gray-200">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                        System Enrollment Date
                      </span>
                      <span className="font-semibold text-[#2D3748] mt-1.5 block text-sm">
                        {new Date(user.created_at).toLocaleDateString(
                          undefined,
                          { year: "numeric", month: "long", day: "numeric" },
                        )}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Tray Footer Operations Actions */}
            <div className="pt-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleRevert}
                    className="px-4 py-2 text-xs font-bold text-[#718096] uppercase tracking-wider hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-xl transition-all cursor-pointer text-left sm:text-center flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={14} /> Revert Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateSubmit}
                    disabled={updateMutation.isPending}
                    className="px-5 py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm text-center tracking-wide flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} />{" "}
                    {updateMutation.isPending
                      ? "Saving Sync..."
                      : "Commit Edit"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-4 py-2 text-xs font-bold text-rose-600 uppercase tracking-wider hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-all cursor-pointer text-left sm:text-center flex items-center justify-center sm:justify-start gap-1.5"
                  >
                    <Trash2 size={14} /> Delete User Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm text-center tracking-wide flex items-center justify-center gap-1.5"
                  >
                    <Edit2 size={14} /> Edit User Details
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

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