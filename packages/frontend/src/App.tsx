import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import Events from "./pages/Events";
import People from "./pages/People";
import Community from "./pages/Community";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import EventDetails from "./pages/EventDetails";
import EditableEventDetails from "./pages/EditableEventDetails";
import HealerProfile from "./pages/HealerProfile";
import CreateEvent from "./pages/CreateEvent";
import CreatePost from "./pages/CreatePost";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import EditEvent from "./pages/EditEvent";
import EventHealerMode from "./pages/EventHealerMode";
import EventHealerModeEdit from "./pages/EventHealerModeEdit";
import EditHealerProfile from "./pages/EditHealerProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/community" element={<AppLayout><Community /></AppLayout>} />
          <Route path="/events" element={<AppLayout><Events /></AppLayout>} />
          <Route path="/people" element={<AppLayout><People /></AppLayout>} />
          <Route path="/event/:eventId" element={<AppLayout><EventDetails /></AppLayout>} />
          <Route path="/createevent" element={<AppLayout><CreateEvent /></AppLayout>} />
          <Route path="/editevent/:eventId" element={<AppLayout><EditEvent /></AppLayout>} />
          <Route path="/eventhealermode/:eventId" element={<AppLayout><EventHealerMode /></AppLayout>} />
          <Route path="/eventhealermodeedit/:eventId" element={<AppLayout><EventHealerModeEdit /></AppLayout>} />
          <Route path="/healer/:healerId" element={<AppLayout><HealerProfile /></AppLayout>} />
          <Route path="/home" element={<AppLayout><Index /></AppLayout>} />
          <Route path="/chat" element={<AppLayout><Chat /></AppLayout>} />
          <Route path="/profile/:userId?" element={<AppLayout><Profile /></AppLayout>} />
          <Route path="/create-event" element={<AppLayout><CreateEvent /></AppLayout>} />
          <Route path="/create-post" element={<AppLayout><CreatePost /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
          <Route path="/edit-healer-profile" element={<AppLayout><EditHealerProfile /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
