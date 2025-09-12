import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Events from "./pages/Events";
import People from "./pages/People";
import Community from "./pages/Community";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import EventDetails from "./pages/EventDetails";
import HealerProfile from "./pages/HealerProfile";
import CreateEvent from "./pages/CreateEvent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Community />} />
          <Route path="/events" element={<Events />} />
          <Route path="/people" element={<People />} />
          <Route path="/event/:eventId" element={<EventDetails />} />
          <Route path="/healer/:healerId" element={<HealerProfile />} />
          <Route path="/home" element={<Index />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
