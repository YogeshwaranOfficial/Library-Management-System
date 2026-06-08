import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookFormSchema, type BookFormValues } from "../schemas/bookSchema";
import type { BookCategory, BookInventoryItem } from "../../../types/books";
import { axiosClient } from "../../../api/axiosClient";
import { toast } from "sonner";

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

export const BookModal = ({ isOpen, onClose, onSubmit, categories, editingBook }: BookModalProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [ocrAlternatives, setOcrAlternatives] = useState<ScoredLine[]>([]);
  
  const [scanCounter, setScanCounter] = useState<number>(() => {
    const saved = localStorage.getItem("dev_scan_counter");
    return saved ? parseInt(saved, 10) : 0;
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<BookFormValues>({
    resolver: zodResolver(BookFormSchema),
    defaultValues: { title: "", author: "", totalCopies: 1, categoryId: "" }
  });

  // ✅ FIXED: Simple synchronization cycle without cascading state updates
  useEffect(() => {
    if (editingBook) {
      reset({
        title: editingBook.title,
        author: editingBook.author,
        totalCopies: editingBook.totalCopies,
        categoryId: editingBook.categoryId
      });
    } else {
      reset({ title: "", author: "", totalCopies: 1, categoryId: "" });
    }
  }, [editingBook, reset]);

  // ✅ FIXED: Safely cleans state artifacts within action contexts outside of reactive render loops
  const handleCloseModal = () => {
    setOcrAlternatives([]); 
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
      toast.loading("Analyzing book layout structures...", { id: "azure-scan" });

      const response = await axiosClient.post("/ai/scan-cover", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 25000 
      });

      const payload = response.data;
      
      if (payload && payload.success) {
        if (payload.alternativeLines && Array.isArray(payload.alternativeLines)) {
          setOcrAlternatives(payload.alternativeLines);
        }

        // ✅ AUTOFILL EXECUTION: Hydrates form controllers with pristine Gemini data properties directly
        setValue("title", payload.title || "");
        setValue("author", payload.author || "");

        const nextCount = scanCounter + 1;
        setScanCounter(nextCount);
        localStorage.setItem("dev_scan_counter", nextCount.toString());
        
        toast.success("Cover parsed with classification filters!", { id: "azure-scan" });
      } else {
        toast.error("Parsing threshold matching failed.", { id: "azure-scan" });
      }
    // ✅ FIXED: Eliminated explicit 'any' to appease strict lint configurations via type predicates
    } catch (error) { 
      console.error(error);
      
      const isAxiosError = error && typeof error === "object" && "code" in error;
      const errorMsg = (isAxiosError && (error as { code: string }).code === "ECONNABORTED")
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row max-h-[90vh] transition-all duration-300 ${ocrAlternatives.length > 0 ? "w-full max-w-4xl" : "w-full max-w-md"}`}>
        
        {/* LEFT COMPONENT: Primary Form Input Layout */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <h3 className="font-bold text-lg text-gray-800">{editingBook ? "Modify Details" : "Add New Book"}</h3>
            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">✕</button>
          </div>

          {!editingBook && (
            <div className="p-4 bg-teal-50/40 border border-dashed border-teal-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-teal-800 uppercase tracking-wide">🔮 Intelligent OCR Engine</label>
                <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">Scans: {scanCounter}/10</span>
              </div>
              <input 
                type="file" accept="image/*" onChange={handleAIScanUpload} disabled={isScanning || scanCounter >= 10}
                className="block w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer"
              />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">Book Title</label>
              <input type="text" {...register("title")} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand outline-none" />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">Author Name</label>
              <input type="text" {...register("author")} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-brand outline-none" />
              {errors.author && <p className="text-xs text-red-500 mt-1">{errors.author.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Copies</label>
                <input type="number" {...register("totalCopies", { valueAsNumber: true })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Category</label>
                <select {...register("categoryId")} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
              <button type="submit" disabled={isScanning} className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-all shadow-md rounded-xl disabled:bg-gray-300">
                {editingBook ? "Update Details" : "Create Book Entry"}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COMPONENT: Interactive Diagnostic Mapping Helper Column */}
        {!editingBook && ocrAlternatives.length > 0 && (
          <div className="w-full md:w-80 bg-slate-50 border-t md:border-t-0 md:border-l border-gray-200 p-5 overflow-y-auto max-h-[40vh] md:max-h-full flex flex-col">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">🔮 OCR Raw Layout Fragments</h4>
            <p className="text-[11px] text-slate-400 mb-4 leading-normal">If the AI missed a specific structural block, click a tag location element to force-overwrite values:</p>
            
            <div className="space-y-3 flex-1">
              {ocrAlternatives.map((item, idx) => {
                const colorClasses = "border-slate-200 bg-white text-slate-800";

                return (
                  <div key={idx} className={`p-3 rounded-xl border text-xs leading-snug shadow-3xs transition-all hover:translate-x-0.5 ${colorClasses}`}>
                    <div className="font-semibold font-sans tracking-tight">{item.translatedText}</div>
                    {item.originalText !== item.translatedText && (
                      <div className="text-[10px] opacity-60 italic mt-1">Original OCR: "{item.originalText}"</div>
                    )}
                    
                    <div className="mt-2.5 flex gap-1.5 pt-2 border-t border-slate-100">
                      <button type="button" onClick={() => setValue("title", item.translatedText)} className="px-2 py-0.5 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 rounded text-[9px] font-bold uppercase tracking-tight shadow-3xs border border-gray-200 transition-colors cursor-pointer">+ Title</button>
                      <button type="button" onClick={() => setValue("author", item.translatedText)} className="px-2 py-0.5 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 rounded text-[9px] font-bold uppercase tracking-tight shadow-3xs border border-gray-200 transition-colors cursor-pointer">+ Author</button>
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