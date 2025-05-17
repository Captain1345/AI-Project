import { supabase } from './supabaseClient';

export const createConversation = async (userId, title) => {
  const { data, error } = await supabase
    .from('conversations')
    .insert([{ user_id: userId, title }])
    .select();

  if (error) throw error;
  console.log("CONVERSATION",data);
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
    console.log("MESSAGE", data);
  if (error) throw error;
  return data[0];
};