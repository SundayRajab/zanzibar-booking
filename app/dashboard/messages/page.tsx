"use client";

import { useState, useEffect, Suspense } from "react";
import { useMessaging } from "@/app/lib/hooks/useMessaging";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  Send, 
  Phone, 
  Video, 
  Info, 
  MoreVertical,
  Paperclip,
  Smile,
  User,
  CheckCheck,
  MessageSquare,
  Plus,
  Loader2,
  ChevronLeft
} from "lucide-react";

function MessagesContent() {
  const { conversations, messages, loading, sendMessage, createSupportTicket, fetchConversations } = useMessaging();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);

  // Handle direct chat initiation from query params
  useEffect(() => {
    const bookingId = searchParams.get('booking_id');
    const title = searchParams.get('title');

    if (bookingId && title && conversations.length > 0 && !isInitializing) {
      // Check if conversation already exists
      const existing = conversations.find(c => c.booking_id === bookingId);
      if (existing) {
        setSelectedId(existing.id);
      } else {
        // Create new direct chat
        const initChat = async () => {
          setIsInitializing(true);
          try {
            const result = await createSupportTicket(title, "Direct inquiry regarding booking", bookingId);
            if (result) {
              await fetchConversations();
              setSelectedId(result.conv.id);
            }
          } catch (err) {
            console.error("Failed to init chat", err);
          } finally {
            setIsInitializing(false);
          }
        };
        initChat();
      }
    }
  }, [searchParams, conversations, isInitializing]);

  const activeConv = conversations.find(c => c.id === selectedId);
  const { messages: activeMessages, sendMessage: sendActiveMessage } = useMessaging(selectedId || undefined);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedId) return;
    await sendActiveMessage(selectedId, newMessage);
    setNewMessage("");
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createSupportTicket(ticketSubject, "Support request from dashboard");
      if (result) {
        setSelectedId(result.conv.id);
        setIsCreatingTicket(false);
        setTicketSubject("");
      }
    } catch (err) {
      alert("Failed to create ticket");
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
      
      {/* Conversations List */}
      <aside className={`
        ${selectedId ? 'hidden md:flex' : 'flex'} 
        w-full md:w-80 border-r border-slate-100 dark:border-slate-800 flex-col
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black">Messages</h2>
            <button 
              onClick={() => setIsCreatingTicket(true)}
              className="p-2 bg-blue-600 text-white rounded-xl hover:scale-110 transition-transform"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              placeholder="Search chats..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-2">
          {loading ? (
             <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : conversations.map((conv) => (
            <button 
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all ${
                selectedId === conv.id 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold">
                {conv.title?.[0] || 'S'}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-sm truncate">{conv.title || 'Support Chat'}</h4>
                  <span className="text-[10px] text-slate-400">{new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{conv.type.toUpperCase()}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat Window */}
      <main className={`
        ${selectedId ? 'flex' : 'hidden md:flex'} 
        flex-1 flex-col min-w-0 bg-slate-50/30 dark:bg-slate-800/5
      `}>
        {selectedId ? (
          <>
            <header className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
               <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedId(null)} className="md:hidden p-2 -ml-2"><ChevronLeft /></button>
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                    {activeConv?.title?.[0] || 'O'}
                  </div>
                  <div>
                    <h3 className="font-black text-lg">{activeConv?.title || 'Oceanora Support'}</h3>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Chat</span>
                  </div>
               </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {activeMessages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.sender_id === activeMessages[0].sender_id ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`p-4 rounded-[2rem] shadow-sm max-w-md ${
                    msg.sender_id === activeMessages[0].sender_id 
                      ? 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-tl-none' 
                      : 'bg-blue-600 text-white border-blue-500 rounded-tr-none'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <span className="text-[9px] opacity-60 mt-2 block">{new Date(msg.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
               <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-3xl p-2 flex items-end gap-2">
                  <textarea 
                    rows={1}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent border-none outline-none py-3 px-4 text-sm resize-none"
                  />
                  <button type="submit" className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg hover:scale-105 transition-transform">
                    <Send className="w-5 h-5" />
                  </button>
               </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-12">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-black mb-2">Your Conversations</h3>
            <p className="text-slate-500 max-w-xs">Select a chat to start messaging or create a new support ticket.</p>
          </div>
        )}
      </main>

      {/* New Chat Modal */}
      {isCreatingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-black mb-6">Start New Chat</h3>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <input 
                required
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Chat subject (e.g., Booking Inquiry)"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600"
              />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsCreatingTicket(false)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-600/20 hover:scale-105 transition-all">Start Chat</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserMessagesPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
