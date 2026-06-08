import React from "react";

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

  // Determine button accent colors based on action severity
  const variantStyles = {
    danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white",
    warning: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500 text-white",
    info: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop overlay blur */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left shadow-xl transition-all border border-slate-100">
        <div className="flex items-start space-x-3">
          {/* Context Icon indicators */}
          {variant === "danger" && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          )}
          {variant === "warning" && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          )}
          
          <div className="mt-0 text-left w-full">
            <h3 className="text-lg font-semibold leading-6 text-slate-900">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-slate-500 font-normal leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button Layout Alignment */}
        <div className="mt-6 flex flex-row-reverse justify-start gap-2">
          <button
            type="button"
            disabled={isLoading}
            className={`inline-flex w-auto justify-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${variantStyles[variant]}`}
            onClick={onConfirm}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            className="inline-flex w-auto justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            onClick={onClose}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;