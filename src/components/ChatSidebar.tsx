import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send } from "lucide-react";
import { useState } from "react";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  avatar: string;
}

const ChatSidebar = () => {
  const [message, setMessage] = useState("");
  const [messages] = useState<Message[]>([
    {
      id: "1",
      sender: "Elena Moonchild",
      content: "Looking forward to the sound healing session tonight! 🌙",
      timestamp: "2 min ago",
      avatar: "/src/assets/elena-profile.jpg"
    },
    {
      id: "2", 
      sender: "David Lightwalker",
      content: "Just shared some sacred geometry insights in my latest post",
      timestamp: "5 min ago",
      avatar: "/src/assets/david-profile.jpg"
    },
    {
      id: "3",
      sender: "Aria Starseed", 
      content: "Crystal workshop was amazing! Thank you all for the beautiful energy ✨",
      timestamp: "10 min ago",
      avatar: "/src/assets/aria-profile.jpg"
    }
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle message sending logic here
      setMessage("");
    }
  };

  return (
    <Card className="h-full flex flex-col bg-card border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center space-x-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span>Community Chat</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-3 pb-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={msg.avatar} />
                  <AvatarFallback className="bg-primary/10 text-xs">
                    {msg.sender.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="text-xs font-medium text-foreground truncate">
                      {msg.sender}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {msg.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 text-sm"
            />
            <Button 
              size="sm" 
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="px-3"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatSidebar;