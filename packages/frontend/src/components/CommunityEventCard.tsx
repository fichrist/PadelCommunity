import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Star, MessageCircle, Repeat2, BookOpen, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

interface CommunityEventCardProps {
  eventId: string;
  title: string;
  thought: string;
  image: string;
  dateRange: {
    start: string;
    end?: string;
  };
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    isHealer?: boolean;
  };
  location: string;
  attendees: number;
  tags: string[];
  connectionsGoing?: string[];
  isPastEvent?: boolean;
  averageRating?: number;
  totalReviews?: number;
  comments: number;
  isHorizontal?: boolean;
  index?: number;
  onOpenThoughts?: (event: any) => void;
  isReshared?: boolean;
  onToggleReshare?: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onShare?: () => void;
}

const CommunityEventCard = ({
  eventId,
  title,
  thought,
  image,
  dateRange,
  author,
  location,
  attendees,
  tags,
  connectionsGoing = [],
  isPastEvent = false,
  averageRating,
  totalReviews,
  comments,
  isHorizontal = false,
  index = 0,
  onOpenThoughts,
  isReshared = false,
  onToggleReshare,
  isSaved = false,
  onToggleSave,
  onShare
}: CommunityEventCardProps) => {
  const navigate = useNavigate();
  const [connectionPopoverOpen, setConnectionPopoverOpen] = useState(false);
  const [sharePopoverOpen, setSharePopoverOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  return (
    <Card className={`bg-card/90 backdrop-blur-sm border border-border hover:shadow-lg transition-all duration-200 relative ${isHorizontal ? 'flex-shrink-0 w-[32rem]' : ''}`}>
      <CardContent className="p-0">
        {/* Event Image Header */}
        <div className="p-4">
          <div className="flex space-x-3">
            {/* Event Image - 4:3 Aspect Ratio - Clickable */}
            <div 
              className="w-48 h-36 flex-shrink-0 cursor-pointer"
              onClick={() => navigate(`/event/${eventId}`)}
            >
              <img 
                src={image} 
                alt={title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            
            {/* Event Details */}
            <div className="flex-1 min-w-0">
              <h2 
                className="text-lg font-bold text-foreground mb-2 leading-tight cursor-pointer hover:text-primary transition-colors"
                onClick={() => navigate(`/event/${eventId}`)}
              >
                {title}
              </h2>
              
              <div className="space-y-1 text-sm">
                <div className="mb-2">
                  <span className="text-2xl font-bold text-primary">
                    {dateRange?.end ? 
                      `${dateRange.start} - ${dateRange.end}` : 
                      dateRange?.start
                    }
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Avatar 
                    className="h-6 w-6 cursor-pointer"
                    onClick={() => {
                      const targetRoute = author.isHealer ? `/healer/${author.id}` : `/profile/${author.id}`;
                      navigate(targetRoute);
                    }}
                  >
                    <AvatarImage src={author.avatar} />
                    <AvatarFallback className="bg-primary/10 text-xs">
                      {author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span 
                        className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                        onClick={() => {
                          const targetRoute = author.isHealer ? `/healer/${author.id}` : `/profile/${author.id}`;
                          navigate(targetRoute);
                        }}
                      >
                        {author.name}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary font-medium hover:bg-transparent">
                        Follow
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {author.role}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-3">
          {/* Tags first for events */}
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.map((tag, tagIndex) => (
              <Badge key={tagIndex} variant="secondary" className="text-xs cursor-pointer hover:bg-primary/20 transition-colors">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Event content */}
          <p className="text-sm text-foreground/90 leading-relaxed mb-3">
            {thought}
          </p>

          {/* Event Details */}
          <div className="mb-3">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{attendees} attending</span>
              </div>
              {connectionsGoing && connectionsGoing.length > 0 && (
                <div className="flex items-center space-x-1">
                  {connectionsGoing.length <= 2 ? (
                    <span className="text-primary font-medium">
                      {connectionsGoing.join(", ")} going
                    </span>
                  ) : (
                    <Popover open={connectionPopoverOpen} onOpenChange={setConnectionPopoverOpen}>
                      <PopoverTrigger asChild>
                        <button className="text-primary font-medium hover:underline cursor-pointer">
                          {connectionsGoing.length} connections going
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Connections Attending</h4>
                          {connectionsGoing.map((connection: string, idx: number) => (
                            <div key={idx} className="flex items-center space-x-2 p-1 rounded hover:bg-muted cursor-pointer">
                              <Avatar 
                                className="h-6 w-6 cursor-pointer"
                                onClick={() => navigate(`/healer/${connection.toLowerCase().replace(/\s+/g, '-')}`)}
                              >
                                <AvatarFallback className="text-xs">
                                  {connection.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{connection}</span>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              )}
            </div>
            {/* Reviews for past events */}
            {isPastEvent && averageRating && (
              <div className="flex items-center space-x-2 mt-2">
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
                <button className="text-sm text-primary hover:underline">
                  ({totalReviews} reviews)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-3 py-2 border-t border-border">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => onOpenThoughts && onOpenThoughts({ eventId, title, comments })}
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{comments} Thoughts</span>
            </button>
            <button 
              className={`flex items-center space-x-2 text-sm transition-colors ${
                isReshared 
                  ? 'text-primary font-bold' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
              onClick={onToggleReshare}
            >
              <Repeat2 className="h-4 w-4" />
              <span>{isReshared ? 'Reshared' : 'Reshare'}</span>
            </button>
            
            <button 
              className={`flex items-center space-x-2 text-sm transition-colors ${
                isSaved 
                  ? 'text-primary font-bold' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
              onClick={onToggleSave}
            >
              <BookOpen className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
              <span>Save</span>
            </button>
            
            <Popover open={sharePopoverOpen} onOpenChange={setSharePopoverOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <div className="space-y-2">
                  <button 
                    className="flex items-center space-x-2 w-full p-2 text-sm rounded-md hover:bg-muted transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/event/${eventId}`);
                      setLinkCopied(true);
                      toast.success("Link copied to clipboard!");
                      setTimeout(() => setLinkCopied(false), 2000);
                      setSharePopoverOpen(false);
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    <span>{linkCopied ? "Copied!" : "Copy Link"}</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityEventCard;
