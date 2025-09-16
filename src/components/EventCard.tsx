import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Users, BookOpen, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ReviewModal from "@/components/ReviewModal";

interface EventCardProps {
  eventId: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizers: Array<{
    name: string;
    avatar?: string;
    id: string;
  }>;
  attendees: number;
  category: string;
  image?: string;
  isPastEvent?: boolean;
  averageRating?: number;
  totalReviews?: number;
  reviews?: Array<{
    id: string;
    author: { name: string; avatar?: string };
    rating: number;
    content: string;
    timeAgo: string;
  }>;
  isSaved?: boolean;
  onSaveToggle?: () => void;
  onJoinEvent?: () => void;
}

const EventCard = ({ 
  eventId,
  title, 
  description, 
  date, 
  location, 
  organizers, 
  attendees, 
  category,
  image,
  isPastEvent = false,
  averageRating = 0,
  totalReviews = 0,
  reviews = [],
  isSaved = false,
  onSaveToggle,
  onJoinEvent
}: EventCardProps) => {
  const navigate = useNavigate();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden cursor-pointer" onClick={() => navigate(`/event/${eventId}`)}>
      {image && (
        <div className="relative h-48 bg-gradient-to-br from-sage/20 to-celestial/20 overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg p-2">
            <div className="flex items-center space-x-1 text-white text-sm font-medium">
              <Calendar className="h-4 w-4" />
              <span>{date}</span>
            </div>
          </div>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className="mb-2 bg-sage/20 text-sage-foreground">
            {category}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`p-2 h-auto transition-colors ${
              isSaved ? 'text-primary font-bold' : 'text-muted-foreground hover:text-primary'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onSaveToggle?.();
            }}
          >
            <BookOpen className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        <CardDescription className="line-clamp-4">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>{attendees} attending</span>
          </div>
          
          {/* Reviews for past events */}
          {isPastEvent && averageRating > 0 && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(averageRating) 
                        ? "text-yellow-400 fill-current" 
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setReviewModalOpen(true);
                }}
                className="text-sm text-primary hover:underline"
              >
                ({totalReviews} reviews)
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col space-y-2 flex-1">
            <div className="text-xs text-muted-foreground">
              Organized by:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {organizers.map((organizer, index) => (
                <div 
                  key={organizer.id}
                  className="flex items-center space-x-1 cursor-pointer hover:text-primary transition-colors group" 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/healer/${organizer.id}`);
                  }}
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={organizer.avatar} />
                    <AvatarFallback className="text-xs bg-primary/10">
                      {organizer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                    {organizer.name}
                  </span>
                  {index < organizers.length - 1 && (
                    <span className="text-xs text-muted-foreground">•</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs ml-3"
            onClick={(e) => {
              e.stopPropagation();
              onJoinEvent?.();
            }}
          >
            Join Event
          </Button>
        </div>
      </CardContent>

      {/* Review Modal */}
      {isPastEvent && (
        <ReviewModal
          open={reviewModalOpen}
          onOpenChange={setReviewModalOpen}
          eventTitle={title}
          reviews={reviews}
          averageRating={averageRating}
          totalReviews={totalReviews}
        />
      )}
    </Card>
  );
};

export default EventCard;