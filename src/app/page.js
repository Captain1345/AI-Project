'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';
import useAppStore from '../store/appStore';
import {convertPDFsToChunks, addToVectorCollection } from '../services/api';
import { createConversation, createMessage } from '../services/supabaseService.js';
import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import ConversationsList from '../components/ConversationsList';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { MdQuiz } from 'react-icons/md';
import { BsChatLeftText } from 'react-icons/bs';

export default function Home() {
  // Remove file-related state and functions
  const {
    question, setQuestion,
    answer, resetAnswer, appendToAnswer, setAnswer,
    loading, setLoading,
    isStreaming, setIsStreaming,
    setAbortController, cancelRequest
  } = useAppStore();
  const [showDocuments, setShowDocuments] = React.useState(false);
  const [showIds, setShowIds] = React.useState(false);
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

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
  
    setLoading(true);
    resetAnswer();
  
    try {
      // Use the new service function
      const conversation = await createConversation('6156270a-2ead-4294-a6b1-d98ae892de6b', question);
      const message = await createMessage(conversation.id,'user',question)
      
      router.push(`/${conversation.id}`);

    } catch (error) {
      console.error('Error:', error);
      appendToAnswer('Error: Failed to get response from vector collection');
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
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-1/4 min-w-[300px] bg-white border-r border-gray-200 flex flex-col h-screen font-sans">
        <div className="flex flex-col h-full p-4">
          <h1 className="text-2xl font-bold mb-8 text-center">Better PM</h1>
          {/* Sidebar Navigation */}
          <nav className="space-y-2 mb-8">
            <div>
              <button
                className="w-full flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 font-medium text-gray-800 focus:outline-none"
                onClick={() => setShowFileUpload((prev) => !prev)}
              >
                <AiOutlineCloudUpload className="w-5 h-5" />
                <span>File Upload</span>
                <span className="ml-auto">{showFileUpload ? '▲' : '▼'}</span>
              </button>
              {showFileUpload && (
                <div className="pl-2 pt-2">
                  <FileUpload />
                </div>
              )}
            </div>
            <button className="w-full flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 font-medium text-gray-800 focus:outline-none">
              <MdQuiz className="w-5 h-5" />
              <span>Question Bank</span>
            </button>
          </nav>
          <div className="flex items-center gap-2 px-4 py-2 mb-2">
            <BsChatLeftText className="w-5 h-5 text-gray-700" />
            <span className="font-medium text-gray-800">Interviews</span>
          </div>
          <div className="flex-1 overflow-y-auto pl-9">
            <ConversationsList userId="6156270a-2ead-4294-a6b1-d98ae892de6b" />
          </div>
        </div>
      </div>

      {/* Right Panel - Question Answer */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Center the content vertically */}
        <div className="flex-1 flex flex-col justify-center items-center px-8">
          <div className="w-full max-w-3xl">
            <div className="flex flex-col items-center mb-8">
              <h1 className="text-3xl font-semibold text-gray-800 mb-4">Better PM</h1>
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
                  {isStreaming && (
                    <button
                      type="button"
                      onClick={cancelRequest}
                      className="p-2 hover:bg-gray-100 rounded-full"
                      title="Stop"
                    >
                      <span className="text-red-500">⏹</span>
                    </button>
                  )}
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

            {/* Answer section */}
            {answer?.llmResponse && (
              <div className="bg-white rounded-lg shadow p-4 mt-8">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-medium">Answer:</h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowDocuments(!showDocuments)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Show Documents"
                    >
                      📄
                    </button>
                    <button 
                      onClick={() => setShowIds(!showIds)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Show IDs"
                    >
                      🔍
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-gray-700 prose prose-lg max-w-none prose-p:text-lg prose-headings:text-xl prose-strong:text-lg">
                    <ReactMarkdown>{answer.llmResponse}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebars */}
      {showDocuments && (
        <div className="fixed right-0 top-0 h-screen w-96 bg-white shadow-lg p-4 overflow-y-auto transition-transform transform">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Documents</h3>
            <button 
              onClick={() => setShowDocuments(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="prose prose-sm max-w-none">
            {Array.isArray(answer?.documents) ? (
              <ul className="list-disc pl-5">
                {answer.documents.map((doc, index) => (
                  <li key={index} className="text-gray-700">
                    <ReactMarkdown>{doc}</ReactMarkdown>
                  </li>
                ))}
              </ul>
            ) : (
              <ReactMarkdown className="text-gray-700 whitespace-pre-wrap">
                {answer?.documents || ''}
              </ReactMarkdown>
            )}
          </div>
        </div>
      )}

      {showIds && (
        <div className="fixed right-0 top-0 h-screen w-96 bg-white shadow-lg p-4 overflow-y-auto transition-transform transform">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">IDs</h3>
            <button 
              onClick={() => setShowIds(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          {Array.isArray(answer?.ids) ? (
            <ul className="list-disc pl-5">
              {answer.ids.map((id, index) => (
                <li key={index} className="text-gray-700">{id}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">{answer?.ids}</p>
          )}
        </div>
      )}
    </div>
  );
}