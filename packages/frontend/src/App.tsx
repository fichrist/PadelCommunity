import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase, readSessionFromStorage } from "@/integrations/supabase/client";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import Community from "./pages/Community";
import People from "./pages/People";
import Chat from "./pages/Chat";
import CreateMatch from "./pages/CreateMatch";
import Profile from "./pages/Profile";
import NotificationSettings from "./pages/NotificationSettings";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import UpAndDown from "./pages/UpAndDown";
import CreateUpAndDownEvent from "./pages/CreateUpAndDownEvent";
import CookieConsent from "./components/CookieConsent";

const queryClient = new QueryClient();

const App = () => {
  // Auth event logging + session-invalid recovery.
  // Token refresh is handled entirely by client.ts (built-in autoRefresh +
  // 10-min keepalive timer + visibility handler with direct API fallback).
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log(`Auth: ${event}`);
    });

    // Diagnostic: log session state every 60s by reading directly from
    // localStorage (bypasses ALL Supabase client code, locks, etc.).
    const diagnosticInterval = setInterval(() => {
      const info = readSessionFromStorage();
      if (info) {
        console.log(`[Session Diagnostic] expiresIn=${info.expiresIn}s, hasAccessToken=${info.hasAccessToken}, hasRefreshToken=${info.hasRefreshToken}, user=${info.userId}`);
      } else {
        console.log('[Session Diagnostic] No session in localStorage');
      }
    }, 60000);

    // Handle supabase-session-invalid: last resort recovery, redirect to login if unrecoverable.
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
        }
      } catch (err) {
        console.error('App: Session recovery threw, redirecting to login', err);
        await supabase.auth.signOut().catch(() => {});
        window.location.href = '/';
      }
    };

    window.addEventListener('supabase-session-invalid', handleSessionInvalid);

    return () => {
      subscription.unsubscribe();
      clearInterval(diagnosticInterval);
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
            <Route path="/people" element={<AppLayout><People /></AppLayout>} />
            <Route path="/home" element={<Navigate to="/community" replace />} />
            <Route path="/chat" element={<AppLayout><Chat /></AppLayout>} />
            <Route path="/create-match" element={<AppLayout><CreateMatch /></AppLayout>} />
            <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
            <Route path="/notification-settings" element={<AppLayout><NotificationSettings /></AppLayout>} />
            <Route path="/settings" element={<Navigate to="/profile" replace />} />
            <Route path="/admin" element={<AppLayout><Admin /></AppLayout>} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/upanddown" element={<UpAndDown />} />
            <Route path="/create-upanddown-event" element={<CreateUpAndDownEvent />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
