import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../api/axiosClient";
import { useAuthStore } from "../store/authStore";
import { MetricsGrid } from "../features/dashboard/components/MetricsGrid";

// Workspace component layout widgets
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

  // Background analytical payload cache sync
  const { data: apiPayload, isLoading, isError } = useQuery({
    queryKey: ["advancedDashboardAnalytics", token],
    queryFn: async () => {
      const res = await axiosClient.get("/dashboard/summary");
      return res.data?.data || res.data;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minute guard
  });

  // High-Visibility Light State Loading Screen
  if (isLoading || !token) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-6 bg-white font-sans text-slate-800">
        <div className="relative">
          {/* Crisp slate structural spinner */}
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-slate-900 shadow-2xs" />
        </div>

        <p className="text-sm text-slate-800 font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 px-5 py-3 rounded-lg shadow-2xs">
          Booting Control Center Intelligence...
        </p>
      </div>
    );
  }

  // High-Visibility Error Alert Board
  if (isError) {
    return (
      <div className="p-10 bg-orange-50 border border-orange-200 rounded-2xl text-center max-w-2xl mx-auto my-16 shadow-xs font-sans">
        <h3 className="text-base font-bold text-orange-800 uppercase tracking-wide">
          Operational Sync Failure
        </h3>
        <p className="text-sm text-orange-700 font-medium mt-3 bg-white p-4 rounded-xl border border-orange-200/60 max-w-lg mx-auto">
          Unable to pull central analytical datasets from backend database registers. Please reload the dashboard engine view.
        </p>
      </div>
    );
  }

  // Data mapping pipelines
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
    /* Comfortable, light-weight archival grid background wrapper */
    <div className="space-y-8 p-2 animate-fade-in bg-transparent min-h-screen pb-16 font-sans text-slate-800 selection:bg-amber-200">
      
      {/* Level 1: Core System KPI Indicators */}
      <div className="relative transition-all duration-300">
        <MetricsGrid data={gridMetrics} />
      </div>

      {/* Level 2: Realtime Alerts (Critical Deficits, Dead Stocks, Analytics) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 *:bg-white *:border *:border-amber-100 *:rounded-2xl *:p-6 *:shadow-2xs *:transition-all *:duration-150 hover:*:border-slate-300">
        <CriticalDeficitWidget items={widgets.criticalDeficit || []} />
        <DeadStockWidget items={widgets.deadStock || []} />
        <RetentionAnalytics metrics={widgets.retentionMetrics} />
      </div>

      {/* Level 3: Financial Risks & Auditing Simulation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 *:bg-white *:border *:border-amber-100 *:rounded-2xl *:p-7 *:shadow-2xs *:transition-all *:duration-150 hover:*:border-slate-300">
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

      {/* Level 4: Traffic Indexes & Distribution Return Timelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 *:bg-white *:border *:border-amber-100 *:rounded-2xl *:p-7 *:shadow-2xs *:transition-all *:duration-150 hover:*:border-slate-300">
        <PeakHoursChart data={widgets.peakHours || []} />
        <ReturnForecaster forecast={widgets.returnForecast || []} />
      </div>

      {/* Level 5: Media Density Map & Reader Engagement Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 *:bg-white *:border *:border-amber-100 *:rounded-2xl *:p-6 *:shadow-2xs *:transition-all *:duration-150 hover:*:border-slate-300">
        <div className="lg:col-span-2 p-0! overflow-hidden">
          <CategoryTreeMap categories={widgets.categoryPopularity || []} />
        </div>
        <EngagementLeaderboard members={widgets.engagementLeaderboard || []} />
      </div>
    </div>
  );
};