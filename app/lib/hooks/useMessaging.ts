"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/AuthContext";

export type Conversation = {
  id: string;
  title: string;
  type: 'support' | 'booking' | 'direct';
  booking_id?: string;
  updated_at: string;
  last_message?: string;
  unread_count?: number;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: string;
  created_at: string;
  sender_role?: string;
};

export function useMessaging(conversationId?: string, isAdmin: boolean = false) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchConversations();

    const channel = supabase
      .channel('unified_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        if (conversationId && payload.new.conversation_id === conversationId) {
          setMessages(prev => [...prev, payload.new as Message]);
        }
        fetchConversations(); // Update lists/unread counts
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, conversationId]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
      markAsRead(conversationId);
    }
  }, [conversationId]);

  async function fetchConversations() {
    if (!user) return;
    
    let query;
    if (isAdmin) {
      // Admins see all
      query = supabase.from('conversations').select('*').order('updated_at', { ascending: false });
    } else {
      // Users see their own
      query = supabase
        .from('conversation_participants')
        .select(`
          conversation:conversation_id (
            id, title, type, booking_id, updated_at
          )
        `)
        .eq('user_id', user.id)
        .order('conversation(updated_at)', { ascending: false });
    }

    const { data, error } = await query;

    if (data) {
      setConversations(isAdmin ? data : data.map((p: any) => p.conversation));
    }
    setLoading(false);
  }

  async function fetchMessages(convId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  }

  async function sendMessage(convId: string, content: string) {
    if (!user) return;
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: convId,
        sender_id: user.id,
        content
      });
    return error;
  }

  async function markAsRead(convId: string) {
    if (!user) return;
    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', convId)
      .eq('user_id', user.id);
  }

  async function createSupportTicket(subject: string, description: string, bookingId?: string) {
    if (!user) return;

    // 1. Create Conversation
    const { data: conv, error: convErr } = await supabase
      .from('conversations')
      .insert({ 
        title: subject, 
        type: bookingId ? 'booking' : 'support',
        created_by: user.id,
        booking_id: bookingId 
      })
      .select()
      .single();

    if (convErr) throw convErr;

    // 2. Add User as Participant
    await supabase
      .from('conversation_participants')
      .insert({ conversation_id: conv.id, user_id: user.id });

    // 3. Create Ticket (Only if it's a general support request)
    if (!bookingId) {
      await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          conversation_id: conv.id,
          subject,
          description
        });
    }

    return { conv };
  }

  async function getUnreadCount() {
    if (!user) return 0;
    
    // This is a simple implementation. In a large app, you'd use a dedicated column or edge function.
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', user.id);

    if (!participants) return 0;

    let totalUnread = 0;
    for (const p of participants) {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', p.conversation_id)
        .gt('created_at', p.last_read_at)
        .neq('sender_id', user.id);
      
      totalUnread += (count || 0);
    }
    return totalUnread;
  }

  return {
    conversations,
    messages,
    loading,
    sendMessage,
    createSupportTicket,
    fetchConversations,
    getUnreadCount
  };
}
