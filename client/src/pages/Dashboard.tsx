import { MetricsGrid } from "../features/dashboard/components/MetricsGrid";
import { OverdueTable } from "../features/dashboard/components/OverdueTable";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../api/axiosClient";

export const Dashboard = () => {
  // TanStack Query pipeline to harvest live server dataset asynchronously
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["dashboardMetrics"],
    queryFn: async () => {
      const res = await axiosClient.get("/dashboard/metrics");
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Key Metrics</h2>
        <MetricsGrid data={metrics?.summary} />
      </section>

      <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Overdue Books</h2>
        <OverdueTable records={metrics?.overdueBooks} />
      </section>
    </div>
  );
};