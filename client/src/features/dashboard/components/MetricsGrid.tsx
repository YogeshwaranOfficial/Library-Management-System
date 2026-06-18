import { useState, useEffect, useCallback } from "react";
import type { DashboardSummaryMetrics } from "../../../types/dashboard";

// Editorial Visual Assets
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MetricsBannerProps {
  data: DashboardSummaryMetrics | undefined;
}

export const MetricsGrid = ({ data }: MetricsBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Interactive mini-states for the editorial layout filters
  const [activeToggleA, setActiveToggleA] = useState<boolean>(true);
  const [activeToggleB, setActiveToggleB] = useState<boolean>(false);

  // Configuration for 5 distinct operational contextual slides match image layout
  const slides = [
    {
      title: "DATA INSIGHT / CATALOG INDEX",
      metricName: "Total Books Registered",
      value: data?.totalBooks || 0,
      tagline:
        "Our digital ecosystem accurately tracks regular platform interactions, digital checkouts, and resource access metrics.",
      toggleALabel: "System Verified Registry",
      toggleBLabel: "Active In-Shelf Volumes",
    },
    {
      title: "DATA INSIGHT / CIRCULATION LIVE",
      metricName: "Available Inventory Copies",
      value: data?.availableBooks || 0,
      tagline:
        "Live catalog verification streams cross-referencing systemic checkout requests against immediate structural volumes.",
      toggleALabel: "Verified Reservable",
      toggleBLabel: "Immediate Process Sync",
    },
    {
      title: "DATA INSIGHT / MEMBER ANALYTICS",
      metricName: "Active Members Base",
      value: data?.activeMembers || 0,
      tagline:
        "Our digital ecosystem accurately tracks regular platform interactions, digital checkouts, and resource access metrics.",
      toggleALabel: "System Verified Accounts",
      toggleBLabel: "Active Checkout Activity",
    },
    {
      title: "DATA INSIGHT / EXCEPTION METRICS",
      metricName: "Books Overdue Queue",
      value: data?.overdueCount || 0,
      tagline:
        "Algorithmic validation parameters capturing active operational return anomalies and immediate account penalty logs.",
      toggleALabel: "Overdue Lock Triggered",
      toggleBLabel: "Fines Pending Post",
    },
    {
      title: "DATA INSIGHT / FINANCIAL LEDGER",
      metricName: `₹${data?.totalOutstandingFines || 0}`,
      value: "Outstanding Receivables", // Flips layout visually for fine currencies
      tagline:
        "Aggregated financial risk pipeline processing unreturned materials under strict administrative fee accumulation protocols.",
      toggleALabel: "Audit Pipeline Clear",
      toggleBLabel: "Accruing Base Logs",
    },
  ];

  // Dynamic image fetching array to feed cleaner high-contrast backdrops
  const bgImages = [
    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1600&auto=format&fit=crop",
  ];

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  useEffect(() => {
    const autoSlideTimer = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(autoSlideTimer);
  }, [handleNext]);

  const currentSlide = slides[currentIndex];

  return (
    <div className="w-full relative overflow-hidden bg-slate-950 border border-slate-900 font-sans aspect-16/7 min-h-105 sm:min-h-115 md:min-h-screen">
      {/* Background Image Engine */}
      {bgImages.map((url, idx) => (
        <div
          key={url}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out scale-[1.02] ${
            idx === currentIndex
              ? "opacity-100 z-10 scale-100"
              : "opacity-0 z-0"
          }`}
          style={{
            backgroundImage: `url('${url}')`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
          }}
        />
      ))}

      {/* Cinematic Vignette Overlay Matching image_95b3a6.jpg */}
      <div className="absolute inset-0 bg-linear-to-b from-slate-950/40 via-slate-950/80 to-slate-950 z-15" />

      {/* Main Structural Content Layer */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 sm:p-12 md:p-16 max-w-4xl mx-auto space-y-6 select-none">
        {/* Category Label Section */}
        <p className="text-[10px] sm:text-xs font-black tracking-[0.25em] uppercase text-slate-300 drop-shadow-md ">
          {currentSlide.title}
        </p>

        {/* Hero Scale Numbers Metric Block */}
        <div className="flex flex-col items-center space-y-0.5">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-white tracking-tighter drop-shadow-lg leading-none">
            {currentIndex === 4 ? currentSlide.metricName : currentSlide.value}
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            {currentIndex === 4 ? currentSlide.value : currentSlide.metricName}
          </h2>
        </div>

        {/* Descriptive Body Copy Block */}
        <p className="text-xs sm:text-sm text-slate-300/90 font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-sm">
          {currentSlide.tagline}
        </p>

        {/* Modern Interactive Dashboard Filtering Toggles Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          {/* Toggle Choice A */}
          <button
            onClick={() => setActiveToggleA(!activeToggleA)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold  transition-all duration-200 cursor-pointer ${
              activeToggleA
                ? "bg-slate-100 text-slate-950 border-white shadow-xs"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${activeToggleA ? "bg-emerald-500" : "bg-slate-500"}`}
            />
            {currentSlide.toggleALabel}
          </button>

          {/* Toggle Choice B */}
          <button
            onClick={() => setActiveToggleB(!activeToggleB)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold  transition-all duration-200 cursor-pointer ${
              activeToggleB
                ? "bg-slate-100 text-slate-950 border-white shadow-xs"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${activeToggleB ? "bg-emerald-500" : "bg-slate-500"}`}
            />
            {currentSlide.toggleBLabel}
          </button>
        </div>
      </div>

      {/* Navigation Controls System */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handlePrev();
        }}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-transparent text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-30 shadow-xl cursor-pointer"
        aria-label="Previous Metric"
      >
        <ChevronLeft size={20} className="stroke-3" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-transparent text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-30 shadow-xl cursor-pointer"
        aria-label="Next Metric"
      >
        <ChevronRight size={20} className="stroke-3" />
      </button>

      {/* Clean Linear Dot Progress Matrix */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
              index === currentIndex
                ? "w-7 bg-white"
                : "w-1.5 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Jump to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
