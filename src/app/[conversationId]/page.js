"use client";

import ReactMarkdown from 'react-markdown';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createMessage, fetchMessages } from '../../services/supabaseService';
import { queryVectorCollection } from '../../services/api';

export default function ConversationPage() {
  const params = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [initialLoading, setInitialLoading] = useState(true); // For initial page load
  const [queryingVector, setQueryingVector] = useState(false); // For vector collection queries
  const [fetchingNewMessages, setFetchingNewMessages] = useState(false); // For fetching new messages

  useEffect(() => {
    loadMessages();
  }, [params.conversationId]);

  const loadMessages = async () => {
    try {
      setInitialLoading(true);
      const data = await fetchMessages(params.conversationId);
      setMessages(data);
      setInitialLoading(false);
      
      // Check if there are messages and if the latest message is from a user
      if (data.length > 0 && data[data.length-1].sender === 'user') {
        setQueryingVector(true);
        let conversationHistory= data;
        let lastMessageSent=data[data.length-1].content
        const result = await queryVectorCollection(conversationHistory, lastMessageSent);
        await createMessage(
          params.conversationId,
          'assistant',
          result.llmResponse || '',
          {documents: result.results.documents[0],
            ids:result.results.ids[0],}
        );
        // Refresh messages to include the new assistant response
        setFetchingNewMessages(true);
        const updatedData = await fetchMessages(params.conversationId);
        setMessages(updatedData);
        console.log("Latest messages", updatedData)
        setFetchingNewMessages(false);
        setQueryingVector(false);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setInitialLoading(false);
      setFetchingNewMessages(false);
      setQueryingVector(false);
    }
  };

  const handleSendUserMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await createMessage(params.conversationId, 'user', newMessage);
      setNewMessage("");
      setFetchingNewMessages(true);
      const data = await fetchMessages(params.conversationId);
      setMessages(data);
      setFetchingNewMessages(true);
      // Check if there are messages and if the latest message is from a user
      if (data.length > 0 && data[data.length-1].sender === 'user') {
        setQueryingVector(true);
        let conversationHistory= data;
        let lastMessageSent=data[data.length-1].content
        const result = await queryVectorCollection(conversationHistory, lastMessageSent);
        await createMessage(
          params.conversationId,
          'assistant',
          result.llmResponse || '',
          {documents: result.results.documents[0],
            ids:result.results.ids[0],}
        );
        // Refresh messages to include the new assistant response
        setFetchingNewMessages(true);
        const updatedData = await fetchMessages(params.conversationId);
        console.log("Latest messages", updatedData)
        setMessages(updatedData);
        setFetchingNewMessages(false);
        setQueryingVector(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setFetchingNewMessages(false);
      setQueryingVector(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendUserMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {initialLoading ? (
          <div className="text-center">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">No messages yet</div>
        ) : (
          <>
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`rounded-lg p-4 max-w-[80%] ${message.sender === 'user' 
                  ? 'ml-auto bg-blue-500 text-white' 
                  : 'mr-auto bg-gray-100 text-gray-800'}`}
              >
                 <div className="text-gray-700 prose prose-sm max-w-none prose-p:text-lg prose-headings:text-xl prose-strong:text-lg">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {queryingVector && (
              <div className="mr-auto bg-gray-50 text-gray-500 rounded-lg p-4 max-w-[80%] animate-pulse">
                AI is thinking...
              </div>
            )}
            {fetchingNewMessages && !queryingVector && (
              <div className="text-center text-gray-500 text-sm mt-2">
                Loading new messages...
              </div>
            )}
          </>
        )}
      </div>
      <div className="border-t p-4">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <div className="flex-1 flex items-center bg-white border rounded-full shadow-sm hover:shadow">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything"
              className="flex-1 px-4 py-2 bg-transparent outline-none rounded-full"
              disabled={queryingVector}
            />
            <div className="flex items-center px-2 space-x-1">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path d="M9 12h6" />
                  <path d="M12 9v6" />
                </svg>
              </button>
            </div>
          </div>
          <button 
            onClick={handleSendUserMessage}
            className="p-2 hover:bg-gray-100 rounded-full"
            disabled={queryingVector || !newMessage.trim()}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className={`w-5 h-5 ${queryingVector ? 'text-gray-300' : 'text-gray-700'}`}>
              <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}