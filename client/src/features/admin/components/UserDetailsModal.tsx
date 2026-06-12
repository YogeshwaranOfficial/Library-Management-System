import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit2,
  Trash2,
  Check,
  RotateCcw,
  KeyRound,
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
  const [password, setPassword] = useState(user?.password || "");
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

    if (!password) {
      localErrors.password =
        "Security credential string allocation is required.";
    } else if (password.length < 6) {
      localErrors.password =
        "Security strings must be at least 6 characters long.";
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
      password: password,
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

  const handleMasterClose = () => {
    handleRevert();
    onClose();
  };

  return (
    <>
      {/* High contrast layout backdrop with frosting filter matching MemberDetailsModal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs font-sans">
        <div className="w-full max-w-xl rounded-2xl bg-card-bg shadow-xl transition-all overflow-hidden border border-amber-100 flex flex-col max-h-[90vh]">
          {/* Header Grid Framework - Clean Bright Banner matching screen formats */}
          <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-900">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {isEditing ? "Edit User Profile" : "User Account Information"}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-bold tracking-wide uppercase">
                ID: USR-
                {user.user_id
                  ? user.user_id.split("-").pop()?.slice(-4).toUpperCase()
                  : "0000"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleMasterClose}
              className="text-slate-400 hover:text-white transition-colors text-base font-bold cursor-pointer p-1.5 hover:bg-slate-800 rounded-lg"
            >
              ✕
            </button>
          </div>

          {/* Content Box Switcher Container */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-text-main">
            {/* Input fields / View Data fields container stack */}
            <div className="space-y-5">
              {/* Full Name Section */}
              <div className="space-y-1.5">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Full Name
                </span>
                {isEditing ? (
                  <div className="relative">
                    <User
                      className="absolute left-3.5 top-3 text-slate-400"
                      size={15}
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold transition-all outline-hidden focus:bg-card-bg focus:ring-4 ${
                        errors.name
                          ? "border-rose-300 focus:ring-rose-900/5 focus:border-rose-400 text-rose-900 bg-rose-50/20"
                          : "border-border-main text-slate-800 focus:ring-slate-900/5 focus:border-slate-400"
                      }`}
                    />
                  </div>
                ) : (
                  <span className="font-bold text-text-main block text-base pl-1">
                    {user.name}
                  </span>
                )}
                {errors.name && (
                  <p className="text-xs text-rose-700 font-bold mt-1 pl-1">
                    {errors.name}
                  </p>
                )}
              </div>

              {isEditing && <hr className="border-slate-100" />}

              {/* Dynamic Interactive Input Grid Setup */}
              <div
                className={`grid grid-cols-1 ${isEditing ? "sm:grid-cols-1 gap-y-5" : "sm:grid-cols-2 gap-y-5 gap-x-6"} text-sm`}
              >
                {/* Email Entry Section */}
                <div className="space-y-1.5">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Email Address
                  </span>
                  {isEditing ? (
                    <div className="relative">
                      <Mail
                        className="absolute left-3.5 top-3 text-slate-400"
                        size={15}
                      />
                      <input
                        type="text"
                        value={gmail}
                        onChange={(e) => setGmail(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold transition-all outline-hidden focus:bg-card-bg focus:ring-4 ${
                          errors.gmail
                            ? "border-rose-300 focus:ring-rose-900/5 focus:border-rose-400 text-rose-900 bg-rose-50/20"
                            : "border-border-main text-slate-800 focus:ring-slate-900/5 focus:border-slate-400"
                        }`}
                      />
                    </div>
                  ) : (
                    <span className="font-semibold text-text-main mt-1 block select-all text-base pl-1">
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
                <div className="space-y-1.5">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Phone Number
                  </span>
                  {isEditing ? (
                    <div className="relative">
                      <Phone
                        className="absolute left-3.5 top-3 text-slate-400"
                        size={15}
                      />
                      <input
                        type="text"
                        maxLength={10}
                        value={phoneNumber}
                        onChange={(e) =>
                          setPhoneNumber(e.target.value.replace(/\D/g, ""))
                        }
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold transition-all outline-hidden focus:bg-card-bg focus:ring-4 ${
                          errors.phoneNumber
                            ? "border-rose-300 focus:ring-rose-900/5 focus:border-rose-400 text-rose-900 bg-rose-50/20"
                            : "border-border-main text-slate-800 focus:ring-slate-900/5 focus:border-slate-400"
                        }`}
                      />
                    </div>
                  ) : (
                    <span className="font-semibold text-text-main mt-1 block select-all text-base pl-1">
                      {user.phone_number || "No Verified Phone"}
                    </span>
                  )}
                  {errors.phoneNumber && (
                    <p className="text-xs text-rose-700 font-bold mt-1 pl-1">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Password Configuration String Row */}
                <div className="space-y-1.5">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Password
                  </span>
                  {isEditing ? (
                    <div className="relative">
                      <KeyRound
                        className="absolute left-3.5 top-3 text-slate-400"
                        size={15}
                      />
                      <input
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Assign new plain text system credential mapping"
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold transition-all outline-hidden focus:bg-card-bg focus:ring-4 ${
                          errors.password
                            ? "border-rose-300 focus:ring-rose-900/5 focus:border-rose-400 text-rose-900 bg-rose-50/20"
                            : "border-border-main text-slate-800 focus:ring-slate-900/5 focus:border-slate-400"
                        }`}
                      />
                    </div>
                  ) : (
                    <span className="font-mono font-semibold text-text-main mt-1 block select-all text-base tracking-wide pl-1">
                      {user.password || "••••••••"}
                    </span>
                  )}
                  {errors.password && (
                    <p className="text-xs text-rose-700 font-bold mt-1 pl-1">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>

              {!isEditing && (
                <>
                  <hr className="border-slate-100" />

                  {/* Immutable Metadata Dashboard Blocks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-border-main/40 p-4 rounded-xl flex items-center gap-3">
                      <Shield
                        size={18}
                        className="text-slate-500 stroke-[2.2]"
                      />
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          Security Role Status
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-border-main/40 p-4 rounded-xl flex items-center gap-3">
                      <Calendar
                        size={18}
                        className="text-slate-500 stroke-[2.2]"
                      />
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          System Enrollment Date
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {new Date(user.created_at).toLocaleDateString(
                            undefined,
                            { year: "numeric", month: "long", day: "numeric" },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Operations Actions Layout Interface Tray Footer */}
            <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleRevert}
                    className="px-4 py-3 bg-slate-50 border border-border-main text-text-main text-xs font-bold uppercase tracking-wide rounded-xl transition-all hover:bg-slate-100 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={14} /> Revert Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateSubmit}
                    disabled={updateMutation.isPending}
                    className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-amber-50 text-xs font-bold uppercase tracking-wide rounded-xl transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} />{" "}
                    {updateMutation.isPending
                      ? "Saving Sync..."
                      : "Commit Edit"}
                  </button>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between w-full items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-4 py-2.5 text-xs font-bold text-rose-700 uppercase tracking-wide hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-all cursor-pointer text-left sm:text-center flex items-center justify-center sm:justify-start gap-1.5"
                  >
                    <Trash2 size={14} /> Delete User Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-amber-50 text-sm font-bold rounded-xl transition-all cursor-pointer shadow-sm text-center flex items-center justify-center gap-1.5"
                  >
                    <Edit2 size={14} /> Edit User Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Secure Action Delete Confirmation Sub-modal stack overlay */}
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
