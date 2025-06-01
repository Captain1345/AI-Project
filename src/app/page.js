'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';
import useAppStore from '../store/appStore';
import {convertPDFsToChunks, addToVectorCollection } from '../services/api';
import { createConversation, createMessage } from '../services/supabaseService.js';
import { useState } from 'react';
import { BsMic } from 'react-icons/bs'; // Import the microphone icon
import useAudioRecorder from '../utils/useAudioRecorder';
import { uploadAudio, transcribeAudio, pollTranscription } from '../utils/assemblyai';
import LogOut from '../components/LogOut';

export default function Home() {
  // Remove file-related state and functions
  const {
    question, setQuestion,
    loading, setLoading,
    isListening, setIsListening,
    isStreaming, setIsStreaming,
    setAbortController, cancelRequest
  } = useAppStore();
  const [showFileUpload, setShowFileUpload] = useState(true);

 
  const router = useRouter();
  // Copy all your existing functions here (handleFileUpload, handleDrop, etc.)
  const handleFileUpload = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      console.log("FILE UPLOADED", newFiles);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setFile(newFiles[0]); // Keep the first file as the active file for processing
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFile = e.dataTransfer.files[0];
      setUploadedFiles(prev => [...prev, newFile]);
      setFile(newFile);
    }
  };

  const { isRecording, startRecording, stopRecording } = useAudioRecorder(async (blob) => {
    const formData = new FormData();
    formData.append('audio', blob, 'audio.webm');
    const res = await fetch('/api/transcribe', {
      method: 'POST',
      body: blob, // If your API expects raw binary, otherwise use formData
    });
    const data = await res.json();
    if (data.text) {
      setQuestion(data.text);
    } else {
      alert(data.error || 'Transcription failed');
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
  
    setLoading(true);
    
    try {
      // Use the new service function
      const conversation = await createConversation(question);
      const message = await createMessage(conversation.id,'user',question)
      
      router.push(`/${conversation.id}`);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const senddFilesForChunking = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await convertPDFsToChunks(uploadedFiles);
      if (!result.raw_chunks) {
        throw new Error('No chunks received from PDF processing');
      }
      console.log(result)
      const vectorCollectionResponse = await addToVectorCollection(result.raw_chunks, "Sumant Name");
      console.log('Vector Collection Response:', vectorCollectionResponse);
    } catch (error) {
      console.error('Error processing PDFs:', error);
      setError('Failed to process PDFs');
    } finally {
      setLoading(false);
    }
  };


  return (
  <div className="">
    <LogOut />
    <div className="flex-1 flex items-center justify-center h-screen">
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4 text-center">Better PM</h1>
        <div className="w-full relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading && question.trim()) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className="w-full border border-gray-300 rounded-full py-4 px-6 pr-32 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            placeholder="Ask anything"
            disabled={loading}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleMicClick}
              className={`p-2 hover:bg-gray-100 rounded-full ${isListening ? 'bg-blue-100' : ''}`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              <BsMic className={`w-5 h-5 ${isListening ? 'text-blue-500' : 'text-gray-500'}`} />
            </button>
            <button 
              onClick={handleSubmit}
              disabled={loading || !question.trim()}
              className="bg-black text-white rounded-full p-3 px-6 text-sm font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? 'Processing...' : 'Ask'}
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

