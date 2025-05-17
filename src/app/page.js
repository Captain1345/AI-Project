'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import generateGeminiResponse from '../utils/geminiResponse';
import useAppStore from '../store/appStore';
import { AiFillFilePdf } from 'react-icons/ai';
import { queryVectorCollection, convertPDFsToChunks, addToVectorCollection } from '../services/api';
import { createConversation, createMessage } from '../services/supabaseService.js';

export default function Home() {
  // Get state and actions from the store
  const {
    file, setFile,
    question, setQuestion,
    answer, resetAnswer, appendToAnswer, setAnswer,
    loading, setLoading,
    isStreaming, setIsStreaming,
    setAbortController, cancelRequest
  } = useAppStore();
  const [error, setError] = React.useState(null);
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [showDocuments, setShowDocuments] = React.useState(false);
  const [showIds, setShowIds] = React.useState(false);

  // Copy all your existing functions here (handleFileUpload, handleDrop, etc.)
  // ...
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

  const handleGeminiSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    resetAnswer();
    setIsStreaming(true);
    
    // Create a new AbortController for this request
    const controller = new AbortController();
    setAbortController(controller);

    try {
      await generateGeminiResponse(
        question,
        (chunk) => {
          if (!controller.signal.aborted) {
            appendToAnswer(chunk);
          }
        },
        controller.signal
      );
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
      } else {
        console.error('Error:', error);
        appendToAnswer('Error: Failed to get response from AI');
      }
    } finally {
      setLoading(false);
      setIsStreaming(false);
      setAbortController(null);
    }
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
      
      // Continue with the existing query logic
      const result = await queryVectorCollection(question);
      setAnswer({
        llmResponse: result.llmResponse || '',
        documents: result.results.documents[0] || '',
        ids: result.results.ids[0] || '',
      });
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
      {/* Left Panel - File Upload */}
      <div className="w-1/6 min-w-[200px] bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-600">
            <span className="mr-2">↪</span>
            Upload PDF files for QnA
          </h3>
        </div>
        
        <div 
          className="border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer mb-4"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <p className="text-sm text-gray-600 mb-1">Drag and drop file here</p>
          <p className="text-xs text-gray-500 mb-2">Limit 200MB per file • PDF</p>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf"
            onChange={handleFileUpload}
            multiple
          />
          <button 
            onClick={() => document.getElementById('file-upload').click()}
            className="bg-white border border-gray-300 rounded px-3 py-1 text-sm"
          >
            Browse files
          </button>
        </div>

        {/* Display uploaded files */}
        <div className="space-y-2 mb-4">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
              <div className="w-8 h-8 flex-shrink-0 mr-2 flex items-center justify-center">
                <AiFillFilePdf className="text-red-500 w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          className="mt-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md px-4 py-1 text-sm flex items-center"
          disabled={!file}
          onClick={senddFilesForChunking}
        >
          <span className="mr-2">⚙️</span>
          {loading ? 'File Uploading...' : 'Process'}
        </button>
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