"use client";

import ReactMarkdown from 'react-markdown';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { createMessage, fetchMessages } from '../../../services/supabaseService';
import { queryVectorCollection } from '../../../services/api';
import useAppStore from '../../../store/appStore'; // Import the app store
import { BsMic } from 'react-icons/bs'; // Import the microphone icon
import useAudioRecorder from '../../../utils/useAudioRecorder';
import { uploadAudio, transcribeAudio, pollTranscription } from '../../../utils/assemblyai';
import * as Popover from '@radix-ui/react-popover';
import { PaperPlaneIcon, MixerHorizontalIcon } from '@radix-ui/react-icons';

export default function ConversationPage() {
  const params = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [initialLoading, setInitialLoading] = useState(true); // For initial page load
  const [queryingVector, setQueryingVector] = useState(false); // For vector collection queries
  const [fetchingNewMessages, setFetchingNewMessages] = useState(false); // For fetching new messages
  const [audioMap, setAudioMap] = useState({});
  const { isListening, setIsListening } = useAppStore(); // Get isListening state and setter
  const [showEndTooltip, setShowEndTooltip] = useState(false);
  const tooltipRef = useRef(null);

  useEffect(() => {
    loadMessages();
  }, [params.conversationId]);

  // Optional: Close tooltip when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowEndTooltip(false);
      }
    }
    if (showEndTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEndTooltip]);

  const getSarvamTTSAudioFromAPI = async (text) => {
    try {
      const response = await fetch('/api/sarvam-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!response.ok) throw new Error('TTS API error');
      const data = await response.json();
      return data.audio; // Adjust if your API returns a different key
    } catch (e) {
      console.error('TTS API error:', e);
      return null;
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new window.SpeechSynthesisUtterance(text);
      const setVoiceAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        const raviVoice = voices.find(v => v.name.includes('Female'));
        if (raviVoice) {
          utterance.voice = raviVoice; // This must be the object, not a string
        }
        window.speechSynthesis.speak(utterance);
      };
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
      } else {
        setVoiceAndSpeak();
      }
    }
  };
  const loadMessages = async () => {
    try {
      setInitialLoading(true);
      const data = await fetchMessages(params.conversationId);
      setMessages(data);
      setInitialLoading(false);
      
      // Check if there are messages and if the latest message is from a user
      if (data.length > 0 && data[data.length-1].role === 'user') {
        setQueryingVector(true);
        let conversationHistory= data;
        let lastMessageSent=data[data.length-1].content
        const result = await queryVectorCollection(conversationHistory, lastMessageSent);
        const assistantMsg = await createMessage(
          params.conversationId,
          'assistant',
          result.llmResponse || '',
          // {documents: result.results.documents[0],
          //   ids:result.results.ids[0],}
        );
        // if (result.llmResponse) {
        //   try {
        //     const base64Audio = await getSarvamTTSAudioFromAPI(result.llmResponse);
        //     if (base64Audio) {
        //       const audioBlob = new Blob([Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0))], { type: 'audio/wav' });
        //       const audioURL = URL.createObjectURL(audioBlob);
        //       setAudioMap(prev => ({ ...prev, [assistantMsg.id]: audioURL }));
        //     }
        //   } catch (e) { console.error('TTS error', e); }
        // }
        // Refresh messages to include the new assistant response
        speakText(result.llmResponse);
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
      if (data.length > 0 && data[data.length-1].role === 'user') {
        setQueryingVector(true);
        let conversationHistory= data;
        let lastMessageSent=data[data.length-1].content
        const result = await queryVectorCollection(conversationHistory, lastMessageSent);
        const assistantMsg = await createMessage(
          params.conversationId,
          'assistant',
          result.llmResponse || '',
          // {documents: result.results.documents[0],
          //   ids:result.results.ids[0],}
        );
        // if (result.llmResponse) {
        //   try {
        //     const base64Audio = await getSarvamTTSAudioFromAPI(result.llmResponse);
        //     if (base64Audio) {
        //       const audioBlob = new Blob([Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0))], { type: 'audio/wav' });
        //       const audioURL = URL.createObjectURL(audioBlob);
        //       setAudioMap(prev => ({ ...prev, [assistantMsg.id]: audioURL }));
        //     }
        //   } catch (e) { console.error('TTS error', e); }
        // }
        // Refresh messages to include the new assistant response

        speakText(result.llmResponse);
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

  const { isRecording, startRecording, stopRecording, hasVoiceActivity } = useAudioRecorder(async (blob) => {
    const hasVoice = await hasVoiceActivity();
    if (!hasVoice) {
      // Handle silence
      console.log("Silence detected", hasVoice);
      return;
    }
    const formData = new FormData();
    formData.append('audio', blob, 'recording.wav');
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: blob,
    });
    if (!response.ok) {
      // Handle error
      setNewMessage('Transcription failed.');
      return;
    }
    const data = await response.json();
    setNewMessage(data.text || '');
  });
  
  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
      setIsListening(false);
    } else {
      startRecording();
      setIsListening(true);
    }
  };

  const handleEndConversation = () => {
    // Add your logic to end the conversation here
    alert('Conversation ended!');
    setShowEndTooltip(false);
  };

  return (
      <div className="flex flex-col h-screen bg-gray-100">
        <div className="flex-1 overflow-y-auto px-2 sm:px-6 md:px-16 py-4 space-y-4 max-w-5xl mx-auto w-full">
          {initialLoading ? (
            <div className="text-center">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500">No messages yet</div>
          ) : (
            <>
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`rounded-lg p-4 max-w-[80%] ${message.role === 'user' 
                    ? 'ml-auto bg-sky-300 text-white' 
                    : 'mr-auto bg-sky-100 text-zinc-800'}`}
                >
                  <div className={`prose prose-sm max-w-none prose-p:text-lg prose-headings:text-xl prose-strong:text-lg ${message.role === 'user' ? 'text-black-200' : 'text-gray-700'}`}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  {message.role === 'assistant' && audioMap[message.id] && (
                    <audio controls src={audioMap[message.id]} />
                  )}
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
        <div className="border-t px-2 sm:px-6 md:px-16 py-4 bg-white max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2">
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
              {/* Microphone Icon */}
              <button
                type="button"
                onClick={handleMicClick}
                className={`p-2 hover:bg-gray-100 rounded-full ${isListening ? 'bg-blue-100' : ''}`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                <BsMic className={`w-5 h-5 ${isListening ? 'text-blue-500' : 'text-gray-500'}`} />
              </button>
              {/* <div className="flex items-center px-2 space-x-1">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                </button>
              </div> */}
            </div>
            <button 
              onClick={handleSendUserMessage}
              className="p-2 hover:bg-gray-100 rounded-full"
              disabled={queryingVector || !newMessage.trim()}
            >
              <PaperPlaneIcon className={`w-5 h-5 ${queryingVector ? 'text-gray-300' : 'text-gray-700'}`} />
            </button>
            <Popover.Root open={showEndTooltip} onOpenChange={setShowEndTooltip}>
              <Popover.Trigger asChild>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full relative"
                  type="button"
                  aria-label="Show end conversation options"
                >
                  <MixerHorizontalIcon className="w-5 h-5" />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  side="top"
                  align="end"
                  className="z-50 min-w-[180px] bg-white border border-gray-200 rounded-xl shadow-xl px-0 py-2 flex flex-col gap-1"
                  sideOffset={10}
                  style={{
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 1.5px 4px rgba(0,0,0,0.08)'
                  }}
                >
                  <button
                    className="w-full text-left px-5 py-2 text-red-600 font-medium hover:bg-red-50 rounded-t-xl transition-colors focus:outline-none focus:bg-red-100"
                    onClick={handleEndConversation}
                  >
                    End Conversation
                  </button>
                  <div className="h-px bg-gray-100 my-1" /> {/* <-- Use div as separator */}
                  <button
                    className="w-full text-left px-5 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded-b-xl transition-colors focus:outline-none focus:bg-gray-100"
                    onClick={() => alert('Feedback generation coming soon!')}
                  >
                    Generate Feedback
                  </button>
                  <Popover.Arrow className="fill-white drop-shadow" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
        </div>
      </div>
  );
}