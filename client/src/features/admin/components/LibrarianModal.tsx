import React, { useState } from "react";
import { User, Mail, Lock, Phone, ShieldCheck } from "lucide-react";
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
  onSaveSuccess?: () => void; // ✨ Added callback hook
}

export const LibrarianModal: React.FC<LibrarianModalProps> = ({
  isOpen,
  onClose,
  librarianToEdit,
  onSaveSuccess,
}) => {
  const queryClient = useQueryClient();
  const isEditMode = !!librarianToEdit;

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
      if (onSaveSuccess) onSaveSuccess(); // ✨ Return immediately to dashboard page
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans select-none">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-200">
        <div className="bg-white border-b border-gray-200 p-5 flex justify-between items-center">
          <div>
            <h3 className="text-lg text-[#1A365D] font-bold tracking-tight">
              {isEditMode ? "Modify Librarian Details" : "Add New Librarian"}
            </h3>
            <p className="text-[11px] text-[#718096] mt-1 font-bold tracking-wider uppercase">
              {isEditMode
                ? "Adjust system operational parameters"
                : "All fields below are strictly required"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="text-[#718096] hover:text-[#1A365D] transition-colors cursor-pointer text-xs font-bold p-1.5 hover:bg-gray-100 rounded-full"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmission} className="p-6 space-y-5 text-[#2D3748]">
          <div>
            <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest block mb-1.5">
              Official Handle Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Marcus Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-xs font-semibold outline-hidden transition-all focus:bg-white focus:border-gray-300 focus:ring-0 ${
                  errors.name
                    ? "border-rose-300 focus:ring-rose-900/5 focus:border-rose-400 text-rose-900 bg-rose-50/20"
                    : "border-gray-200 text-[#2D3748]"
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-rose-600 mt-1.5 font-semibold">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest block mb-1.5">
              System Routing Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="marcus.vance@gmail.com"
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-xs font-semibold outline-hidden transition-all focus:bg-white focus:border-gray-300 focus:ring-0 ${
                  errors.gmail
                    ? "border-rose-300 focus:ring-rose-900/5 focus:border-rose-400 text-rose-900 bg-rose-50/20"
                    : "border-gray-200 text-[#2D3748]"
                }`}
              />
            </div>
            {errors.gmail && (
              <p className="text-xs text-rose-600 mt-1.5 font-semibold">{errors.gmail}</p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest block mb-1.5 leading-snug">
              {isEditMode
                ? "Change Security Password (Leave blank to preserve)"
                : "Terminal Assignment Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-gray-400" size={15} />
              <input
                type="text"
                placeholder={isEditMode ? "••••••••" : "e.g., ClearanceKey99"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-xs font-semibold tracking-wide transition-all outline-hidden focus:bg-white focus:border-gray-300 focus:ring-0 ${
                  errors.password
                    ? "border-rose-300 focus:ring-rose-900/5 focus:border-rose-400 text-rose-900 bg-rose-50/20"
                    : "border-gray-200 text-[#2D3748]"
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-rose-600 mt-1.5 font-semibold">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest block mb-1.5">
              Secure Mobile String
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 text-gray-400" size={15} />
              <input
                type="text"
                maxLength={10}
                placeholder="9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-xs font-semibold transition-all outline-hidden focus:bg-white focus:border-gray-300 focus:ring-0 ${
                  errors.phoneNumber
                    ? "border-rose-300 focus:ring-rose-900/5 focus:border-rose-400 text-rose-900 bg-rose-50/20"
                    : "border-gray-200 text-[#2D3748]"
                }`}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-xs text-rose-600 mt-1.5 font-semibold">{errors.phoneNumber}</p>
            )}
          </div>

          <div className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-[#718096] select-none">
            <ShieldCheck size={16} className="text-gray-400 stroke-[2.2]" />
            <span className="text-[11px] uppercase tracking-wide">
              Enforced Authority Level: LIBRARIAN
            </span>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 text-xs font-bold tracking-wide">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 text-[#718096] hover:text-[#1A365D] rounded-full transition-all hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={librarianMutation.isPending}
              className="px-5 py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white rounded-full transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer shadow-sm tracking-wide"
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