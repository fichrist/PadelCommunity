import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Repeat2, BookOpen, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

interface CommunityShareCardProps {
  title: string;
  thought: string;
  description: string;
  tags: string[];
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  youtubeUrl?: string;
  comments: number;
  isHorizontal?: boolean;
  index?: number;
  onOpenThoughts?: (share: any) => void;
  isReshared?: boolean;
  onToggleReshare?: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onShare?: () => void;
}

const CommunityShareCard = ({
  title,
  thought,
  description,
  tags,
  author,
  youtubeUrl,
  comments,
  isHorizontal = false,
  index = 0,
  onOpenThoughts,
  isReshared = false,
  onToggleReshare,
  isSaved = false,
  onToggleSave,
  onShare
}: CommunityShareCardProps) => {
  const navigate = useNavigate();
  const [sharePopoverOpen, setSharePopoverOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  return (
    <Card className={`bg-card/90 backdrop-blur-sm border border-border hover:shadow-lg transition-all duration-200 relative ${isHorizontal ? 'flex-shrink-0 w-[32rem]' : ''}`}>
      <CardContent className="p-0">
        {/* Share Title Header */}
        <div className="p-3 pb-2">
          <h2 className="text-lg font-bold text-foreground mb-1 leading-tight">
            {title}
          </h2>
        </div>

        {/* Content */}
        <div className="px-3">
          {/* Share content: description above tags */}
          <div className="mb-3">
            <p className="text-sm text-foreground/90 leading-relaxed mb-3">
              {thought}
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed mb-3">
              {description}
            </p>
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.map((tag, tagIndex) => (
                <Badge key={tagIndex} variant="secondary" className="text-xs cursor-pointer hover:bg-primary/20 transition-colors">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* YouTube Video for Shares */}
          {youtubeUrl && (
            <div className="mb-3">
              <div className="relative h-64 rounded-lg overflow-hidden bg-muted">
                <iframe
                  src={youtubeUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Author Info for Shares - Below video */}
          <div className="py-2 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar 
                  className="h-6 w-6 cursor-pointer"
                  onClick={() => navigate(`/healer/${author.name.toLowerCase().replace(/\s+/g, '-')}`)}
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
                      onClick={() => navigate(`/healer/${author.name.toLowerCase().replace(/\s+/g, '-')}`)}
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
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-3 py-2 border-t border-border">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => onOpenThoughts && onOpenThoughts({ title, comments })}
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
                      navigator.clipboard.writeText(`${window.location.origin}/share/${title.toLowerCase().replace(/\s+/g, '-')}`);
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

export default CommunityShareCard;