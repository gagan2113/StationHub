import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/store/PoliceStore";
import Dashboard from "./pages/Dashboard";
import PCR from "./pages/PCR";
import FIR from "./pages/FIR";
import EFIR from "./pages/EFIR";
import Accused from "./pages/Accused";
import Property from "./pages/Property";
import Diary from "./pages/Diary";
import Reports from "./pages/Reports";
import Communications from "./pages/Communications";
import SentimentAnalysis from "./pages/SentimentAnalysis";
import CrimeHotspots from "./pages/CrimeHotspots";
import PatrolPlanning from "./pages/PatrolPlanning";
import RepeatPatterns from "./pages/RepeatPatterns";
import DailyReport from "./pages/DailyReport";
import RecoveredItems from "./pages/RecoveredItems";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            {/* Primary NCIA routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/communications" element={<Communications />} />
            <Route path="/sentiment" element={<SentimentAnalysis />} />
            <Route path="/hotspots" element={<CrimeHotspots />} />
            <Route path="/patterns" element={<RepeatPatterns />} />
            <Route path="/patrol" element={<PatrolPlanning />} />
            <Route path="/daily-report" element={<DailyReport />} />
            <Route path="/recovered" element={<RecoveredItems />} />
            <Route path="/settings" element={<Settings />} />
            {/* Existing legacy routes */}
            <Route path="/fir" element={<FIR />} />
            <Route path="/pcr" element={<PCR />} />
            <Route path="/efir" element={<EFIR />} />
            <Route path="/accused" element={<Accused />} />
            <Route path="/property" element={<Property />} />
            <Route path="/diary" element={<Diary />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
