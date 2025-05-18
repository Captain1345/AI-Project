import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchConversations } from '../services/supabaseService';

export default function ConversationsList({ userId }) {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex-1 border-b border-gray-200">
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-4">
          <span className="mr-2">💬</span>
          Conversations
        </h3>
        {loading ? (
          <div className="text-center text-gray-500 py-4">Loading conversations...</div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => router.push(`/${conversation.id}`)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="text-sm font-medium text-gray-900 truncate">
                  {conversation.title || 'Untitled Conversation'}
                </div>
              </button>
            ))}
            {conversations.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-4">
                No conversations yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}