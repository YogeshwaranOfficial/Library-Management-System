import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../api/axiosClient";
import { useAuthStore } from "../store/authStore";
import { MetricsGrid } from "../features/dashboard/components/MetricsGrid";

// Import your 9 brand new workspace widgets
import { PeakHoursChart } from "../features/dashboard/components/PeakHoursChart";
import { CriticalDeficitWidget } from "../features/dashboard/components/CriticalDeficitWidget";
import { FineVelocityGauge } from "../features/dashboard/components/FineVelocityGauge";
import { DeadStockWidget } from "../features/dashboard/components/DeadStockWidget";
import { AmnestySimulator } from "../features/dashboard/components/AmnestySimulator";
import { CategoryTreeMap } from "../features/dashboard/components/CategoryTreeMap";
import { ReturnForecaster } from "../features/dashboard/components/ReturnForecaster";
import { EngagementLeaderboard } from "../features/dashboard/components/EngagementLeaderboard";
import { RetentionAnalytics } from "../features/dashboard/components/RetentionAnalytics";

export const Dashboard = () => {
  const token = useAuthStore((state) => state.token);
  const [amnestyDiscount, setAmnestyDiscount] = useState(20);

  // Consolidated Query fetching everything elegantly from a single background payload route
  const { data: apiPayload, isLoading, isError } = useQuery({
    queryKey: ["advancedDashboardAnalytics", token],
    queryFn: async () => {
      const res = await axiosClient.get("/dashboard/summary");
      return res.data?.data || res.data;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minute cache layer guard
  });

  if (isLoading || !token) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-3 bg-gray-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent" />
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest animate-pulse">
          Booting Control Center Intelligence...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center max-w-xl mx-auto my-12">
        <h3 className="text-base font-bold text-red-800">Operational Sync Failure</h3>
        <p className="text-xs text-red-600 mt-1">Unable to pull central analytical datasets from backend records.</p>
      </div>
    );
  }

  // Fallback structures to keep components green during data initialization maps
  const summary = apiPayload?.summary || {};
  const widgets = apiPayload?.widgets || {};

  const gridMetrics = {
    totalBooks: summary.totalBooks ?? 0,
    totalCopies: summary.totalCopies ?? 0,
    availableBooks: summary.availableBooks ?? 0,
    activeMembers: summary.activeMembers ?? 0,
    overdueCount: summary.overdueCount ?? 0,
    overduePercentage: summary.overduePercentage ?? 0,
    totalOutstandingFines: summary.totalOutstandingFines ?? 0,
  };

  return (
    <div className="space-y-6 p-1 animate-fade-in bg-gray-50/30 pb-12">
      {/* Level 1: Core System KPI Indicators */}
      <MetricsGrid data={gridMetrics} />

      {/* Level 2: Realtime High-Impact Operational Alerts (Work Reduction Layout Block) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CriticalDeficitWidget items={widgets.criticalDeficit || []} />
        <DeadStockWidget items={widgets.deadStock || []} />
        <RetentionAnalytics metrics={widgets.retentionMetrics} />
      </div>

      {/* Level 3: Financial Risk & Simulations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FineVelocityGauge 
          collected={widgets.fineVelocity?.collected || 0} 
          outstanding={gridMetrics.totalOutstandingFines} 
        />
        <AmnestySimulator 
          totalOutstanding={gridMetrics.totalOutstandingFines} 
          discount={amnestyDiscount} 
          onChange={setAmnestyDiscount} 
        />
      </div>

      {/* Level 4: Traffic & Return Predictions (Advanced Visual Forecasting charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PeakHoursChart data={widgets.peakHours || []} />
        <ReturnForecaster forecast={widgets.returnForecast || []} />
      </div>

      {/* Level 5: Distribution Map & Engagement Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CategoryTreeMap categories={widgets.categoryPopularity || []} />
        </div>
        <EngagementLeaderboard members={widgets.engagementLeaderboard || []} />
      </div>
    </div>
  );
};