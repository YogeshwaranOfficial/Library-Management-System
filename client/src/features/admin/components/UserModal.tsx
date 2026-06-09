import React, { useState } from "react";
import { X, User, Mail, Lock, Phone, ShieldCheck } from "lucide-react";
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

  // React Query Mutation handler to execute the POST endpoint handshake
  const addUserMutation = useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      const response = await axiosClient.post("/admin/add-user", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("New library reader account provisioned successfully.");
      queryClient.invalidateQueries({ queryKey: ["adminUsersMasterFeed"] });
      handleResetAndClose();
    },
    onError: (error: AxiosError<BackendErrorResponse>) => {
      console.error("Account Creation Failed:", error);
      const serverMessage = error.response?.data?.message;
      toast.error(serverMessage || "Failed to finalize account registry.");
    },
  });

  const handleResetAndClose = () => {
    setName("");
    setGmail("");
    setPassword("");
    setConfirmPassword("");
    setPhoneNumber("");
    setErrors({});
    onClose();
  };

  const validateForm = () => {
    const localErrors: Record<string, string> = {};

    if (!name.trim()) localErrors.name = "Full name validation entry is required.";
    
    const gmailRegex = /^[a-z0-9](\.?[a-z0-9]){4,29}@gmail\.com$/;
    if (!gmail.trim()) {
      localErrors.gmail = "Email address tracking parameters are required.";
    } else if (!gmailRegex.test(gmail.toLowerCase())) {
      localErrors.gmail = "Please supply a valid structured @gmail.com routing handle.";
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W_]{8,}$/;
    if (!password) {
      localErrors.password = "Security credential string allocation is required.";
    } else if (!passwordRegex.test(password)) {
      localErrors.password = "Must contain 8+ characters, with uppercase, lowercase, and numeric parameters.";
    }

    if (password !== confirmPassword) {
      localErrors.confirmPassword = "Security confirmation mismatch. Verify security values match.";
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneNumber) {
      localErrors.phoneNumber = "Phone connectivity baseline mapping is required.";
    } else if (!phoneRegex.test(phoneNumber)) {
      localErrors.phoneNumber = "Must register an absolute 10-digit numeric line string.";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-secondary/40 backdrop-blur-xs font-sans p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-light/10 overflow-hidden animate-fade-in">
        
        {/* Header Layout block */}
        <div className="bg-canvas-dominant p-5 border-b border-slate-light/10 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-secondary uppercase tracking-wider">New Library Reader</h3>
            <p className="text-[11px] text-slate-light mt-0.5 font-medium">All the below informations are mandatory to fill</p>
          </div>
          <button 
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 hover:bg-slate-light/10 text-slate-light hover:text-slate-secondary rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Input Interactive layout fields */}
        <form onSubmit={handleSubmission} className="p-6 space-y-4">
          
          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-light uppercase tracking-wider block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-light/70" size={14} />
              <input
                type="text"
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 bg-canvas-dominant border text-slate-secondary rounded-xl text-xs font-semibold transition-all outline-hidden focus:bg-white focus:ring-4 ${
                  errors.name ? "border-utility-crimson focus:ring-utility-crimson/5" : "border-slate-light/10 focus:ring-sage-primary/5 focus:border-sage-primary"
                }`}
              />
            </div>
            {errors.name && <p className="text-[11px] text-utility-crimson font-medium mt-1">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-light uppercase tracking-wider block">Email id</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-light/70" size={14} />
              <input
                type="text"
                placeholder="alex.rivera@gmail.com"
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 bg-canvas-dominant border text-slate-secondary rounded-xl text-xs font-semibold transition-all outline-hidden focus:bg-white focus:ring-4 ${
                  errors.gmail ? "border-utility-crimson focus:ring-utility-crimson/5" : "border-slate-light/10 focus:ring-sage-primary/5 focus:border-sage-primary"
                }`}
              />
            </div>
            {errors.gmail && <p className="text-[11px] text-utility-crimson font-medium mt-1">{errors.gmail}</p>}
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-light uppercase tracking-wider block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-light/70" size={14} />
              {/* 💡 FIXED: Changed type to "text" and optimized spacing font details */}
              <input
                type="text"
                placeholder="e.g., SecurePass123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 bg-canvas-dominant border text-slate-secondary rounded-xl text-xs font-semibold font-data tracking-wide transition-all outline-hidden focus:bg-white focus:ring-4 ${
                  errors.password ? "border-utility-crimson focus:ring-utility-crimson/5" : "border-slate-light/10 focus:ring-sage-primary/5 focus:border-sage-primary"
                }`}
              />
            </div>
            {errors.password && <p className="text-[11px] text-utility-crimson font-medium mt-1">{errors.password}</p>}
          </div>

          {/* Reconfirm Password Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-light uppercase tracking-wider block">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-light/70" size={14} />
              {/* 💡 FIXED: Changed type to "text" and optimized spacing font details */}
              <input
                type="text"
                placeholder="e.g., SecurePass123"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 bg-canvas-dominant border text-slate-secondary rounded-xl text-xs font-semibold font-data tracking-wide transition-all outline-hidden focus:bg-white focus:ring-4 ${
                  errors.confirmPassword ? "border-utility-crimson focus:ring-utility-crimson/5" : "border-slate-light/10 focus:ring-sage-primary/5 focus:border-sage-primary"
                }`}
              />
            </div>
            {errors.confirmPassword && <p className="text-[11px] text-utility-crimson font-medium mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Phone Number Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-light uppercase tracking-wider block">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-slate-light/70" size={14} />
              <input
                type="text"
                maxLength={10}
                placeholder="9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                className={`w-full pl-9 pr-4 py-2 bg-canvas-dominant border text-slate-secondary rounded-xl text-xs font-semibold transition-all outline-hidden focus:bg-white focus:ring-4 ${
                  errors.phoneNumber ? "border-utility-crimson focus:ring-utility-crimson/5" : "border-slate-light/10 focus:ring-sage-primary/5 focus:border-sage-primary"
                }`}
              />
            </div>
            {errors.phoneNumber && <p className="text-[11px] text-utility-crimson font-medium mt-1">{errors.phoneNumber}</p>}
          </div>

          {/* Enforced Fixed Configuration Parameter Information Display */}
          <div className="bg-sage-primary/5 p-3 rounded-xl border border-sage-primary/10 flex items-center gap-2.5 text-xs font-bold text-sage-primary select-none">
            <ShieldCheck size={16} />
            <span>Role : READER</span>
          </div>

          {/* Operational action execution buttons row */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="flex-1 py-2.5 bg-canvas-dominant hover:bg-slate-light/10 text-slate-secondary text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addUserMutation.isPending}
              className="flex-1 py-2.5 bg-sage-primary hover:bg-sage-primary/90 disabled:bg-slate-light/20 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center"
            >
              {addUserMutation.isPending ? "Loading..." : "Add user"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};