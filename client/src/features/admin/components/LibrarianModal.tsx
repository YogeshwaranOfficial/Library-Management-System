import React, { useState } from "react";
import { X, User, Mail, Lock, Phone, ShieldAlert } from "lucide-react";
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

export const LibrarianModal: React.FC<LibrarianModalProps> = ({ isOpen, onClose, librarianToEdit }) => {
  const queryClient = useQueryClient();
  const isEditMode = !!librarianToEdit;

  // 💡 INITIAL STATES (Derived safely from props)
  const [name, setName] = useState(librarianToEdit?.name || "");
  const [gmail, setGmail] = useState(librarianToEdit?.gmail || "");
  const [password, setPassword] = useState(librarianToEdit?.password || "");
  const [phoneNumber, setPhoneNumber] = useState(librarianToEdit?.phone_number || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 💡 CLEAN FIX: handleResetAndClose now safely manages state resets directly
  const handleResetAndClose = () => {
    if (!isEditMode) {
      setName("");
      setGmail("");
      setPassword("");
      setPhoneNumber("");
    } else {
      // Revert fields back to original prop values if the admin cancels editing
      setName(librarianToEdit?.name || "");
      setGmail(librarianToEdit?.gmail || "");
      setPassword(librarianToEdit?.password || "");
      setPhoneNumber(librarianToEdit?.phone_number || "");
    }
    setErrors({});
    onClose();
  };
  
  // MUTATION HANDLER
  const librarianMutation = useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      if (isEditMode) {
        const response = await axiosClient.patch(`/admin/librarian/${librarianToEdit?.user_id}`, payload);
        return response.data;
      } else {
        const response = await axiosClient.post("/admin/add-librarian", payload);
        return response.data;
      }
    },
    onSuccess: () => {
      toast.success(
        isEditMode 
          ? "Officer metrics updated successfully." 
          : "New administrative terminal clearance provisioned."
      );
      queryClient.invalidateQueries({ queryKey: ["adminLibrariansMasterFeed"] });
      handleResetAndClose();
    },
    onError: (error: AxiosError<BackendErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to commit librarian adjustments.");
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
      localErrors.password = "Must contain 8+ characters, with uppercase, lowercase, and numeric parameters.";
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneNumber) {
      localErrors.phoneNumber = "Connectivity line mapping trace required.";
    } else if (!phoneRegex.test(phoneNumber)) {
      localErrors.phoneNumber = "Requires strict 10-digit numeric character string.";
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
      role: "LIBRARIAN",
    };

    if (password) payload.password = password;

    librarianMutation.mutate(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-secondary/40 backdrop-blur-xs font-sans p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-light/10 overflow-hidden animate-fade-in">
        
        {/* Header Layout Block */}
        <div className="bg-canvas-dominant p-5 border-b border-slate-light/10 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-secondary uppercase tracking-wider">
              {isEditMode ? "Modify Officer Metrics" : "Provision New Library Officer"}
            </h3>
            <p className="text-[11px] text-slate-light mt-0.5 font-medium">
              {isEditMode ? "Adjust system operational parameters" : "All fields below are strictly required"}
            </p>
          </div>
          <button type="button" onClick={handleResetAndClose} className="p-1.5 hover:bg-slate-light/10 text-slate-light rounded-lg cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Input Form Fields Wrapper */}
        <form onSubmit={handleSubmission} className="p-6 space-y-4">
          
          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-light uppercase tracking-wider block">Official Handle Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-light/70" size={14} />
              <input
                type="text"
                placeholder="Marcus Vance"
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
            <label className="text-[10px] font-bold text-slate-light uppercase tracking-wider block">System Routing Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-light/70" size={14} />
              <input
                type="text"
                placeholder="marcus.vance@gmail.com"
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 bg-canvas-dominant border text-slate-secondary rounded-xl text-xs font-semibold transition-all outline-hidden focus:bg-white focus:ring-4 ${
                  errors.gmail ? "border-utility-crimson focus:ring-utility-crimson/5" : "border-slate-light/10 focus:ring-sage-primary/5 focus:border-sage-primary"
                }`}
              />
            </div>
            {errors.gmail && <p className="text-[11px] text-utility-crimson font-medium mt-1">{errors.gmail}</p>}
          </div>

          {/* Plain Text Password Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-light uppercase tracking-wider block">
              {isEditMode ? "Change Security Password (Leave blank to preserve current)" : "Terminal Assignment Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-light/70" size={14} />
              <input
                type="text"
                placeholder={isEditMode ? "••••••••" : "e.g., ClearanceKey99"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 bg-canvas-dominant border text-slate-secondary rounded-xl text-xs font-semibold font-data tracking-wide transition-all outline-hidden focus:bg-white focus:ring-4 ${
                  errors.password ? "border-utility-crimson focus:ring-utility-crimson/5" : "border-slate-light/10 focus:ring-sage-primary/5 focus:border-sage-primary"
                }`}
              />
            </div>
            {errors.password && <p className="text-[11px] text-utility-crimson font-medium mt-1">{errors.password}</p>}
          </div>

          {/* Phone Number Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-light uppercase tracking-wider block">Secure Mobile String</label>
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

          {/* Automated System Configuration Alert Badge */}
          <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 flex items-center gap-2.5 text-xs font-bold text-amber-600 select-none">
            <ShieldAlert size={16} />
            <span>Enforced Authority Level : LIBRARIAN</span>
          </div>

          {/* Trigger Actions Button Row */}
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
              disabled={librarianMutation.isPending}
              className="flex-1 py-2.5 bg-slate-secondary hover:bg-slate-secondary/90 disabled:bg-slate-light/20 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center"
            >
              {librarianMutation.isPending ? "Syncing..." : isEditMode ? "Apply Modifies" : "Authorize Node"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};