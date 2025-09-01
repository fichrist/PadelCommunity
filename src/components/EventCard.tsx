import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Users, Heart } from "lucide-react";

interface EventCardProps {
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: {
    name: string;
    avatar?: string;
  };
  attendees: number;
  category: string;
  image?: string;
}

const EventCard = ({ 
  title, 
  description, 
  date, 
  location, 
  organizer, 
  attendees, 
  category,
  image 
}: EventCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden">
      {image && (
        <div className="h-48 bg-gradient-to-br from-sage/20 to-celestial/20 overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className="mb-2 bg-sage/20 text-sage-foreground">
            {category}
          </Badge>
          <Button variant="ghost" size="sm" className="p-2 h-auto">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        <CardDescription className="line-clamp-2">
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
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={organizer.avatar} />
              <AvatarFallback className="text-xs bg-primary/10">
                {organizer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">by {organizer.name}</span>
          </div>
          
          <Button size="sm" variant="outline" className="text-xs">
            Join Event
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;