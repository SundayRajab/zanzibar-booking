"use client";

import { useState } from "react";
import { useMessaging } from "@/app/lib/hooks/useMessaging";
import { supabase } from "@/app/lib/supabase";
import { 
  Search, 
  Send, 
  Shield, 
  MessageSquare, 
  Loader2,
  ChevronLeft,
  Filter,
  Flag,
  User as UserIcon,
  CheckCircle2
} from "lucide-react";

export default function AdminMessagesPage() {
  const { conversations, loading, sendMessage } = useMessaging(undefined, true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const activeConv = conversations.find(c => c.id === selectedId);
  const { messages: activeMessages, sendMessage: sendAdminMessage } = useMessaging(selectedId || undefined, true);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedId) return;

    // Ensure Admin is a participant before sending (Self-correction)
    const { data: me } = await supabase.auth.getUser();
    if (me.user) {
      await supabase.from('conversation_participants').upsert({
        conversation_id: selectedId,
        user_id: me.user.id
      });
    }

    await sendAdminMessage(selectedId, newMessage);
    setNewMessage("");
  };

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-slate-950 p-4 lg:p-8 gap-8">
      
      {/* Admin Sidebar */}
      <aside className={`
        ${selectedId ? 'hidden lg:flex' : 'flex'} 
        w-full lg:w-96 flex-col gap-6
      `}>
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black flex items-center gap-3">
              <Shield className="text-rose-600" /> Inbox
            </h2>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
               <Filter className="w-5 h-5 text-slate-500" />
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              placeholder="Search conversations..."
              className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {loading ? (
             <div className="flex justify-center p-8"><Loader2 className="animate-spin text-rose-600" /></div>
          ) : conversations.map((conv) => (
            <button 
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={`w-full flex items-center gap-5 p-6 rounded-[2rem] transition-all border ${
                selectedId === conv.id 
                  ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800 shadow-lg' 
                  : 'bg-white dark:bg-slate-900 border-transparent hover:border-slate-200'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 font-bold">
                {conv.type === 'support' ? <Flag /> : <UserIcon />}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-base truncate">{conv.title || 'Support Case'}</h4>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">{conv.type}</span>
                   <span className="text-[10px] text-slate-400">{new Date(conv.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Admin Chat Area */}
      <main className={`
        ${selectedId ? 'flex' : 'hidden lg:flex'} 
        flex-1 flex-col min-w-0 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden
      `}>
        {selectedId ? (
          <>
            <header className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
               <div className="flex items-center gap-5">
                  <button onClick={() => setSelectedId(null)} className="lg:hidden p-2 -ml-2"><ChevronLeft /></button>
                  <div className="w-16 h-16 rounded-[1.5rem] bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/20">
                    <Shield className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-black text-2xl tracking-tight">{activeConv?.title || 'Support Case'}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Admin Control Active</span>
                    </div>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-sm hover:bg-emerald-100 transition-colors">
                     <CheckCircle2 className="w-4 h-4" /> Resolve Ticket
                  </button>
               </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/30 dark:bg-slate-800/10">
              {activeMessages.map((msg) => (
                <div key={msg.id} className={`flex gap-6 ${msg.sender_id === activeMessages[0].sender_id ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`p-6 rounded-[2.5rem] shadow-sm max-w-xl ${
                    msg.sender_id === activeMessages[0].sender_id 
                      ? 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-tl-none' 
                      : 'bg-rose-600 text-white border-rose-500 rounded-tr-none shadow-lg shadow-rose-600/10'
                  }`}>
                    <p className="text-sm leading-relaxed font-medium">{msg.content}</p>
                    <div className="flex items-center justify-between mt-3 opacity-60">
                       <span className="text-[10px] uppercase font-bold">{msg.sender_id === activeMessages[0].sender_id ? 'Customer' : 'Admin'}</span>
                       <span className="text-[10px]">{new Date(msg.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-10 border-t border-slate-100 dark:border-slate-800">
               <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] p-3 flex items-end gap-3 focus-within:border-rose-600/20 transition-all">
                  <textarea 
                    rows={2}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type official response..."
                    className="flex-1 bg-transparent border-none outline-none py-3 px-4 text-sm resize-none font-medium"
                  />
                  <button type="submit" className="px-8 py-4 bg-rose-600 text-white font-black rounded-2xl shadow-xl shadow-rose-600/20 hover:scale-105 active:scale-95 transition-all">
                    Send Response
                  </button>
               </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-20">
            <div className="w-32 h-32 bg-rose-50 dark:bg-rose-900/10 rounded-[3rem] flex items-center justify-center mb-10 ring-8 ring-rose-50/50">
              <Shield className="w-16 h-16 text-rose-600" />
            </div>
            <h3 className="text-4xl font-black mb-4 tracking-tight">System Message Center</h3>
            <p className="text-slate-500 max-w-md text-lg leading-relaxed">
              As an administrator, you can monitor all system-wide conversations and resolve support tickets.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
