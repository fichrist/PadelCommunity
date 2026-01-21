import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SignupCard from "@/components/SignupCard";

const Index = () => {
  const navigate = useNavigate();
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);

  useEffect(() => {
    // Check if user is already logged in, redirect to community
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate('/community');
      }
    };
    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        navigate('/community');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center max-w-md px-6">
          <h1 className="text-5xl font-bold mb-4 font-comfortaa bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Padel Community
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Join the community to discover matches, connect with players, and organize games
          </p>

          <div className="space-y-4">
            <Button
              variant="default"
              size="lg"
              onClick={() => setSignInDialogOpen(true)}
              className="w-full flex items-center justify-center space-x-2"
            >
              <LogIn className="h-5 w-5" />
              <span>Sign In</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/community')}
              className="w-full flex items-center justify-center space-x-2"
            >
              <span>Continue without signing in</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <SignupCard open={signInDialogOpen} onOpenChange={setSignInDialogOpen} />
    </>
  );
};

export default Index;
