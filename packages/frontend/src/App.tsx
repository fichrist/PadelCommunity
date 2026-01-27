import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import Community from "./pages/Community";
import Events from "./pages/Events";
import People from "./pages/People";
import Chat from "./pages/Chat";
import EventDetails from "./pages/EventDetails";
import EditableEventDetails from "./pages/EditableEventDetails";
import CreateEvent from "./pages/CreateEvent";
import CreatePost from "./pages/CreatePost";
import CreateMatch from "./pages/CreateMatch";
import Profile from "./pages/Profile";
import NotificationSettings from "./pages/NotificationSettings";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import EditEvent from "./pages/EditEvent";
import Privacy from "./pages/Privacy";
import CookieConsent from "./components/CookieConsent";

const queryClient = new QueryClient();

const App = () => {
  // Set up auth state change listener to handle session refresh
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event);

      if (event === 'TOKEN_REFRESHED') {
        console.log('✅ Token refreshed successfully');
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/community" element={<AppLayout><Community /></AppLayout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/events" element={<AppLayout><Events /></AppLayout>} />
            <Route path="/people" element={<AppLayout><People /></AppLayout>} />
            <Route path="/event/:eventId" element={<AppLayout><EventDetails /></AppLayout>} />
            <Route path="/createevent" element={<AppLayout><CreateEvent /></AppLayout>} />
            <Route path="/editevent/:eventId" element={<AppLayout><EditEvent /></AppLayout>} />
            <Route path="/home" element={<Navigate to="/community" replace />} />
            <Route path="/chat" element={<AppLayout><Chat /></AppLayout>} />
            <Route path="/create-event" element={<AppLayout><CreateEvent /></AppLayout>} />
            <Route path="/create-post" element={<AppLayout><CreatePost /></AppLayout>} />
            <Route path="/create-match" element={<AppLayout><CreateMatch /></AppLayout>} />
            <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
            <Route path="/notification-settings" element={<AppLayout><NotificationSettings /></AppLayout>} />
            <Route path="/settings" element={<Navigate to="/profile" replace />} />
            <Route path="/admin" element={<AppLayout><Admin /></AppLayout>} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
