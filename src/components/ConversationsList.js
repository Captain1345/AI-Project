import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchConversations, deleteConversation } from '../services/supabaseService';

export default function ConversationsList({ userId }) {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadConversations();
  }, [userId]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await fetchConversations(userId);
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, conversationId) => {
    e.stopPropagation(); // Prevent triggering the conversation click
    
    if (!window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await deleteConversation(conversationId);
      // Refresh the conversations list
      await loadConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex-1 border-b border-gray-200">
      <div className="p-2">
        <h3 className="text-sm font-medium text-gray-600 mb-2">
          <span className="mr-2">💬</span>
          Conversations
        </h3>
        {loading ? (
          <div className="text-center text-gray-500 py-2">Loading conversations...</div>
        ) : (
          <div className="space-y-0.5">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-start hover:bg-gray-100 rounded-lg transition-colors"
              >
                <button
                  onClick={() => router.push(`/${conversation.id}`)}
                  className="flex-1 flex items-start justify-between px-2 py-1.5 w-full"
                >
                  <div className="text-sm font-medium text-gray-900 break-words pr-2 text-left">
                    {conversation.title || 'Untitled Conversation'}
                  </div>
                  <div
                    onClick={(e) => handleDelete(e, conversation.id)}
                    className="ml-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 cursor-pointer"
                    title="Delete conversation"
                    role="button"
                    aria-label="Delete conversation"
                  >
                    🗑️
                  </div>
                </button>
              </div>
            ))}
            {conversations.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-2">
                No conversations yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}