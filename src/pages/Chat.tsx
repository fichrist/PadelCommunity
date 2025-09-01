import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Search, MoreVertical, Circle } from "lucide-react";

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(0);
  const [message, setMessage] = useState("");

  const conversations = [
    {
      id: 1,
      name: "Sacred Circle",
      type: "group",
      lastMessage: "Luna: The meditation session was beautiful today 🙏",
      time: "2m ago",
      unread: 3,
      online: true,
      avatar: ""
    },
    {
      id: 2,
      name: "Elena Moonchild",
      type: "direct",
      lastMessage: "Thank you for sharing that healing technique!",
      time: "15m ago",
      unread: 1,
      online: true,
      avatar: ""
    },
    {
      id: 3,
      name: "Mindful Souls",
      type: "group",
      lastMessage: "David: Who's joining tomorrow's forest walk?",
      time: "1h ago",
      unread: 0,
      online: false,
      avatar: ""
    },
    {
      id: 4,
      name: "River Flow",
      type: "direct",
      lastMessage: "The energy healing session helped so much ✨",
      time: "3h ago",
      unread: 0,
      online: false,
      avatar: ""
    }
  ];

  const messages = [
    {
      id: 1,
      sender: "Elena Moonchild",
      content: "Good morning everyone! I wanted to share something beautiful that happened during my meditation this morning",
      time: "9:32 AM",
      isOwn: false,
      avatar: ""
    },
    {
      id: 2,
      sender: "You",
      content: "That sounds wonderful! I'd love to hear about it 🙏",
      time: "9:35 AM",
      isOwn: true,
      avatar: ""
    },
    {
      id: 3,
      sender: "Elena Moonchild",
      content: "I felt this incredible connection to the universal energy. It was like all the boundaries dissolved and I was one with everything around me. The feeling lasted for several minutes even after I opened my eyes.",
      time: "9:37 AM",
      isOwn: false,
      avatar: ""
    },
    {
      id: 4,
      sender: "Luna Sage",
      content: "That's such a beautiful experience, Elena! Those moments of unity consciousness are so precious. Thank you for sharing this with us ✨",
      time: "9:40 AM",
      isOwn: false,
      avatar: ""
    },
    {
      id: 5,
      sender: "You",
      content: "I've been working on reaching those states in my practice. Any tips for deepening the experience?",
      time: "9:42 AM",
      isOwn: true,
      avatar: ""
    }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-sage/10 via-celestial/10 to-lotus/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Spiritual Chat
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with your spiritual community through meaningful conversations
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="h-full border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search conversations..." className="pl-10 h-9" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {conversations.map((conv, index) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedChat(index)}
                      className={`p-4 cursor-pointer border-b border-border/30 hover:bg-muted/50 transition-colors ${
                        selectedChat === index ? 'bg-muted/70' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conv.avatar} />
                            <AvatarFallback className="bg-primary/10">
                              {conv.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          {conv.online && (
                            <Circle className="absolute -bottom-1 -right-1 h-3 w-3 text-green-500 fill-current" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">{conv.name}</p>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">{conv.time}</span>
                              {conv.unread > 0 && (
                                <Badge variant="default" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                                  {conv.unread}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-full border-border/50 flex flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b border-border/30 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={conversations[selectedChat]?.avatar} />
                      <AvatarFallback className="bg-primary/10">
                        {conversations[selectedChat]?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{conversations[selectedChat]?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {conversations[selectedChat]?.type === 'group' ? 'Group • 12 members' : 'Online now'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end space-x-2 max-w-[70%] ${msg.isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {!msg.isOwn && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={msg.avatar} />
                          <AvatarFallback className="bg-primary/10 text-xs">
                            {msg.sender.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`rounded-lg p-3 ${
                        msg.isOwn 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        {!msg.isOwn && (
                          <p className="text-xs font-medium mb-1 text-primary">{msg.sender}</p>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-border/30 p-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;