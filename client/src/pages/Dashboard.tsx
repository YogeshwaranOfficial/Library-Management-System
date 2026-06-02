import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../api/axiosClient";
import { MetricsGrid } from "../features/dashboard/components/MetricsGrid";
import { OverdueTable } from "../features/dashboard/components/OverdueTable";
import type { DashboardApiResponse } from "../types/dashboard";

export const Dashboard = () => {
  // Declarative query controller management pipeline
  const { data, isLoading, isError } = useQuery<DashboardApiResponse>({
    queryKey: ["dashboardAnalyticsDataset"],
    queryFn: async () => {
      const response = await axiosClient.get("/dashboard/metrics");
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Data remains fresh for 5 minutes before background updates trigger
    refetchOnWindowFocus: true, // Automatically updates the data grid whenever you focus back on the tab
  });

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center flex-col gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-teal-brand border-t-transparent" />
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest animate-pulse">
          Syncing Server Assets Ledger...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center max-w-xl mx-auto my-12">
        <span className="text-3xl">⚠️</span>
        <h3 className="text-base font-bold text-red-800 mt-2">API Connection Interrupted</h3>
        <p className="text-xs text-red-600 mt-1">
          The system was unable to pull current library analytics. Verify your local database connectivity status or check server engine logs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Structural Block 1: Real-time Metric Indicators */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">System Operational Indices</h2>
          <p className="text-xs text-gray-500">Real-time status tracking for book inventory and memberships.</p>
        </div>
        <MetricsGrid data={data?.summary} />
      </section>

      {/* Structural Block 2: Overdue Ledger List View */}
      <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Critical Overdue Registry Log</h2>
          <p className="text-xs text-gray-500">Active monitoring registry for overdue student returns and penalty generation rules.</p>
        </div>
        <OverdueTable records={data?.overdueBooks} />
      </section>
    </div>
  );
};