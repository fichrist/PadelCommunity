import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Heart, MessageCircle, ArrowRight, Sparkles } from "lucide-react";

const Index = () => {
  const featuredEvents = [
    {
      title: "Morning Meditation Circle",
      description: "Start your day with peaceful meditation in our beautiful garden sanctuary.",
      date: "Tomorrow, 7:00 AM",
      location: "Zen Garden Center", 
      organizer: { name: "Sarah Chen", avatar: "" },
      attendees: 12,
      category: "Meditation"
    },
    {
      title: "Full Moon Healing Ceremony",
      description: "Join us for a transformative healing circle under the full moon's energy.",
      date: "This Friday, 8:00 PM",
      location: "Sacred Grove",
      organizer: { name: "Marcus Rivera", avatar: "" },
      attendees: 28,
      category: "Ceremony"
    },
    {
      title: "Yoga & Sound Bath",
      description: "Gentle yoga flow followed by immersive crystal singing bowl meditation.",
      date: "Saturday, 10:00 AM", 
      location: "Harmony Studio",
      organizer: { name: "Luna Wise", avatar: "" },
      attendees: 15,
      category: "Yoga"
    }
  ];

  const features = [
    {
      icon: Calendar,
      title: "Discover Events",
      description: "Find spiritual gatherings, workshops, and ceremonies in your area"
    },
    {
      icon: Users,
      title: "Connect with Souls",
      description: "Build meaningful relationships with like-minded spiritual seekers"
    },
    {
      icon: MessageCircle,
      title: "Sacred Conversations",
      description: "Engage in deep, meaningful discussions about your spiritual journey"
    },
    {
      icon: Heart,
      title: "Share Wisdom",
      description: "Contribute your insights and learn from others' experiences"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      
      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-sage/5">
        <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Nurture Your Spiritual Journey
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to connect, learn, and grow in your spiritual practice
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300 border-border/50">
                <CardHeader>
                  <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20">
        <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Featured Events
              </h2>
              <p className="text-lg text-muted-foreground">
                Upcoming spiritual gatherings you won't want to miss
              </p>
            </div>
            <Button variant="outline" className="hidden sm:flex">
              View All Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredEvents.map((event, index) => (
              <EventCard key={index} {...event} />
            ))}
          </div>
          
          <div className="text-center sm:hidden">
            <Button variant="outline">
              View All Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-20 bg-gradient-to-r from-sage/10 via-celestial/10 to-lotus/10">
        <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-primary/10 rounded-full">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Growing Spiritual Community
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of souls on their journey of awakening and transformation
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">2,847</div>
              <div className="text-muted-foreground">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">156</div>
              <div className="text-muted-foreground">Weekly Events</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1,234</div>
              <div className="text-muted-foreground">Conversations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">89</div>
              <div className="text-muted-foreground">Cities Connected</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with your spiritual community today and discover events, wisdom, and connections that will transform your life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="group">
              Join SpiritualHub Today
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg">
              Explore as Guest
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
