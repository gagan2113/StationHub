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
            <Route path="/" element={<Dashboard />} />
            <Route path="/pcr" element={<PCR />} />
            <Route path="/fir" element={<FIR />} />
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
