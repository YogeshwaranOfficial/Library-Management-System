import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../api/axiosClient";
import { useAuthStore } from "../store/authStore";
import { MetricsGrid } from "../features/dashboard/components/MetricsGrid";

// Workspace component layout widgets
import { PeakHoursChart } from "../features/dashboard/components/PeakHoursChart";
import { CriticalDeficitWidget } from "../features/dashboard/components/CriticalDeficitWidget";
import { FineVelocityGauge } from "../features/dashboard/components/FineVelocityGauge";
import { DeadStockWidget } from "../features/dashboard/components/DeadStockWidget";
import { OverdueCounter } from "../features/dashboard/components/OverdueTable";
import { CategoryTreeMap } from "../features/dashboard/components/CategoryTreeMap";
import { ReturnForecaster } from "../features/dashboard/components/ReturnForecaster";
import { EngagementLeaderboard } from "../features/dashboard/components/EngagementLeaderboard";
import { RetentionAnalytics } from "../features/dashboard/components/RetentionAnalytics";

export const Dashboard = () => {
  const token = useAuthStore((state) => state.token);

  // Background analytical payload cache sync
  const {
    data: apiPayload,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["advancedDashboardAnalytics", token],
    queryFn: async () => {
      const res = await axiosClient.get("/dashboard/summary");
      return res.data?.data || res.data;
    },
    enabled: !!token,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // High-Visibility Light State Loading Screen
  if (isLoading || !token) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-6 bg-[#F8FAFC] font-mono text-[#0F172A]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#E2E8F0] border-t-[#5E6AD2] shadow-2xs" />
        </div>
        <p className="text-sm text-[#0F172A] font-bold uppercase tracking-widest bg-[#FFFFFF] border border-[#E2E8F0] px-5 py-3 rounded-lg shadow-2xs">
          Booting Control Center Intelligence...
        </p>
      </div>
    );
  }

  // High-Visibility Error Alert Board
  if (isError) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-2xl text-center max-w-2xl mx-auto my-16 shadow-xs font-sans p-8">
        <h3 className="text-base font-bold text-orange-800 uppercase tracking-widest font-mono">
          Operational Sync Failure
        </h3>
        <p className="text-sm text-orange-700 font-medium mt-3 bg-[#FFFFFF] p-4 rounded-xl border border-[#E2E8F0] max-w-lg mx-auto">
          Unable to pull central analytical datasets from backend database
          registers. Please reload the dashboard engine view.
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
    <div className="space-y-8 animate-fade-in bg-[#F8FAFC] min-h-screen pb-16 font-sans text-[#0F172A] selection:bg-[#5E6AD2]/10">
      
      {/* Level 1: Core System KPI Indicators */}
      <div className="relative transition-all duration-300">
        <MetricsGrid data={gridMetrics} />
      </div>

      {/* UPGRADED CORE WORKSPACE */}
      <div className="space-y-10">

        {/* SECTION 1: CIRCULATION TRENDS & GRAPH ANALYSIS */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <h2 className="text-[11px] font-bold tracking-widest text-[#718096] uppercase">
              01. Circulation & Traffic Trends
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6
            *:bg-[#FFFFFF] *:border *:border-[#E2E8F0] *:rounded-xl *:p-6 *:shadow-sm *:h-95">
            <div>
              <PeakHoursChart data={widgets.peakHours || []} />
            </div>
            <div>
              <ReturnForecaster forecast={widgets.returnForecast || []} />
            </div>
          </div>
        </div>

        {/* SECTION 2: OPERATIONAL ANOMALIES & DEFICITS (THE PROBLEMS) */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <h2 className="text-[11px] font-bold tracking-widest text-[#718096] uppercase">
              02. Inventory Anomalies & Risks
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6
            *:bg-[#FFFFFF] *:border *:border-[#E2E8F0] *:rounded-xl *:p-6 *:shadow-sm *:h-95">
            
            {/* Procurement Alerts (Urgent Priority - Spans 5 Columns) */}
            <div className="lg:col-span-5">
              <CriticalDeficitWidget items={widgets.criticalDeficit || []} />
            </div>

            {/* Relocation Dead Stock (Spans 4 Columns) */}
            <div className="lg:col-span-4">
              <DeadStockWidget items={widgets.deadStock || []} />
            </div>

            {/* Retention Analytics Matrix (Spans 3 Columns) */}
            <div className="lg:col-span-3 bg-slate-50/40">
              <RetentionAnalytics metrics={widgets.retentionMetrics} />
            </div>
          </div>
        </div>

        {/* SECTION 3: FINANCIAL VELOCITY & OVERDUE ESCALATION CORES */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <h2 className="text-[11px] font-bold tracking-widest text-[#718096] uppercase">
              03. Financial Clearing Registers & Overdue Logs
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6
            *:bg-[#FFFFFF] *:border *:border-[#E2E8F0] *:rounded-xl *:p-6 *:shadow-sm *:h-95">
            
            {/* Fine Recovery Output Gauge (Spans 4 Columns) */}
            <div className="lg:col-span-4">
              <FineVelocityGauge
                collected={widgets.fineVelocity?.collected || 0}
                outstanding={gridMetrics.totalOutstandingFines}
              />
            </div>

            {/* Overdue Table Log Panel (Replaced Amnesty - Spans 8 Columns) */}
            <div className="lg:col-span-8 overflow-hidden">
              <OverdueCounter records={apiPayload.overdueBooks || []} />
            </div>
          </div>
        </div>

        {/* SECTION 4: INVENTORY DISTRIBUTION & USER ENGAGEMENT LOGS */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <h2 className="text-[11px] font-bold tracking-widest text-[#718096] uppercase">
              04. Media Density & Member Engagement
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6
            *:bg-[#FFFFFF] *:border *:border-[#E2E8F0] *:rounded-xl *:shadow-sm *:h-95">
            
            {/* Category Tree Map (Spans 8 Columns) */}
            <div className="lg:col-span-8 overflow-hidden">
              <CategoryTreeMap categories={widgets.categoryPopularity || []} />
            </div>

            {/* Reader Engagement Activity Logs (Spans 4 Columns) */}
            <div className="lg:col-span-4 p-6">
              <EngagementLeaderboard members={widgets.engagementLeaderboard || []} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};