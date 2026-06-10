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
  cancelText = "Abort",
  variant = "info",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  // Determine button accent colors based on action severity mapping systems
  const variantStyles = {
    danger: "bg-rose-600 hover:bg-rose-700 text-white",
    warning: "bg-amber-600 hover:bg-amber-700 text-white",
    info: "bg-sage-primary hover:bg-sage-primary/90 text-white",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop overlay blur */}
      <div 
        className="fixed inset-0 bg-slate-secondary/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl border border-slate-light/10 animate-zoom-in">
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
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sage-primary/10 text-sage-primary">
              <Info size={18} />
            </div>
          )}
          
          <div className="text-left w-full mt-0.5">
            <h3 className="text-xs font-black text-slate-secondary uppercase tracking-wider">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-xs text-slate-light font-medium leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Action Control Grid Layout Footer Area */}
        <div className="mt-6 pt-4 border-t border-slate-light/10 flex flex-row-reverse justify-start gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${variantStyles[variant]}`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
          
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-light hover:text-slate-secondary border border-transparent bg-transparent transition-colors cursor-pointer disabled:opacity-40"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;