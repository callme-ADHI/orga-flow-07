import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";
import { useMyGroups, useOrgData } from "@/hooks/useOrgData";
import { MessageCircle, Send, Users, User, Plus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Chat = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const {
    conversations,
    messages,
    activeConversation,
    setActiveConversation,
    loading,
    sendingMessage,
    sendMessage,
    createDirectConversation,
    getOrCreateGroupConversation,
    canSendMessage,
    getAvailableContacts,
  } = useChat();
  
  const { groups: myGroups } = useMyGroups();
  const { groups: allGroups } = useOrgData();
  const [messageInput, setMessageInput] = useState("");
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [chatType, setChatType] = useState<"direct" | "group">("direct");
  const [selectedContact, setSelectedContact] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [contacts, setContacts] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get available groups based on role
  const availableGroups = profile?.role === "Employee" ? myGroups : allGroups;

  useEffect(() => {
    const loadContacts = async () => {
      const contactsList = await getAvailableContacts();
      setContacts(contactsList);
    };
    loadContacts();
  }, [getAvailableContacts]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !canSendMessage()) return;

    const success = await sendMessage(messageInput.trim());
    if (success) {
      setMessageInput("");
    } else {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleStartNewChat = async () => {
    if (chatType === "direct" && selectedContact) {
      const convId = await createDirectConversation(selectedContact);
      if (convId) {
        const conv = conversations.find(c => c.id === convId);
        if (conv) setActiveConversation(conv);
      }
    } else if (chatType === "group" && selectedGroup) {
      const convId = await getOrCreateGroupConversation(selectedGroup);
      if (convId) {
        const conv = conversations.find(c => c.id === convId);
        if (conv) setActiveConversation(conv);
      }
    }
    setNewChatDialogOpen(false);
    setSelectedContact("");
    setSelectedGroup("");
  };

  const getConversationTitle = (conv: typeof conversations[0]) => {
    if (conv.type === "group") {
      return conv.group_name || "Group Chat";
    }
    return conv.participant_name || "Direct Message";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
              Chat
            </h1>
            <p className="text-muted-foreground">Communicate with your team</p>
          </div>
          <Dialog open={newChatDialogOpen} onOpenChange={setNewChatDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Chat</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Chat Type</label>
                  <Select value={chatType} onValueChange={(v) => setChatType(v as "direct" | "group")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct Message</SelectItem>
                      <SelectItem value="group">Group Chat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {chatType === "direct" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Contact</label>
                    {contacts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {profile?.role === "Employee" 
                          ? "No managers available to chat with"
                          : "No contacts available"
                        }
                      </p>
                    ) : (
                      <Select value={selectedContact} onValueChange={setSelectedContact}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a contact" />
                        </SelectTrigger>
                        <SelectContent>
                          {contacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.name} ({contact.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Group</label>
                    {availableGroups.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {profile?.role === "Employee"
                          ? "You are not part of any groups"
                          : "No groups available"
                        }
                      </p>
                    ) : (
                      <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a group" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableGroups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.group_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                <Button 
                  onClick={handleStartNewChat}
                  disabled={(chatType === "direct" && !selectedContact) || (chatType === "group" && !selectedGroup)}
                  className="w-full"
                >
                  Start Chat
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100%-80px)]">
          {/* Conversations List */}
          <Card className={`bg-gradient-card border-border/50 overflow-hidden ${activeConversation ? "hidden md:block" : ""}`}>
            <div className="p-4 border-b border-border/50">
              <h2 className="font-semibold">Conversations</h2>
            </div>
            <ScrollArea className="h-[calc(100%-60px)]">
              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No conversations yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Start a new chat to begin</p>
                </div>
              ) : (
                <div className="p-2">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConversation(conv)}
                      className={`w-full p-3 rounded-lg text-left transition-colors mb-1 ${
                        activeConversation?.id === conv.id
                          ? "bg-primary/20"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {conv.type === "group" ? (
                            <Users className="w-5 h-5 text-primary" />
                          ) : (
                            <User className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {getConversationTitle(conv)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {conv.type === "group" ? "Group" : conv.participant_role}
                            </Badge>
                          </div>
                          {conv.last_message && (
                            <p className="text-sm text-muted-foreground truncate">
                              {conv.last_message}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className={`bg-gradient-card border-border/50 md:col-span-2 flex flex-col overflow-hidden ${!activeConversation ? "hidden md:flex" : ""}`}>
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border/50 flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setActiveConversation(null)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {activeConversation.type === "group" ? (
                      <Users className="w-5 h-5 text-primary" />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{getConversationTitle(activeConversation)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeConversation.type === "group" ? "Group Chat" : activeConversation.participant_role}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isOwn = msg.sender_id === profile?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(msg.sender_name || "U")}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`max-w-[70%] ${isOwn ? "items-end" : ""}`}>
                            {!isOwn && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{msg.sender_name}</span>
                                <Badge variant="outline" className="text-xs">{msg.sender_role}</Badge>
                              </div>
                            )}
                            <div
                              className={`rounded-lg p-3 ${
                                isOwn
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-border/50">
                  {canSendMessage() ? (
                    <div className="flex gap-2">
                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        disabled={sendingMessage}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || sendingMessage}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground">
                      You can only receive messages from the CEO
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">
                    Choose a conversation from the list or start a new one
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
