import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookFormSchema, type BookFormValues } from "../schemas/bookSchema";
import type { BookCategory, EditingBookInventoryItem } from "../../../types/books";
import { axiosClient } from "../../../api/axiosClient";
import { toast } from "sonner";

// Editorial Visual Assets
import { Sparkles, BookOpen, Layers, Hash } from "lucide-react";

interface BookAiInsights {
  category: string;
  overview: string;
}

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookFormValues) => void;
  categories: BookCategory[];
  editingBook?: EditingBookInventoryItem | null;
}

export const BookModal = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  editingBook,
}: BookModalProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [aiInsights, setAiInsights] = useState<BookAiInsights | null>(null);
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
    defaultValues: {
      title: "",
      author: "",
      language: "",
      totalCopies: 1,
      categoryId: "",
      isbn: "", // 🚀 Initialize default state empty string
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (editingBook) {
        reset({
          title: editingBook.book_name,
          author: editingBook.book_author,
          language: editingBook.language || "",
          totalCopies: editingBook.total_copies,
          categoryId: editingBook.category?.category_id,
          isbn: editingBook.isbn || "", // 🚀 Hydrate value on edit click action trigger
        });
      } else {
        reset({
          title: "",
          author: "",
          language: "",
          totalCopies: 1,
          categoryId: "",
          isbn: "", // 🚀 Reset on creation profile layouts context
        });
      }
    }
  }, [editingBook, isOpen, reset]);

  const handleCloseModal = () => {
    setAiInsights(null);
    reset({
      title: "",
      author: "",
      language: "",
      totalCopies: 1,
      categoryId: "",
      isbn: "",
    });
    onClose();
  };

  const handleAIScanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (scanCounter >= 50) {
      toast.error("Testing guard triggered: 50 item scan limit reached.");
      return;
    }

    const formData = new FormData();
    formData.append("bookCover", file);

    try {
      setIsScanning(true);
      setAiInsights(null);
      toast.loading("Analyzing book layout structures...", { id: "azure-scan" });

      const response = await axiosClient.post("/ai/scan-cover", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 25000,
      });

      const payload = response.data;

      if (payload && payload.success) {
        if (payload.overview || payload.category) {
          setAiInsights({
            category: payload.category || "Non-Fiction",
            overview: payload.overview || "",
          });
        }

        setValue("title", payload.title || "");
        setValue("author", payload.author || "");
        setValue("language", payload.language || "");
        // 🚀 Populate ISBN value if the AI manages to detect it from barcode scans
        if (payload.isbn) setValue("isbn", payload.isbn || "");

        if (payload.category) {
          const matchedCat = categories.find(
            (c) => c.name.toLowerCase() === payload.category.toLowerCase(),
          );
          if (matchedCat) {
            setValue("categoryId", matchedCat.id);
          }
        }

        const nextCount = scanCounter + 1;
        setScanCounter(nextCount);
        localStorage.setItem("dev_scan_counter", nextCount.toString());

        toast.success("Cover parsed with classification filters!", { id: "azure-scan" });
      } else {
        toast.error("Parsing threshold matching failed.", { id: "azure-scan" });
      }
    } catch (error) {
      console.error(error);
      const isAxiosError = error && typeof error === "object" && "code" in error;
      const errorMsg =
        isAxiosError && (error as { code: string }).code === "ECONNABORTED"
          ? "Request timeout! AI process layer took too long."
          : "Error communicating with AI parser layer.";

      toast.error(errorMsg, { id: "azure-scan" });
    } finally {
      setIsScanning(false);
      e.target.value = "";
    }
  };

  const renderFormattedOverview = (text: string) => {
    if (!text) return null;

    const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const details: string[] = [];
    let summaryText = "";
    let insideSummary = false;

    lines.forEach((line) => {
      if (line.toLowerCase().startsWith("summary:")) {
        insideSummary = true;
        summaryText = line.replace(/^summary:\s*/i, "");
      } else if (insideSummary) {
        summaryText += " " + line;
      } else {
        details.push(line);
      }
    });

    return (
      <div className="space-y-3.5">
        <div className="space-y-2 border-b border-gray-100 pb-3">
          {details.map((detail, idx) => {
            const splitIdx = detail.indexOf(":");
            if (splitIdx !== -1) {
              const label = detail.substring(0, splitIdx).trim();
              const val = detail.substring(splitIdx + 1).trim();
              return (
                <div key={idx} className="flex items-start text-[13px] text-slate-700 font-semibold leading-tight">
                  <span className="text-slate-400 font-bold min-w-35 block">{label}:</span>
                  <span className="text-slate-800 font-medium flex-1">{val}</span>
                </div>
              );
            }
            return (
              <p key={idx} className="text-[13px] text-slate-600 font-medium">{detail}</p>
            );
          })}
        </div>

        {summaryText && (
          <div className="pt-1">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Abstract Summary
            </h5>
            <p className="text-xs text-[#4A5568] leading-relaxed font-semibold italic text-justify bg-slate-100 p-3 rounded-xl border border-slate-200/50">
              "{summaryText.trim()}"
            </p>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans select-none text-left animate-fade-in">
      <div className={`bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 flex flex-col md:flex-row max-h-[90vh] transition-all duration-300 ${aiInsights ? "w-full max-w-4xl" : "w-full max-w-xl"}`}>
        
        <div className="flex-1 overflow-y-auto flex flex-col">
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
            {!editingBook && (
              <div className="p-4 bg-gray-100 border border-dashed border-gray-200 rounded-xl space-y-2.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-[#2B6CB0] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={12} className="text-[#2B6CB0]" /> Intelligent OCR Engine
                  </label>
                  <span className="text-[10px] font-bold bg-gray-200 text-[#2B6CB0] px-2 py-0.5 rounded-md">
                    Scans: {scanCounter}/50
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAIScanUpload}
                  disabled={isScanning || scanCounter >= 50}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#2B6CB0] file:text-white hover:file:bg-[#1A365D] transition-all cursor-pointer"
                />
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-5">
                
                {/* 🚀 NEW: MANDATORY ISBN FIELD COMPONENT CONTAINER */}
                <div>
                  <label className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Hash size={11} className="text-slate-400" /> ISBN Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 978-3-16-148410-0"
                    {...register("isbn")}
                    className={`w-full px-4 py-2.5 bg-white border font-semibold text-sm rounded-xl placeholder:text-[#718096]/40 outline-none transition-all ${errors.isbn ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 text-rose-900" : "border-gray-200 text-[#1A365D] focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/10"}`}
                  />
                  {errors.isbn && (
                    <p className="text-xs text-rose-600 font-bold mt-1.5">{errors.isbn.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest mb-1">
                    Book Title
                  </label>
                  <input
                    type="text"
                    {...register("title")}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 font-semibold text-[#1A365D] text-sm rounded-xl placeholder:text-[#718096]/50 outline-none focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/10 transition-all"
                  />
                  {errors.title && (
                    <p className="text-xs text-rose-600 font-bold mt-1.5">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    {...register("author")}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 font-semibold text-[#1A365D] text-sm rounded-xl placeholder:text-[#718096]/50 outline-none focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/10 transition-all"
                  />
                  {errors.author && (
                    <p className="text-xs text-rose-600 font-bold mt-1.5">{errors.author.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest mb-1">
                    Language
                  </label>
                  <input
                    type="text"
                    {...register("language")}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 font-semibold text-[#1A365D] text-sm rounded-xl placeholder:text-[#718096]/50 outline-none focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/10 transition-all"
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
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 font-semibold text-[#2D3748] text-sm rounded-xl outline-none focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#718096] uppercase tracking-widest mb-1">
                      Category Classification
                    </label>
                    <div className="relative">
                      <select
                        {...register("categoryId")}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 font-semibold text-[#1A365D] text-sm rounded-xl outline-none cursor-pointer focus:border-[#2B6CB0] focus:ring-2 focus:ring-[#2B6CB0]/10 transition-all appearance-none"
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

        {!editingBook && aiInsights && (
          <div className="w-full md:w-96 bg-slate-50 border-t md:border-t-0 md:border-l border-gray-200 p-5 overflow-y-auto max-h-[45vh] md:max-h-full flex flex-col shrink-0">
            <h4 className="text-[11px] font-bold text-[#1A365D] uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Sparkles size={12} className="text-[#2B6CB0]" /> AI Scanner Insights
            </h4>

            <div className="space-y-4">
              <div className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs">
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#718096] uppercase tracking-wider mb-1">
                  <Layers size={12} className="text-[#2B6CB0]" /> Detected Category
                </div>
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-extrabold rounded-lg border border-emerald-200/60 mt-1 uppercase tracking-wide">
                  {aiInsights.category}
                </span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs flex-1">
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#718096] uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
                  <BookOpen size={12} className="text-[#2B6CB0]" /> About Book
                </div>
                {renderFormattedOverview(aiInsights.overview)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};