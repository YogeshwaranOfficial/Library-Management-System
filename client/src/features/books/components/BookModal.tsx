import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookFormSchema, type BookFormValues } from "../schemas/bookSchema";
import type { BookCategory, BookInventoryItem } from "../../../types/books";
import { axiosClient } from "../../../api/axiosClient";
import { toast } from "sonner";

// Editorial Visual Assets
import { Sparkles } from "lucide-react";

interface ScoredLine {
  originalText: string;
  translatedText: string;
  category: "green" | "yellow" | "red";
  reason: string;
}

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookFormValues) => void;
  categories: BookCategory[];
  editingBook?: BookInventoryItem | null;
}

export const BookModal = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  editingBook,
}: BookModalProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [ocrAlternatives, setOcrAlternatives] = useState<ScoredLine[]>([]);

  const [scanCounter, setScanCounter] = useState<number>(() => {
    const saved = localStorage.getItem("dev_scan_counter");
    return saved ? parseInt(saved, 10) : 0;
  });

  // Default values set to clean base states, letting the useEffect handle pre-filling on open
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BookFormValues>({
    resolver: zodResolver(BookFormSchema),
    defaultValues: {
      title: "",
      author: "",
      language: "",
      totalCopies: 1,
      categoryId: "",
    },
  });

  // Safe Synchronization Cycle: Triggers updates explicitly when the target references alter
  useEffect(() => {
    if (isOpen) {
      if (editingBook) {
        reset({
          title: editingBook.title,
          author: editingBook.author,
          language: editingBook.language || "",
          totalCopies: editingBook.totalCopies,
          categoryId: editingBook.categoryId,
        });
      } else {
        // Keeps the form clean when triggering "Add New Book"
        reset({ title: "", author: "", language: "", totalCopies: 1, categoryId: "" });
      }
    }
  }, [editingBook, isOpen, reset]);

  // Safely cleans state artifacts within action contexts outside of reactive render loops
  const handleCloseModal = () => {
    setOcrAlternatives([]);
    reset({ title: "", author: "", language: "", totalCopies: 1, categoryId: "" });
    onClose();
  };

  const handleAIScanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (scanCounter >= 10) {
      toast.error("Testing guard triggered: 10 item scan limit reached.");
      return;
    }

    const formData = new FormData();
    formData.append("bookCover", file);

    try {
      setIsScanning(true);
      setOcrAlternatives([]);
      toast.loading("Analyzing book layout structures...", {
        id: "azure-scan",
      });

      const response = await axiosClient.post("/ai/scan-cover", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 25000,
      });

      const payload = response.data;

      if (payload && payload.success) {
        if (
          payload.alternativeLines &&
          Array.isArray(payload.alternativeLines)
        ) {
          setOcrAlternatives(payload.alternativeLines);
        }

        // AUTOFILL EXECUTION: Hydrates form controllers directly
        setValue("title", payload.title || "");
        setValue("author", payload.author || "");

        const nextCount = scanCounter + 1;
        setScanCounter(nextCount);
        localStorage.setItem("dev_scan_counter", nextCount.toString());

        toast.success("Cover parsed with classification filters!", {
          id: "azure-scan",
        });
      } else {
        toast.error("Parsing threshold matching failed.", { id: "azure-scan" });
      }
    } catch (error) {
      console.error(error);

      const isAxiosError =
        error && typeof error === "object" && "code" in error;
      const errorMsg =
        isAxiosError && (error as { code: string }).code === "ECONNABORTED"
          ? "Request timeout! Azure took too long."
          : "Error communicating with AI parser layer.";

      toast.error(errorMsg, { id: "azure-scan" });
    } finally {
      setIsScanning(false);
      e.target.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans select-none text-left animate-fade-in">
      <div
        className={`bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 flex flex-col md:flex-row max-h-[90vh] transition-all duration-300 ${ocrAlternatives.length > 0 ? "w-full max-w-4xl" : "w-full max-w-xl"}`}
      >
        {/* LEFT COMPONENT: Primary Form Input Layout */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          
          {/* Header Framework - Matching Reference Module Layout */}
          <div className="flex items-center justify-between border-b border-gray-200 p-5 bg-white shrink-0">
            <div>
              <h3 className="text-lg font-bold text-[#1A365D] tracking-tight">
                {editingBook ? "Modify Details" : "Add New Book"}
              </h3>
              <p className="text-[11px] text-[#718096] font-bold mt-1 tracking-wider uppercase">
                {editingBook ? "Update Existing Record" : "Create New Inventory Registry"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCloseModal}
              className="text-[#718096] hover:text-[#1A365D] hover:bg-gray-100 transition-all text-xs font-bold cursor-pointer p-1.5 rounded-full"
            >
              ✕
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#2D3748]">
            
            {/* Intelligent OCR Scanning Engine Header Frame */}
            {!editingBook && (
              <div className="p-4 bg-gray-100 border border-dashed border-gray-200 rounded-xl space-y-2.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-[#2B6CB0] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={12} className="text-[#2B6CB0]" />{" "}
                    Intelligent OCR Engine
                  </label>
                  <span className="text-[10px] font-mono font-bold bg-gray-200 text-[#2B6CB0] px-2 py-0.5 rounded-md">
                    Scans: {scanCounter}/10
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAIScanUpload}
                  disabled={isScanning || scanCounter >= 10}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#2B6CB0] file:text-white hover:file:bg-[#1A365D] transition-all cursor-pointer"
                />
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Core Info Properties Fields */}
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest mb-1">
                    Book Title
                  </label>
                  <input
                    type="text"
                    {...register("title")}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 font-semibold text-[#1A365D] text-sm rounded-xl placeholder:text-[#718096]/50 outline-hidden focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/10 transition-all"
                  />
                  {errors.title && (
                    <p className="text-xs text-rose-600 font-bold mt-1.5">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    {...register("author")}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 font-semibold text-[#1A365D] text-sm rounded-xl placeholder:text-[#718096]/50 outline-hidden focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/10 transition-all"
                  />
                  {errors.author && (
                    <p className="text-xs text-rose-600 font-bold mt-1.5">
                      {errors.author.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest mb-1">
                    Language Spec
                  </label>
                  <input
                    type="text"
                    {...register("language")}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 font-semibold text-[#1A365D] text-sm rounded-xl placeholder:text-[#718096]/50 outline-hidden focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest mb-1">
                      Total Copies
                    </label>
                    <input
                      type="number"
                      {...register("totalCopies", { valueAsNumber: true })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 font-semibold text-[#2D3748] text-sm rounded-xl outline-hidden focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest mb-1">
                      Category Classification
                    </label>
                    <div className="relative">
                      <select
                        {...register("categoryId")}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 font-semibold text-[#1A365D] text-sm rounded-xl outline-hidden cursor-pointer focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/10 transition-all appearance-none"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operations Layout Action Buttons */}
              <div className="pt-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-bold text-[#718096] uppercase tracking-wider hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-xl transition-all cursor-pointer text-left sm:text-center"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isScanning}
                  className="px-5 py-2.5 bg-[#2B6CB0] hover:bg-[#1A365D] text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm text-center tracking-wide disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {editingBook ? "Update Book Details" : "Create Book Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COMPONENT: Interactive Diagnostic Mapping Helper Column */}
        {!editingBook && ocrAlternatives.length > 0 && (
          <div className="w-full md:w-80 bg-slate-50 border-t md:border-t-0 md:border-l border-gray-200 p-5 overflow-y-auto max-h-[35vh] md:max-h-full flex flex-col shrink-0">
            <h4 className="text-[11px] font-bold text-[#1A365D] uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Sparkles size={12} className="text-[#2B6CB0]" /> OCR Layout Fragments
            </h4>
            <p className="text-xs text-[#718096] mb-4 leading-relaxed font-medium">
              Select an isolated segment directly to re-map data properties down into the text inputs:
            </p>

            <div className="space-y-3 flex-1">
              {ocrAlternatives.map((item, idx) => {
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-gray-200 bg-white shadow-2xs transition-all"
                  >
                    <div className="font-bold text-[#2D3748] text-xs tracking-tight">
                      {item.translatedText}
                    </div>
                    {item.originalText !== item.translatedText && (
                      <div className="text-[10px] text-[#718096] italic mt-1 font-medium">
                        Raw: "{item.originalText}"
                      </div>
                    )}

                    <div className="mt-3 flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setValue("title", item.translatedText)}
                        className="px-2.5 py-1 bg-white hover:bg-amber-50 hover:text-amber-700 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-gray-200 transition-colors cursor-pointer"
                      >
                        + Title
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue("author", item.translatedText)}
                        className="px-2.5 py-1 bg-white hover:bg-amber-50 hover:text-amber-700 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-gray-200 transition-colors cursor-pointer"
                      >
                        + Author
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};