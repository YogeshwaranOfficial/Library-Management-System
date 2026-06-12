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

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  // Form Fields State tracking parameters
  const [name, setName] = useState("");
  const [gmail, setGmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Error tracking vectors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset helper invoked during form completion or dismissal
  const handleForcedReset = () => {
    setName("");
    setGmail("");
    setPassword("");
    setConfirmPassword("");
    setPhoneNumber("");
    setErrors({});
    onClose();
  };

  // React Query Mutation handler to execute the POST endpoint handshake
  const addUserMutation = useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      const response = await axiosClient.post("/admin/add-user", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("New library reader account provisioned successfully.");
      queryClient.invalidateQueries({ queryKey: ["adminUsersMasterFeed"] });
      handleForcedReset();
    },
    onError: (error: AxiosError<BackendErrorResponse>) => {
      console.error("Account Creation Failed:", error);
      const serverMessage = error.response?.data?.message;
      toast.error(serverMessage || "Failed to finalize account registry.");
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

    addUserMutation.mutate({
      name: name.trim(),
      gmail: gmail.trim().toLowerCase(),
      password,
      phone_number: phoneNumber,
      role: "READER",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-card-bg rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-amber-100 animate-zoom-in">
        {/* Modal Branding Header - Slate-900 Core Banner Matching MemberModal */}
        <div className="bg-slate-900 border-b border-slate-100 p-5 text-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold tracking-tight">
              Add New Reader Profile
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
              All system configuration inputs are mandatory
            </p>
          </div>
          <button
            type="button"
            onClick={handleForcedReset}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer text-base font-bold p-1.5 hover:bg-slate-800 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Input Interactive form area */}
        <form
          onSubmit={handleSubmission}
          className="p-6 space-y-4 text-text-main"
        >
          {/* Full Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
              Full Name
            </label>
            <div className="relative">
              <User
                className="absolute left-3.5 top-3 text-slate-400"
                size={15}
              />
              <input
                type="text"
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold transition-all outline-hidden focus:bg-card-bg focus:ring-4 ${
                  errors.name
                    ? "border-rose-300 focus:ring-rose-900/5 focus:border-rose-400 text-rose-900 bg-rose-50/20"
                    : "border-border-main text-slate-800 focus:ring-slate-900/5 focus:border-slate-400"
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-rose-700 font-bold mt-1 pl-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Address Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3.5 top-3 text-slate-400"
                size={15}
              />
              <input
                type="text"
                placeholder="alex.rivera@gmail.com"
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold transition-all outline-hidden focus:bg-card-bg focus:ring-4 ${
                  errors.gmail
                    ? "border-rose-300 focus:ring-rose-900/5 focus:border-rose-400 text-rose-900 bg-rose-50/20"
                    : "border-border-main text-slate-800 focus:ring-slate-900/5 focus:border-slate-400"
                }`}
              />
            </div>
            {errors.gmail && (
              <p className="text-xs text-rose-700 font-bold mt-1 pl-1">
                {errors.gmail}
              </p>
            )}
          </div>

          {/* Security Credentials Block Grid Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-3 text-slate-400"
                  size={15}
                />
                <input
                  type="text"
                  placeholder="Password@123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono tracking-wide font-semibold transition-all outline-hidden focus:bg-card-bg focus:ring-4 ${
                    errors.password
                      ? "border-rose-300 focus:ring-rose-900/5 focus:border-rose-400 text-rose-900 bg-rose-50/20"
                      : "border-border-main text-slate-800 focus:ring-slate-900/5 focus:border-slate-400"
                  }`}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-3 text-slate-400"
                  size={15}
                />
                <input
                  type="text"
                  placeholder="Password@123"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono tracking-wide font-semibold transition-all outline-hidden focus:bg-card-bg focus:ring-4 ${
                    errors.confirmPassword
                      ? "border-rose-300 focus:ring-rose-900/5 focus:border-rose-400 text-rose-900 bg-rose-50/20"
                      : "border-border-main text-slate-800 focus:ring-slate-900/5 focus:border-slate-400"
                  }`}
                />
              </div>
            </div>
          </div>
          {(errors.password || errors.confirmPassword) && (
            <p className="text-xs text-rose-700 font-bold pl-1">
              {errors.password || errors.confirmPassword}
            </p>
          )}

          {/* Mobile Connectivity Number Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
              Mobile Number
            </label>
            <div className="relative">
              <Phone
                className="absolute left-3.5 top-3 text-slate-400"
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
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold transition-all outline-hidden focus:bg-card-bg focus:ring-4 ${
                  errors.phoneNumber
                    ? "border-rose-300 focus:ring-rose-900/5 focus:border-rose-400 text-rose-900 bg-rose-50/20"
                    : "border-border-main text-slate-800 focus:ring-slate-900/5 focus:border-slate-400"
                }`}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-xs text-rose-700 font-bold mt-1 pl-1">
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Enforced Encampment Parameters Verification Card Box */}
          <div className="flex items-center gap-2.5 p-3 bg-amber-50/40 border border-amber-200/60 rounded-xl text-xs font-bold text-amber-800 select-none">
            <ShieldCheck size={16} className="text-amber-700 stroke-[2.2]" />
            <span>Enforced Account Context : READER ACCESS ONLY</span>
          </div>

          {/* Action Footer Frame */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 text-xs font-bold tracking-wide">
            <button
              type="button"
              onClick={handleForcedReset}
              className="px-4 py-3 bg-slate-50 border border-border-main text-text-main rounded-xl transition-all hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addUserMutation.isPending}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-amber-50 rounded-xl transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer shadow-sm flex items-center justify-center min-w-25"
            >
              {addUserMutation.isPending ? "Syncing..." : "Create Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
