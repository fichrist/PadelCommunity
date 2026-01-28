import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, getUserIdFromStorage } from "@/integrations/supabase/client";
import SignupCard from "@/components/SignupCard";
import { Trophy } from "lucide-react";
import padelBackground from "@/assets/padel-background.jpg";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = () => {
      // Get user ID synchronously from localStorage (never hangs)
      const userId = getUserIdFromStorage();
      console.log("Login - Current user:", userId?.substring(0, 8) || null);
      if (userId) {
        // Redirect to events if already logged in
        console.log("Login - Redirecting to /events");
        navigate('/events', { replace: true });
      }
    };

    checkUser();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Login - Auth state changed:", event, "Session:", session);
      if (session) {
        // Redirect to events when user logs in
        console.log("Login - Redirecting to /events after sign in");
        navigate('/events', { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-12"
      style={{
        backgroundImage: `url(${padelBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Logo and Welcome Message */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Trophy className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-comfortaa">
            Padel Community
          </h1>
        </div>
        <h2 className="text-3xl font-semibold text-white mb-2">
          Find Your Perfect Match
        </h2>
        <p className="text-lg text-white/90 max-w-2xl mx-auto">
          Connect with padel players, join matches based on your location, time, and skill level
        </p>
      </div>

      {/* Signup/Login Card */}
      <SignupCard />

      {/* Footer */}
      <div className="mt-8 text-center text-white/70 text-sm">
        <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
      </div>
    </div>
  );
};

export default Login;
