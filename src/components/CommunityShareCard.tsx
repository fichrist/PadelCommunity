import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

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
}

const CommunityShareCard = ({
  title,
  thought,
  description,
  tags,
  author,
  youtubeUrl,
  comments,
  isHorizontal = false
}: CommunityShareCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className={`bg-card/90 backdrop-blur-sm border border-border hover:shadow-lg transition-all duration-200 relative ${isHorizontal ? 'flex-shrink-0 w-96' : ''}`}>
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
      </CardContent>
    </Card>
  );
};

export default CommunityShareCard;