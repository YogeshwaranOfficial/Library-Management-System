import { useState, useEffect, useCallback } from "react";
import type { DashboardSummaryMetrics } from "../../../types/dashboard";

// Editorial Visual Assets
import { 
  BookOpen, 
  BookCheck, 
  Users, 
  AlertTriangle, 
  Coins, 
  ChevronLeft, 
  ChevronRight,
  Info
} from "lucide-react";

interface MetricsBannerProps {
  data: DashboardSummaryMetrics | undefined;
}

export const MetricsGrid = ({ data }: MetricsBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Configuration for 5 distinct operational contextual slides
  const slides = [
    {
      title: "Global Catalog Registry",
      metricName: "Total Books",
      value: data?.totalBooks || 0,
      subtext: `Total architectural copies managed: ${data?.totalCopies || 0}`,
      icon: <BookOpen className="w-5 h-5 text-amber-400" />,
      // Local or fallback high-resolution cinematic background relative paths
      bgUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1600&auto=format&fit=crop",
      tagline: "Comprehensive volume control across distributed library collections.",
    },
    {
      title: "Live Circulation Inventory",
      metricName: "Available Books",
      value: data?.availableBooks || 0,
      subtext: "Ready for immediate member acquisition and processing",
      icon: <BookCheck className="w-5 h-5 text-emerald-400" />,
      bgUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1600&auto=format&fit=crop",
      tagline: "Real-time verification indices matching current shelf states.",
    },
    {
      title: "Active Core Patron Base",
      metricName: "Active Members",
      value: data?.activeMembers || 0,
      subtext: "System accounts showing valid active interaction indicators",
      icon: <Users className="w-5 h-5 text-blue-400" />,
      bgUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1600&auto=format&fit=crop",
      tagline: "Tracking regular platform use and digital resource checkouts.",
    },
    {
      title: "Circulation Critical Exceptions",
      metricName: "Books Overdue",
      value: data?.overdueCount || 0,
      subtext: `Current return latency calculation ratio: ${data?.overduePercentage || 0}%`,
      icon: <AlertTriangle className="w-5 h-5 text-rose-500" />,
      bgUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1600&auto=format&fit=crop",
      tagline: "Requires prompt systemic notifications and penalty assignment protocols.",
    },
    {
      title: "Audit Financial Liability Pipeline",
      metricName: "Outstanding Fines",
      value: `₹${data?.totalOutstandingFines || 0}`,
      subtext: "Fixed structural accrual baseline: ₹10/day per item",
      icon: <Coins className="w-5 h-5 text-amber-500" />,
      bgUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1600&auto=format&fit=crop",
      tagline: "Aggregated outstanding system accounts receivable ledger metrics.",
    },
  ];

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  // Synchronous 5-second automatic rotational interval heartbeat execution loops
  useEffect(() => {
    const autoSlideTimer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(autoSlideTimer);
  }, [handleNext]);

  return (
    <div className="w-full relative overflow-hidden shadow-xl bg-slate-950 border border-slate-800 font-sans group aspect-16/7 min-h-75 sm:min-h-90 md:min-h-100">
      
      {/* Structural Banner Dynamic Background Image Layout Layers */}
      {slides.map((slide, index) => (
        <div
          key={slide.metricName}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          style={{
            backgroundImage: `url('${slide.bgUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
          }}
        >
          {/* Netflix-Style Double Gradient Vignette Mask Engine */}
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/40 to-transparent" />
          
          {/* Content Overlays Area */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-12 z-20 text-left max-w-2xl space-y-3 sm:space-y-4">
            
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-white/10 backdrop-blur-md border border-white/20">
                {slide.icon}
              </span>
              <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-slate-300 drop-shadow-xs font-mono">
                {slide.title}
              </span>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-sm">
                {slide.value}
              </h1>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-wide">
                {slide.metricName}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-xl drop-shadow-2xs">
              {slide.tagline}
            </p>

            {slide.subtext && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[11px] sm:text-xs font-semibold text-slate-200">
                <Info size={12} className="text-slate-300 shrink-0" />
                {slide.subtext}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Symmetric Left Control Slider Override Button */}
      <button
        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/40 backdrop-blur-xs border border-white/10 text-white hover:bg-white hover:text-slate-950 transition-all opacity-0 group-hover:opacity-100 z-30 shadow-lg cursor-pointer"
        aria-label="Previous Metric View"
      >
        <ChevronLeft size={24} className="stroke-[2.5]" />
      </button>

      {/* Symmetric Right Control Slider Override Button */}
      <button
        onClick={(e) => { e.stopPropagation(); handleNext(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/40 backdrop-blur-xs border border-white/10 text-white hover:bg-white hover:text-slate-950 transition-all opacity-0 group-hover:opacity-100 z-30 shadow-lg cursor-pointer"
        aria-label="Next Metric View"
      >
        <ChevronRight size={24} className="stroke-[2.5]" />
      </button>

      {/* Discrete Bottom Linear Micro Progress Navigation Nodes Indicators */}
      <div className="absolute bottom-4 right-6 sm:right-12 flex gap-1.5 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
              index === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Navigate explicitly to slide panel index ${index + 1}`}
          />
        ))}
      </div>

    </div>
  );
};