//import { supabase } from './supabaseClient';
import { createClient } from '../utils/supabase/client';

export const createConversation = async (title) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
    .from('conversations')
    .insert([{ user_id: user.id, title }])
    .select();

  if (error) throw error;
  console.log("Conversation to Supabase",data);
  return data[0];
};

export const createMessage = async (conversationId, role, content, metadata = {}) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      conversation_id: conversationId,
      role: role,
      content: content,
      metadata: metadata
    }])
    .select();
    console.log("Message to Supabase", data);
  if (error) throw error;
  return data[0];
};

export const fetchMessages = async (conversationId) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const fetchConversations = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export async function fetchConversationById(conversationId) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('conversations')
    .select('Ended')
    .eq('id', conversationId)
    .single();
  if (error) throw error;
  return data;
}

export const deleteConversation = async (conversationId) => {
  const supabase = await createClient();

  // First delete all messages associated with the conversation
  const { error: messagesError } = await supabase
    .from('messages')
    .delete()
    .eq('conversation_id', conversationId);

  if (messagesError) {
    throw messagesError;
  }

  // Then delete the conversation itself
  const { error: conversationError } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);

  if (conversationError) {
    throw conversationError;
  }

  return true;
};

export async function endConversation(conversationId) {
  const supabase = createClient();
  const { error } = await supabase
    .from('conversations')
    .update({ Ended: "TRUE" })
    .eq('id', conversationId);
  if (error) {
    throw error;
  }
  return true;
}