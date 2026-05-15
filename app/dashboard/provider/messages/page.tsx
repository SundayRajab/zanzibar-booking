"use client";

import { useState } from "react";
import { useMessaging } from "@/app/lib/hooks/useMessaging";
import { 
  Search, 
  Send, 
  User, 
  MessageSquare, 
  Loader2,
  ChevronLeft,
  Briefcase
} from "lucide-react";

export default function ProviderMessagesPage() {
  const { conversations, messages, loading, sendMessage } = useMessaging();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const activeConv = conversations.find(c => c.id === selectedId);
  const { messages: activeMessages, sendMessage: sendActiveMessage } = useMessaging(selectedId || undefined);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedId) return;
    await sendActiveMessage(selectedId, newMessage);
    setNewMessage("");
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
      
      {/* Conversations List */}
      <aside className={`
        ${selectedId ? 'hidden md:flex' : 'flex'} 
        w-full md:w-80 border-r border-slate-100 dark:border-slate-800 flex-col
      `}>
        <div className="p-6">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <Briefcase className="text-blue-600" /> Inbox
          </h2>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              placeholder="Search customers..."
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
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 font-bold">
                {conv.title?.[0] || 'C'}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-sm truncate">{conv.title || 'Customer Chat'}</h4>
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
        flex-1 flex-col min-w-0
      `}>
        {selectedId ? (
          <>
            <header className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
               <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedId(null)} className="md:hidden p-2 -ml-2"><ChevronLeft /></button>
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                    {activeConv?.title?.[0] || 'C'}
                  </div>
                  <div>
                    <h3 className="font-black text-lg">{activeConv?.title || 'Customer Chat'}</h3>
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Inquiry Details</span>
                  </div>
               </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {activeMessages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.sender_id === activeMessages[0].sender_id ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`p-4 rounded-[2rem] shadow-sm max-w-md ${
                    msg.sender_id === activeMessages[0].sender_id 
                      ? 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-none' 
                      : 'bg-slate-900 dark:bg-white dark:text-slate-900 text-white border-slate-800 rounded-tr-none'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <span className="text-[9px] opacity-60 mt-2 block">{new Date(msg.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-6 border-t border-slate-100 dark:border-slate-800">
               <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-3xl p-2 flex items-end gap-2">
                  <textarea 
                    rows={1}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Reply to customer..."
                    className="flex-1 bg-transparent border-none outline-none py-3 px-4 text-sm resize-none"
                  />
                  <button type="submit" className="p-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl shadow-lg hover:scale-105 transition-transform">
                    <Send className="w-5 h-5" />
                  </button>
               </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-12">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-black mb-2">Customer Messages</h3>
            <p className="text-slate-500 max-w-xs">Select an inquiry to communicate with your guests.</p>
          </div>
        )}
      </main>
    </div>
  );
}
