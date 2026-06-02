import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AppRoutes } from "./routes/AppRoutes";
import "./App.css";

// 1. Initialize the Enterprise Asset Caching Query Engine Instance
const coreQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Fail fast on network dropouts during local development testing
      refetchOnWindowFocus: false, // Prevents aggressive flashing while testing side-by-side
    },
  },
});

export default function App() {
  return (
    // 2. Provision secure data context pipelines down the component tree
    <QueryClientProvider client={coreQueryClient}>
      
      {/* 3. Inject our primary system layout state mapping router */}
      <AppRoutes />
      
      {/* 4. Global pop-up overlay notifications center layer */}
      <Toaster position="top-right" richColors closeButton />
      
    </QueryClientProvider>
  );
}