import React, { useState } from "react";
import { X, User, Mail, Lock, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { axiosClient } from "../../../api/axiosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface UserRecord {
  user_id: string;
  name: string;
  gmail: string;
  phone_number: string;
  password?: string;
  created_at: string;
  role: "READER" | "LIBRARIAN";
}

interface BackendErrorResponse {
  success: boolean;
  message: string;
}

interface LibrarianModalProps {
  isOpen: boolean;
  onClose: () => void;
  librarianToEdit?: UserRecord | null;
}

export const LibrarianModal: React.FC<LibrarianModalProps> = ({
  isOpen,
  onClose,
  librarianToEdit,
}) => {
  const queryClient = useQueryClient();
  const isEditMode = !!librarianToEdit;

  // 💡 FIXED: Initialize state directly from props.
  // Combined with the unique layout `key`, this renders cleanly without a useEffect loop.
  const [name, setName] = useState(librarianToEdit?.name || "");
  const [gmail, setGmail] = useState(librarianToEdit?.gmail || "");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(
    librarianToEdit?.phone_number || "",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleResetAndClose = () => {
    setName("");
    setGmail("");
    setPassword("");
    setPhoneNumber("");
    setErrors({});
    onClose();
  };

  const librarianMutation = useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      if (isEditMode) {
        const response = await axiosClient.patch(
          `/admin/librarian/${librarianToEdit?.user_id}`,
          payload,
        );
        return response.data;
      } else {
        const response = await axiosClient.post(
          "/admin/add-librarian",
          payload,
        );
        return response.data;
      }
    },
    onSuccess: () => {
      toast.success(
        isEditMode
          ? "Librarian details updated successfully."
          : "New librarian authorized successfully",
      );
      queryClient.invalidateQueries({ queryKey: ["adminUsersMasterFeed"] });
      handleResetAndClose();
    },
    onError: (error: AxiosError<BackendErrorResponse>) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to commit librarian adjustments.",
      );
    },
  });

  const validateForm = () => {
    const localErrors: Record<string, string> = {};

    if (!name.trim()) localErrors.name = "Full operational name is mandatory.";

    const gmailRegex = /^[a-z0-9](\.?[a-z0-9]){4,29}@gmail\.com$/;
    if (!gmail.trim()) {
      localErrors.gmail = "Routing handle tracking input required.";
    } else if (!gmailRegex.test(gmail.toLowerCase())) {
      localErrors.gmail = "Must register a valid structured @gmail.com handle.";
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W_]{8,}$/;
    if (!password && !isEditMode) {
      localErrors.password = "Initial assignment authorization key required.";
    } else if (password && !passwordRegex.test(password)) {
      localErrors.password =
        "Must contain 8+ characters, with uppercase, lowercase, and numeric parameters.";
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneNumber) {
      localErrors.phoneNumber = "Connectivity line mapping trace required.";
    } else if (!phoneRegex.test(phoneNumber)) {
      localErrors.phoneNumber =
        "Requires strict 10-digit numeric character string.";
    }

    setErrors(localErrors);
    return Object.keys(localErrors).length === 0;
  };

  const handleSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload: Record<string, string> = isEditMode
      ? {
          name: name.trim(),
          gmail: gmail.trim().toLowerCase(),
          phone_number: phoneNumber,
        }
      : {
          name: name.trim(),
          gmail: gmail.trim().toLowerCase(),
          phone_number: phoneNumber,
          role: "LIBRARIAN",
        };

    if (password) payload.password = password;

    librarianMutation.mutate(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-card-bg rounded-2xl shadow-xl w-full max-w-md border border-amber-100/80 animate-zoom-in overflow-hidden">
        {/* Header Layout Block */}
        <div className="p-6 border-b border-slate-100 flex bg-slate-900 items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {isEditMode ? "Modify Librarian Details" : "Add New Librarian"}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {isEditMode
                ? "Adjust system operational parameters"
                : "All fields below are strictly required"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-text-main rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Input Form Fields Wrapper */}
        <form onSubmit={handleSubmission} className="p-6 space-y-4">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Official Handle Name
            </label>
            <div className="relative">
              <User
                className="absolute left-3.5 top-3 text-slate-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Marcus Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 border text-text-main rounded-xl text-xs font-semibold transition-all outline-hidden focus:bg-card-bg focus:ring-4 ${
                  errors.name
                    ? "border-rose-500 focus:ring-rose-500/5"
                    : "border-border-main focus:ring-slate-900/5 focus:border-slate-900"
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-[11px] text-rose-600 font-medium mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              System Routing Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3.5 top-3 text-slate-400"
                size={14}
              />
              <input
                type="text"
                placeholder="marcus.vance@gmail.com"
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 border text-text-main rounded-xl text-xs font-semibold transition-all outline-hidden focus:bg-card-bg focus:ring-4 ${
                  errors.gmail
                    ? "border-rose-500 focus:ring-rose-500/5"
                    : "border-border-main focus:ring-slate-900/5 focus:border-slate-900"
                }`}
              />
            </div>
            {errors.gmail && (
              <p className="text-[11px] text-rose-600 font-medium mt-1">
                {errors.gmail}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-snug">
              {isEditMode
                ? "Change Security Password (Leave blank to preserve)"
                : "Terminal Assignment Password"}
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3.5 top-3 text-slate-400"
                size={14}
              />
              <input
                type="text"
                placeholder={isEditMode ? "••••••••" : "e.g., ClearanceKey99"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 border text-text-main rounded-xl text-xs font-semibold tracking-wide transition-all outline-hidden focus:bg-card-bg focus:ring-4 ${
                  errors.password
                    ? "border-rose-500 focus:ring-rose-500/5"
                    : "border-border-main focus:ring-slate-900/5 focus:border-slate-900"
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-600 font-medium mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Phone Number Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Secure Mobile String
            </label>
            <div className="relative">
              <Phone
                className="absolute left-3.5 top-3 text-slate-400"
                size={14}
              />
              <input
                type="text"
                maxLength={10}
                placeholder="9876543210"
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(e.target.value.replace(/\D/g, ""))
                }
                className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 border text-text-main rounded-xl text-xs font-semibold transition-all outline-hidden focus:bg-card-bg focus:ring-4 ${
                  errors.phoneNumber
                    ? "border-rose-500 focus:ring-rose-500/5"
                    : "border-border-main focus:ring-slate-900/5 focus:border-slate-900"
                }`}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-[11px] text-rose-600 font-medium mt-1">
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Configuration Alert Badge */}
          <div className="bg-slate-50 p-3 rounded-xl border border-border-main/60 flex items-center gap-2 text-xs font-bold text-text-main select-none">
            <ShieldCheck size={15} className="text-text-main" />
            <span className="text-[11px] uppercase tracking-wide">
              Enforced Authority Level: LIBRARIAN
            </span>
          </div>

          {/* Action Footer Buttons */}
          <div className="flex gap-3 pt-3 border-t border-slate-100 text-xs font-bold tracking-wide">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="flex-1 py-3 bg-slate-50 border border-border-main text-text-main rounded-xl transition-all hover:bg-slate-100 cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={librarianMutation.isPending}
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-amber-50 rounded-xl transition-all shadow-sm cursor-pointer disabled:bg-slate-700 disabled:cursor-not-allowed text-center"
            >
              {librarianMutation.isPending
                ? "Syncing..."
                : isEditMode
                  ? "Apply Changes"
                  : "Authorize Node"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
