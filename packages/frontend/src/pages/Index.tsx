import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight } from "lucide-react";
import { supabase, getUserIdFromStorage } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);

  useEffect(() => {
    // Check if user is already logged in, redirect to community
    const checkAuth = () => {
      // Get user ID synchronously from localStorage (never hangs)
      const userId = getUserIdFromStorage();
      if (userId) {
        navigate('/upanddown');
      }
    };
    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        navigate('/upanddown');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && !privacyConsent) {
      toast.error("Je moet akkoord gaan met het privacybeleid om een account aan te maken.");
      return;
    }

    setLoading(true);

    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error("Authentication is not configured yet. Please connect your Supabase project first.");
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back! You're now signed in.");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { email } },
        });
        if (error) throw error;

        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }
        }

        toast.success("Verification email sent! Check your inbox to complete signup.");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error("Authentication is not configured yet. Please connect your Supabase project first.");
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="text-center max-w-md px-6">
        <h1 className="text-5xl font-bold mb-4 font-comfortaa bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Padel Community
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Join the community to discover matches, connect with players, and organize games
        </p>

        <div className="space-y-4">
          {/* Social Auth Buttons */}
          <Button
            variant="outline"
            className="w-full h-11"
            onClick={() => handleSocialAuth('google')}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="w-full h-11"
            onClick={() => handleSocialAuth('facebook')}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continue with Facebook
          </Button>

          <div className="flex items-center">
            <Separator className="flex-1" />
            <span className="px-2 text-sm text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="privacy-consent"
                  checked={privacyConsent}
                  onCheckedChange={(checked) => setPrivacyConsent(checked === true)}
                />
                <label
                  htmlFor="privacy-consent"
                  className="text-sm text-muted-foreground leading-tight cursor-pointer"
                >
                  Ik ga akkoord met het{" "}
                  <Link
                    to="/privacy"
                    className="text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    privacybeleid
                  </Link>{" "}
                  en geef toestemming voor het verwerken van mijn gegevens.
                </label>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || (!isLogin && !privacyConsent)}>
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>

          <div className="pt-2">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate('/community')}
              className="w-full flex items-center justify-center space-x-2 text-muted-foreground"
            >
              <span>Continue without signing in</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
