'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchConversations, deleteConversation } from '../services/supabaseService';
import { TrashIcon } from '@radix-ui/react-icons';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

export default function ConversationsList({ userId }) {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // For Alert Dialog
  const [open, setOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await fetchConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Open dialog and set which conversation to delete
  const handleDeleteClick = (e, conversationId) => {
    e.stopPropagation();
    setSelectedConversationId(conversationId);
    setOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedConversationId) return;
    try {
      setDeleting(true);
      await deleteConversation(selectedConversationId);
      await loadConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation');
    } finally {
      setDeleting(false);
      setOpen(false);
      setSelectedConversationId(null);
    }
  };

  return (
    <div className="flex-1 border-b border-gray-200">
      <div className="p-2">
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
                  className="flex-1 flex items-start justify-between px-2 py-1.5 w-full max-w-full"
                  style={{ minWidth: 0 }}
                >
                  <div
                    className="text-sm font-medium text-gray-900 break-words whitespace-normal pr-2 text-left max-w-full"
                  >
                    {conversation.title || 'Untitled Conversation'}
                  </div>
                  <div
                    onClick={(e) => handleDeleteClick(e, conversation.id)}
                    className="ml-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 cursor-pointer"
                    title="Delete conversation"
                    role="button"
                    aria-label="Delete conversation"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </div>
                </button>
              </div>
            ))}
            {conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-gray-900 font-medium mb-1">No interviews yet</div>
                <div className="text-gray-500 text-sm">Start your first interview to see your history here!</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Radix Alert Dialog */}
      <AlertDialog.Root open={open} onOpenChange={setOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
          <AlertDialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <AlertDialog.Title className="text-lg font-semibold mb-2">Delete Conversation</AlertDialog.Title>
            <AlertDialog.Description className="mb-4 text-gray-700">
              Are you sure you want to delete this conversation? This will delete all the conversation history for this interview!
            </AlertDialog.Description>
            <div className="flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button
                  className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                  disabled={deleting}
                >
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}