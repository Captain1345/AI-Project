import React from 'react';
import generateGeminiResponse from './utils/geminiResponse';
import useAppStore from './store/appStore';
import { AiFillFilePdf } from 'react-icons/ai';
import axios from 'axios';

function App() {
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
      const response = await fetch('http://localhost:8001/api/vector-collection/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: question
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to get response from vector collection');
      }
  
      const result = await response.json();
      setAnswer({
        llmResponse: result.llmResponse || '',
        documents: result.results.documents[0] || '',
        ids: result.results.ids[0] || '',
      });
      console.log("ANSWER", answer);
  
    } catch (error) {
      console.error('Error:', error);
      appendToAnswer('Error: Failed to get response from vector collection');
    } finally {
      setLoading(false);
    }
  };

  const senddFilesForChunking = async () => {
    try {
      const formData = new FormData();
      uploadedFiles.forEach((file, index) => {
        formData.append(`files`, file);
      });

      const response = await fetch('http://localhost:8001/api/convert-pdfs-chunks', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process PDFs');
      }

      const result = await response.json();
      console.log('PDF Chunks response:', result);
      if (!result.raw_chunks) {
        throw new Error('No chunks received from PDF processing');
      }
      const vectorCollectionResponse = await addToVectorCollection(result.raw_chunks, "Sumant Name");
      console.log('Vector Collection Response:', vectorCollectionResponse);
      // Handle the successful response here
      // You can add state to show processing status if needed

    } catch (error) {
      console.error('Error processing PDFs:', error);
      // Handle error state here
    }
  };


  const addToVectorCollection = async (chunks, fileName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:8001/api/vector-collection/add', {
        chunks: chunks.map(chunk => ({
          page_content: chunk.page_content,
          metadata: chunk.metadata
        })),
        fileName: fileName
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add to vector collection');
      throw err;
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
          Process
        </button>
      </div>

      {/* Right Panel - Question Answer */}
      <div className="flex-1 p-8 flex flex-col items-center">
        <div className="w-full max-w-3xl">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600">🌐</span>
            </div>
            <h1 className="text-2xl font-medium text-gray-800">Better PM</h1>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">Ask a question related to your documents:</p>
          
          <form onSubmit={handleSubmit} className="w-full">
            <div className="relative mb-4">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your question here"
                disabled={loading}
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                type="submit"
                className="bg-white border border-gray-300 rounded-md px-4 py-1 text-sm flex items-center hover:bg-gray-50"
                disabled={loading || !question.trim()}
              >
                <span className="text-orange-500 mr-1">🔥</span>
                {loading ? 'Processing...' : 'Ask'}
              </button>

              {isStreaming && (
                <button
                  type="button"
                  onClick={cancelRequest}
                  className="bg-white border border-gray-300 rounded-md px-4 py-1 text-sm flex items-center hover:bg-gray-50"
                >
                  <span className="text-red-500 mr-1">⏹</span>
                  Stop
                </button>
              )}
            </div>
          </form>

          {answer && (
            <div className="mt-6 p-4 bg-white rounded-lg shadow">
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
                <div>
                  <h3 className="text-md font-medium text-gray-700">LLM Response:</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{answer.llmResponse}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebars */}
      {showDocuments && (
        <div className="fixed right-0 top-0 h-screen w-80 bg-white shadow-lg p-4 overflow-y-auto transition-transform transform">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Documents</h3>
            <button 
              onClick={() => setShowDocuments(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          {Array.isArray(answer?.documents) ? (
            <ul className="list-disc pl-5">
              {answer.documents.map((doc, index) => (
                <li key={index} className="text-gray-700">{doc}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">{answer?.documents}</p>
          )}
        </div>
      )}

      {showIds && (
        <div className="fixed right-0 top-0 h-screen w-80 bg-white shadow-lg p-4 overflow-y-auto transition-transform transform">
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

export default App;

