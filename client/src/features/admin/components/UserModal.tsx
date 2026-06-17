import React, { useState } from "react";
import { User, Mail, Lock, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { axiosClient } from "../../../api/axiosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface BackendErrorResponse {
  success: boolean;
  message: string;
}

interface UserRecord {
  user_id: string;
  name: string;
  gmail: string;
  phone_number: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: UserRecord | null;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const queryClient = useQueryClient();
  const isEditMode = !!initialData;

  // Form Fields State tracking parameters - Derived synchronously on mount. No useEffect required.
  const [name, setName] = useState(() => initialData?.name || "");
  const [gmail, setGmail] = useState(() => initialData?.gmail || "");
  const [password, setPassword] = useState(() =>
    isEditMode ? "••••••••" : "",
  );
  const [confirmPassword, setConfirmPassword] = useState(() =>
    isEditMode ? "••••••••" : "",
  );
  const [phoneNumber, setPhoneNumber] = useState(
    () => initialData?.phone_number || "",
  );

  // Error tracking vectors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleResetFields = () => {
    setName("");
    setGmail("");
    setPassword("");
    setConfirmPassword("");
    setPhoneNumber("");
    setErrors({});
  };

  const handleForcedReset = () => {
    handleResetFields();
    onClose();
  };

  // Dual Action Mutation Handler: Routes between edit-user and add-user routes
  const userMutation = useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      if (isEditMode && initialData) {
        const response = await axiosClient.put(
          `/admin/edit-user/${initialData.user_id}`,
          payload,
        );
        return response.data;
      } else {
        const response = await axiosClient.post("/admin/add-user", payload);
        return response.data;
      }
    },
    onSuccess: () => {
      toast.success(
        isEditMode
          ? "Operator profile updated successfully."
          : "New library operator provisioned successfully.",
      );

      // INSTANT LIVE REFRESH: Force-refresh feeds to update the grid layout cards instantly
      queryClient.invalidateQueries({ queryKey: ["adminUsersMasterFeed"] });
      queryClient.invalidateQueries({ queryKey: ["readers"] });
      queryClient.invalidateQueries({ queryKey: ["operators"] });

      handleForcedReset();
    },
    onError: (error: AxiosError<BackendErrorResponse>) => {
      console.error("Account Operation Failed:", error);
      const serverMessage = error.response?.data?.message;
      toast.error(
        serverMessage || "Failed to finalize account registry context changes.",
      );
    },
  });

  const validateForm = () => {
    const localErrors: Record<string, string> = {};

    if (!name.trim()) localErrors.name = "Full name entry is required.";

    const gmailRegex = /^[a-z0-9](\.?[a-z0-9]){4,29}@gmail\.com$/;
    if (!gmail.trim()) {
      localErrors.gmail = "Email address tracking parameters are required.";
    } else if (!gmailRegex.test(gmail.toLowerCase())) {
      localErrors.gmail =
        "Please supply a valid structured @gmail.com routing handle.";
    }

    // Require validation rules ONLY on standard creation pipelines
    if (!isEditMode) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W_]{8,}$/;
      if (!password) {
        localErrors.password =
          "Security credential string allocation is required.";
      } else if (!passwordRegex.test(password)) {
        localErrors.password =
          "Must contain 8+ characters, with uppercase, lowercase, and numeric parameters.";
      }

      if (password !== confirmPassword) {
        localErrors.confirmPassword =
          "Security confirmation mismatch. Verify security values match.";
      }
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneNumber) {
      localErrors.phoneNumber =
        "Phone connectivity baseline mapping is required.";
    } else if (!phoneRegex.test(phoneNumber)) {
      localErrors.phoneNumber =
        "Must register an absolute 10-digit numeric line string.";
    }

    setErrors(localErrors);
    return Object.keys(localErrors).length === 0;
  };

  const handleSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload: Record<string, string> = {
      name: name.trim(),
      gmail: gmail.trim().toLowerCase(),
      phone_number: phoneNumber,
      role: "READER", // Set dynamically to match management panel requirement contexts
    };

    if (!isEditMode) {
      payload.password = password;
    }

    userMutation.mutate(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans select-none">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-200">
        {/* Modal Branding Header */}
        <div className="bg-white border-b border-gray-200 p-5 flex justify-between items-center">
          <div>
            <h3 className="text-lg text-[#1A365D] font-bold tracking-tight">
              {isEditMode ? "Edit User Profile" : "Add New Operator Profile"}
            </h3>
            {initialData?.user_id && (
              <p className="text-[11px] text-slate-500  mt-0.5">
                ID: {initialData.user_id}
              </p>
            )}
            <p className="text-[11px] text-[#718096] mt-1 font-bold tracking-wider uppercase">
              {isEditMode
                ? "Update data configuration parameters"
                : "All system configuration inputs are mandatory"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleForcedReset}
            className="text-[#718096] hover:text-[#1A365D] transition-colors cursor-pointer text-xs font-bold p-1.5 hover:bg-gray-100 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Input Interactive form area */}
        <form
          onSubmit={handleSubmission}
          className="p-6 space-y-5 text-[#2D3748]"
        >
          {/* Full Name Input */}
          <div>
            <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest block mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User
                className="absolute left-3.5 top-3 text-gray-400"
                size={15}
              />
              <input
                type="text"
                placeholder="Yogesh"
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
              <p className="text-xs text-rose-600 mt-1.5 font-semibold">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Address Input */}
          <div>
            <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3.5 top-3 text-gray-400"
                size={15}
              />
              <input
                type="text"
                placeholder="lib@gmail.com"
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
              <p className="text-xs text-rose-600 mt-1.5 font-semibold">
                {errors.gmail}
              </p>
            )}
          </div>

          {/* Security Credentials Block - Read Only during edit flow operations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-3 text-gray-400"
                  size={15}
                />
                <input
                  type="password"
                  placeholder="Password@123"
                  value={password}
                  readOnly={isEditMode}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs  tracking-wide font-semibold outline-hidden transition-all focus:ring-0 ${
                    isEditMode
                      ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed select-none"
                      : "bg-gray-50 focus:bg-white focus:border-gray-300"
                  } ${
                    errors.password && !isEditMode
                      ? "border-rose-300 focus:ring-rose-900/5 focus:border-rose-400 text-rose-900 bg-rose-50/20"
                      : "border-gray-200 text-[#2D3748]"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest block mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-3 text-gray-400"
                  size={15}
                />
                <input
                  type="password"
                  placeholder="Password@123"
                  value={confirmPassword}
                  readOnly={isEditMode}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs  tracking-wide font-semibold outline-hidden transition-all focus:ring-0 ${
                    isEditMode
                      ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed select-none"
                      : "bg-gray-50 focus:bg-white focus:border-gray-300"
                  } ${
                    errors.confirmPassword && !isEditMode
                      ? "border-rose-300 focus:ring-rose-900/5 focus:border-rose-400 text-rose-900 bg-rose-50/20"
                      : "border-gray-200 text-[#2D3748]"
                  }`}
                />
              </div>
            </div>
          </div>
          {errors.password || errors.confirmPassword ? (
            <p className="text-xs text-rose-600 mt-1.5 font-semibold">
              {errors.password || errors.confirmPassword}
            </p>
          ) : null}

          {/* Mobile Number Input */}
          <div>
            <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest block mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone
                className="absolute left-3.5 top-3 text-gray-400"
                size={15}
              />
              <input
                type="text"
                maxLength={10}
                placeholder="9876543210"
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(e.target.value.replace(/\D/g, ""))
                }
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-xs font-semibold outline-hidden transition-all focus:bg-white focus:border-gray-300 focus:ring-0 ${
                  errors.phoneNumber
                    ? "border-rose-300 focus:ring-rose-900/5 focus:border-rose-400 text-rose-900 bg-rose-50/20"
                    : "border-gray-200 text-[#2D3748]"
                }`}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-xs text-rose-600 mt-1.5 font-semibold">
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Enforced Parameters Box */}
          <div className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-[#718096] select-none">
            <ShieldCheck size={16} className="text-gray-400 stroke-[2.2]" />
            <span>Enforced Account Context : READER</span>
          </div>

          {/* Action Footer Frame */}
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 text-xs font-bold tracking-wide">
            <button
              type="button"
              onClick={handleForcedReset}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 text-[#718096] hover:text-[#1A365D] rounded-full transition-all hover:bg-gray-100 cursor-pointer"
            >
              Revert Changes
            </button>
            <button
              type="submit"
              disabled={userMutation.isPending}
              className="px-5 py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white rounded-full transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer shadow-sm tracking-wide flex items-center gap-1"
            >
              ✓{" "}
              {userMutation.isPending
                ? "Syncing..."
                : isEditMode
                  ? "Commit Edit"
                  : "Create Operator"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
