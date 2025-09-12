import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Search, MoreVertical, Circle, MessageCircle, Plus, Home, User, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import images
import spiritualLogo from "@/assets/spiritual-logo.png";
import elenaProfile from "@/assets/elena-profile.jpg";

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(0);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

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
      {/* Top Navigation Bar */}
      <div className="bg-background/80 backdrop-blur-sm border-b border-border/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 relative">
            {/* Left: Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <img src={spiritualLogo} alt="Spirit" className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-primary font-comfortaa">Spirit</span>
            </div>
            
            {/* Center: Navigation Icons */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-6">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="p-4 rounded-xl hover:bg-muted/70 transition-all hover:scale-110"
                  onClick={() => navigate('/')}
                >
                  <Users className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors" />
                </Button>
              </div>
              <div className="relative">
                <Button variant="ghost" size="lg" className="p-4 rounded-xl hover:bg-muted/70 transition-all hover:scale-110">
                  <Calendar className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors" />
                </Button>
              </div>
              <div className="relative">
                <Button variant="ghost" size="lg" className="p-4 rounded-xl hover:bg-muted/70 transition-all hover:scale-110">
                  <User className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors" />
                </Button>
              </div>
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="p-4 rounded-xl hover:bg-muted/70 relative transition-all hover:scale-110"
                >
                  <MessageCircle className="h-9 w-9 text-primary" />
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full"></div>
                </Button>
              </div>
            </div>
            
            {/* Right: Search Bar + Create Button + Profile */}
            <div className="flex items-center space-x-3">
              {/* Search Bar */}
              <div className="hidden md:flex items-center bg-muted rounded-full px-3 py-2 w-64">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-transparent border-none outline-none flex-1 text-sm placeholder:text-muted-foreground"
                />
              </div>
              <Button
                size="sm"
                className="rounded-full h-10 w-10 p-0"
              >
                <Plus className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                <AvatarImage src={elenaProfile} />
                <AvatarFallback className="text-sm">ME</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Section Title - Sticky */}
      <div className="bg-transparent sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6">
          <h1 className="text-2xl font-bold text-foreground font-comfortaa">Chat</h1>
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