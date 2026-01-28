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
  // Set up auth state change listener, visibility-based refresh, and
  // periodic keepalive. The keepalive ensures the session stays valid
  // even when the tab is visible but idle for a long time (25+ min).
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Auth: token refreshed');
        // Notify pages so they can re-fetch data with the fresh token.
        window.dispatchEvent(new Event('supabase-session-restored'));
      } else if (event === 'SIGNED_OUT') {
        console.log('Auth: signed out');
      }
    });

    // When the tab becomes visible after being hidden, force an immediate
    // refresh so the token is valid before any page fetches data.
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        supabase.auth.startAutoRefresh();
        const { error } = await supabase.auth.refreshSession();
        if (!error) {
          window.dispatchEvent(new Event('supabase-session-restored'));
        }
      } else {
        supabase.auth.stopAutoRefresh();
      }
    };

    // Periodic keepalive: every 4 minutes, validate the session and
    // refresh the token if it is within 5 minutes of expiry. This acts
    // as a safety net when the tab stays visible but the built-in
    // autoRefreshToken timer silently stalls.
    const keepaliveInterval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const expiresAt = session.expires_at; // unix seconds
        if (!expiresAt) return;

        const secondsLeft = expiresAt - Math.floor(Date.now() / 1000);
        if (secondsLeft < 300) {
          console.log(`Auth keepalive: token expires in ${secondsLeft}s, refreshing`);
          await supabase.auth.refreshSession();
          // TOKEN_REFRESHED event will dispatch supabase-session-restored
        }
      } catch (err) {
        console.warn('Auth keepalive: check failed', err);
      }
    }, 4 * 60 * 1000);

    // Handle supabase-session-invalid: try to recover, redirect to login if unrecoverable.
    const handleSessionInvalid = async () => {
      console.warn('App: Session invalid event received, attempting recovery...');
      try {
        const { data: { session }, error } = await supabase.auth.refreshSession();
        if (error || !session) {
          console.error('App: Session recovery failed, redirecting to login', error);
          await supabase.auth.signOut();
          window.location.href = '/';
        } else {
          console.log('App: Session recovered successfully');
          window.dispatchEvent(new Event('supabase-session-restored'));
        }
      } catch (err) {
        console.error('App: Session recovery threw, redirecting to login', err);
        await supabase.auth.signOut().catch(() => {});
        window.location.href = '/';
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('supabase-session-invalid', handleSessionInvalid);

    return () => {
      subscription.unsubscribe();
      clearInterval(keepaliveInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('supabase-session-invalid', handleSessionInvalid);
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
