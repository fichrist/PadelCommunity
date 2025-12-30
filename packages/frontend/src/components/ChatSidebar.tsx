import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { elenaProfile, davidProfile, ariaProfile } from "@/data/healers";

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatar: string;
  isGroup: boolean;
}

const ChatSidebar = () => {
  const [conversations] = useState<Conversation[]>([
    {
      id: "1",
      name: "Elena Moonchild",
      lastMessage: "Looking forward to the sound healing session tonight! 🌙",
      timestamp: "2 min ago",
      avatar: elenaProfile,
      isGroup: false
    },
    {
      id: "2", 
      name: "Sacred Geometry Group",
      lastMessage: "David: Just shared some sacred geometry insights",
      timestamp: "5 min ago",
      avatar: davidProfile,
      isGroup: true
    },
    {
      id: "3",
      name: "Aria Starseed", 
      lastMessage: "Crystal workshop was amazing! Thank you all ✨",
      timestamp: "10 min ago",
      avatar: ariaProfile,
      isGroup: false
    }
  ]);

  return (
    <Card className="h-full flex flex-col bg-card border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center space-x-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span>Talk</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2 pb-4">
            {conversations.map((conv) => (
              <div key={conv.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={conv.avatar} />
                  <AvatarFallback className="bg-primary/10 text-xs">
                    {conv.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground truncate">
                      {conv.name} {conv.isGroup && '👥'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {conv.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {conv.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ChatSidebar;
