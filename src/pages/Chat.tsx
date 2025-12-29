import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, Search, MoreVertical, Circle, MessageCircle, Plus, Home, User, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import centralized data
import { chatUsers } from "@/data/users";
import { elenaProfile, davidProfile, ariaProfile, phoenixProfile } from "@/data/healers";

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(0);
  const [message, setMessage] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Use centralized chat users data
  const followingPeople = chatUsers;

  const filteredPeople = followingPeople.filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message
      setMessage("");
    }
  };

  const handleStartChat = (person: typeof followingPeople[0]) => {
    // Add logic to start new conversation
    setIsNewChatOpen(false);
    setSearchQuery("");
    // You could add the person to conversations list or navigate to their chat
  };

  return (
    <>
        {/* Chat Section Title - Sticky */}
        <div className="bg-transparent sticky top-[57px] z-40">
          <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
            <h1 className="text-2xl font-bold text-foreground font-comfortaa">Talk</h1>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-130px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <Card className="h-full bg-card/90 backdrop-blur-sm border border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Conversations</CardTitle>
                    <Button
                      size="sm"
                      className="rounded-full h-8 w-8 p-0"
                      onClick={() => setIsNewChatOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
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
              <Card className="h-full bg-card/90 backdrop-blur-sm border border-border flex flex-col">
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

        {/* New Chat Modal */}
        <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
          <DialogContent className="sm:max-w-md bg-card border border-border">
            <DialogHeader>
              <DialogTitle>Start New Conversation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search people you follow..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredPeople.map((person) => (
                  <div
                    key={person.id}
                    onClick={() => {
                      if (person.name.includes('Healer') || person.name === 'Elena Moonchild' || person.name === 'Aria Starseed' || person.name === 'Luna Sage' || person.name === 'River Flow') {
                        navigate(`/healer/${person.name.toLowerCase().replace(/\s+/g, '-')}`);
                      } else {
                        handleStartChat(person);
                      }
                    }}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={person.avatar} />
                        <AvatarFallback className="bg-primary/10">
                          {person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {person.online && (
                        <Circle className="absolute -bottom-1 -right-1 h-3 w-3 text-green-500 fill-current" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{person.name}</p>
                      <p className="text-xs text-muted-foreground">{person.username}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {person.online ? "Online" : "Offline"}
                    </Badge>
                  </div>
                ))}
                {filteredPeople.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    {searchQuery ? "No people found matching your search." : "You're not following anyone yet."}
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
    </>
  );
};

export default Chat;
