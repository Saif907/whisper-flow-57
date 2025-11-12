import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Trades from "./pages/Trades";
import Auth from "./pages/Auth";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import Overview from "./pages/internal/Overview";
import Users from "./pages/internal/Users";
import Sessions from "./pages/internal/Sessions";
import Analytics from "./pages/internal/Analytics";
import Billing from "./pages/internal/Billing";
import SystemMetrics from "./pages/internal/SystemMetrics";
import Configuration from "./pages/internal/Configuration";
import Logs from "./pages/internal/Logs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/chat" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trades" element={<Trades />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/privacy" element={<Privacy />} />
          
          {/* Internal Console Routes */}
          <Route path="/internal-console" element={<Overview />} />
          <Route path="/internal-console/users" element={<Users />} />
          <Route path="/internal-console/sessions" element={<Sessions />} />
          <Route path="/internal-console/analytics" element={<Analytics />} />
          <Route path="/internal-console/billing" element={<Billing />} />
          <Route path="/internal-console/system" element={<SystemMetrics />} />
          <Route path="/internal-console/config" element={<Configuration />} />
          <Route path="/internal-console/logs" element={<Logs />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
