import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import padelBackground from "@/assets/padel-background.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${padelBackground})` }}
      />
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-primary/10 rounded-full">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
          Connect, Share, and Grow
          <span className="block text-3xl md:text-5xl mt-2">
            Your Spiritual Journey
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-white mb-8 max-w-2xl mx-auto leading-relaxed">
          Discover meaningful spiritual events, connect with like-minded souls,
          and share wisdom in our peaceful community dedicated to inner growth and awakening.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="group transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Explore Events
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-primary/30 hover:bg-primary/5 transition-all duration-300"
          >
            Join Community
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;