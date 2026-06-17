import React from "react";
import { AlertOctagon, AlertTriangle, Info } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  // Map theme variants directly to standard, reliable color values
  const variantStyles = {
    danger: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500",
    warning: "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500",
    info: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
  };

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans select-none text-left">
    {/* Backdrop overlay blur - System Core Reference Spec */}
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    />

    {/* Modal Container - Structurally scaled matching reference framework design */}
    <div className="relative z-10 w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl border border-gray-200 animate-zoom-in">
      <div className="flex items-start gap-3.5">
        {/* Context Icon indicators matched down to severity matrices */}
        {variant === "danger" && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
            <AlertOctagon size={18} />
          </div>
        )}
        {variant === "warning" && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
            <AlertTriangle size={18} />
          </div>
        )}
        {variant === "info" && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-gray-200 text-[#1A365D]">
            <Info size={18} />
          </div>
        )}

        <div className="text-left w-full mt-0.5">
          <h3 className="text-sm font-bold text-[#1A365D] uppercase tracking-wider">
            {title}
          </h3>
          <div className="mt-2">
            <p className="text-xs text-[#718096] font-medium leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Action Control Layout Footer Area */}
      <div className="mt-6 pt-5 border-t border-gray-100 flex flex-row-reverse justify-start gap-3">
        <button
          type="button"
          disabled={isLoading}
          onClick={onConfirm}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed outline-hidden focus:ring-2 focus:ring-offset-2 ${variantStyles[variant]}`}
        >
          {isLoading ? "Processing..." : confirmText}
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={onClose}
          className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#2D3748] hover:text-[#1A365D] border border-gray-200 bg-white hover:bg-gray-50 rounded-xl transition-all cursor-pointer disabled:opacity-40"
        >
          {cancelText}
        </button>
      </div>
    </div>
  </div>
);
};

export default ConfirmationModal;
