import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SignupCard from "@/components/SignupCard";
import { Sparkles } from "lucide-react";
import spiritualBackground from "@/assets/spiritual-background.jpg";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Login - Current session:", session);
      if (session) {
        // Redirect to community if already logged in
        console.log("Login - Redirecting to /community");
        navigate('/community', { replace: true });
      }
    };

    checkUser();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Login - Auth state changed:", event, "Session:", session);
      if (session) {
        // Redirect to community when user logs in
        console.log("Login - Redirecting to /community after sign in");
        navigate('/community', { replace: true });
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
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${spiritualBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Logo and Welcome Message */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Sparkles className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-comfortaa">
            Spirit
          </h1>
        </div>
        <h2 className="text-3xl font-semibold text-white mb-2">
          Welcome to Our Sacred Space
        </h2>
        <p className="text-lg text-white/90 max-w-2xl mx-auto">
          Connect with healers, join transformative events, and grow together in a community dedicated to spiritual awakening
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
