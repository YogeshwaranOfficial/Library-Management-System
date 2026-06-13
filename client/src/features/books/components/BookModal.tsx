import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookFormSchema, type BookFormValues } from "../schemas/bookSchema";
import type { BookCategory, BookInventoryItem } from "../../../types/books";
import { axiosClient } from "../../../api/axiosClient";
import { toast } from "sonner";

// Editorial Visual Assets
import { Sparkles, BookOpen, User, Layers, Hash, X } from "lucide-react";

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

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BookFormValues>({
    resolver: zodResolver(BookFormSchema),
    defaultValues: { title: "", author: "", language:"", totalCopies: 1, categoryId: "" },
  });

  // Simple synchronization cycle without cascading state updates
  useEffect(() => {
    if (editingBook) {
      reset({
        title: editingBook.title,
        author: editingBook.author,
        language: editingBook.language,
        totalCopies: editingBook.totalCopies,
        categoryId: editingBook.categoryId,
      });
    } else {
      reset({ title: "", author: "", language:"", totalCopies: 1, categoryId: "" });
    }
  }, [editingBook, reset]);

  // Safely cleans state artifacts within action contexts outside of reactive render loops
  const handleCloseModal = () => {
    setOcrAlternatives([]);
    reset();
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans text-text-main text-left">
      <div
        className={`bg-card-bg rounded-2xl shadow-xl overflow-hidden border border-border-main/60 flex flex-col md:flex-row max-h-[90vh] transition-all duration-300 animate-zoom-in ${ocrAlternatives.length > 0 ? "w-full max-w-4xl" : "w-full max-w-lg"}`}
      >
        {/* LEFT COMPONENT: Primary Form Input Layout */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Modal Branding Header - Clean Dark Structured Banner */}
          <div className="bg-slate-900 p-5 text-white flex justify-between items-center shrink-0">
            <h3 className="font-bold text-xl uppercase tracking-wider">
              {editingBook ? "Modify Details" : "Add New Book"}
            </h3>
            <button
              type="button"
              onClick={handleCloseModal}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1.5 hover:bg-card-bg/10 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 space-y-5 flex-1">
            {!editingBook && (
              <div className="p-4 bg-amber-50/40 border border-dashed border-amber-200 rounded-xl space-y-2.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={12} className="text-amber-600" />{" "}
                    Intelligent OCR Engine
                  </label>
                  <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                    Scans: {scanCounter}/10
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAIScanUpload}
                  disabled={isScanning || scanCounter >= 10}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 transition-all cursor-pointer"
                />
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <BookOpen size={12} /> Book Title
                </label>
                <input
                  type="text"
                  {...register("title")}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-border-main text-xs sm:text-sm font-semibold text-text-main rounded-xl placeholder:text-slate-400 outline-hidden focus:bg-card-bg focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
                />
                {errors.title && (
                  <p className="text-xs text-rose-700 font-bold mt-1.5">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <User size={12} /> Author Name
                </label>
                <input
                  type="text"
                  {...register("author")}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-border-main text-xs sm:text-sm font-semibold text-text-main rounded-xl placeholder:text-slate-400 outline-hidden focus:bg-card-bg focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
                />
                {errors.author && (
                  <p className="text-xs text-rose-700 font-bold mt-1.5">
                    {errors.author.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <BookOpen size={12} /> Language
                </label>
                <input
                  type="text"
                  {...register("language")}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-border-main text-xs sm:text-sm font-semibold text-text-main rounded-xl placeholder:text-slate-400 outline-hidden focus:bg-card-bg focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
                />
                {errors.author && (
                  <p className="text-xs text-rose-700 font-bold mt-1.5">
                    {errors.author.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <Hash size={12} /> Copies
                  </label>
                  <input
                    type="number"
                    {...register("totalCopies", { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-border-main text-xs sm:text-sm font-bold text-text-main rounded-xl outline-hidden focus:bg-card-bg focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <Layers size={12} /> Category
                  </label>
                  <div className="relative">
                    <select
                      {...register("categoryId")}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-border-main text-xs sm:text-sm font-semibold text-text-main rounded-xl outline-hidden cursor-pointer focus:bg-card-bg focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all appearance-none"
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

              {/* Action Footer Frame */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 text-xs font-bold tracking-wide">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 bg-slate-50 border border-border-main text-text-main rounded-xl transition-all hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScanning}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-50 rounded-xl transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer shadow-xs whitespace-nowrap"
                >
                  {editingBook ? "Update Details" : "Create Book Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COMPONENT: Interactive Diagnostic Mapping Helper Column */}
        {!editingBook && ocrAlternatives.length > 0 && (
          <div className="w-full md:w-80 bg-slate-50/50 border-t md:border-t-0 md:border-l border-border-main p-5 overflow-y-auto max-h-[35vh] md:max-h-full flex flex-col shrink-0">
            <h4 className="text-[11px] font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Sparkles size={12} className="text-amber-500" /> OCR Layout
              Fragments
            </h4>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">
              Select an isolated segment directly to re-map data properties down
              into the text inputs:
            </p>

            <div className="space-y-3 flex-1">
              {ocrAlternatives.map((item, idx) => {
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-border-main/70 bg-card-bg shadow-xs transition-all"
                  >
                    <div className="font-bold text-text-main text-xs tracking-tight">
                      {item.translatedText}
                    </div>
                    {item.originalText !== item.translatedText && (
                      <div className="text-[10px] text-slate-400 italic mt-1 font-medium">
                        Raw: "{item.originalText}"
                      </div>
                    )}

                    <div className="mt-3 flex gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setValue("title", item.translatedText)}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-border-main transition-colors cursor-pointer"
                      >
                        + Title
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue("author", item.translatedText)}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-border-main transition-colors cursor-pointer"
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
