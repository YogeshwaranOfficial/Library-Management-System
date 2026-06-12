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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans text-xs sm:text-sm text-text-main text-left animate-fade-in">
      {/* Backdrop overlay blur */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-sm transform overflow-hidden rounded-2xl bg-card-bg p-6 text-left shadow-xl border border-border-main animate-zoom-in">
        <div className="flex items-start gap-3.5">
          {/* Context Icon indicators matched down to severity matrices */}
          {variant === "danger" && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <AlertOctagon size={18} />
            </div>
          )}
          {variant === "warning" && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle size={18} />
            </div>
          )}
          {variant === "info" && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Info size={18} />
            </div>
          )}

          <div className="text-left w-full mt-0.5">
            <h3 className="text-xs font-bold text-text-main uppercase tracking-wide">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Action Control Grid Layout Footer Area */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-row-reverse justify-start gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed outline-hidden focus:ring-2 focus:ring-offset-2 ${variantStyles[variant]}`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-text-main border border-border-main bg-card-bg hover:bg-slate-50 rounded-xl transition-colors cursor-pointer disabled:opacity-40"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
