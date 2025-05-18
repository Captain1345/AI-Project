import { supabase } from './supabaseClient';

export const createConversation = async (userId, title) => {
  const { data, error } = await supabase
    .from('conversations')
    .insert([{ user_id: userId, title }])
    .select();

  if (error) throw error;
  console.log("Conversation to Supabase",data);
  return data[0];
};

export const createMessage = async (conversationId, sender, content, metadata = {}) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      conversation_id: conversationId,
      sender: sender,
      content: content,
      metadata: metadata
    }])
    .select();
    console.log("Message to Supabase", data);
  if (error) throw error;
  return data[0];
};

export const fetchMessages = async (conversationId) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const fetchConversations = async (userId) => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const deleteConversation = async (conversationId) => {

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