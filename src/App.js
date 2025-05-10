import React, { useState, useRef, useEffect } from 'react';
import generateGeminiResponse from './utils/geminiResponse';

function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef(null);

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Speech recognition is not supported in your browser.');
    }
  };

  // const handleCancel = () => {
  //   if (abortControllerRef.current) {
  //     abortControllerRef.current.abort();
  //     abortControllerRef.current = null;
  //   }
  //   setIsStreaming(false);
  // };


  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthesisRef = useRef(null);
  
  // Initialize speech synthesis
  useEffect(() => {
    speechSynthesisRef.current = window.speechSynthesis;
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  // Function to speak text
  const speakText = (text) => {
    if (speechSynthesisRef.current) {
      // Cancel any ongoing speech
      speechSynthesisRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      setIsSpeaking(true);
      speechSynthesisRef.current.speak(utterance);
    }
  };

  // Function to stop speaking
  const stopSpeaking = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer('');
    setIsStreaming(true);
    stopSpeaking(); // Stop any ongoing speech
    
    abortControllerRef.current = new AbortController();

    try {
      let accumulatedText = '';
      await generateGeminiResponse(
        question,
        (chunk) => {
          if (!abortControllerRef.current?.signal.aborted) {
            accumulatedText += chunk;
            setAnswer(accumulatedText);
            
            // Speak when we get a complete sentence
            if (['.', '!', '?', '\n'].includes(chunk)) {
              speakText(accumulatedText);
              accumulatedText = '';
            }
          }
        },
        abortControllerRef.current.signal
      );
      
      // Speak any remaining text
      if (accumulatedText) {
        speakText(accumulatedText);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
        stopSpeaking();
      } else {
        console.error('Error:', error);
        setAnswer('Error: Failed to get response from AI');
      }
    } finally {
      setLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    stopSpeaking();
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
          onDragOver={handleDragOver}
        >
          <p className="text-sm text-gray-600 mb-1">Drag and drop file here</p>
          <p className="text-xs text-gray-500 mb-2">Limit 200MB per file • PDF</p>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf"
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => document.getElementById('file-upload').click()}
            className="bg-white border border-gray-300 rounded px-3 py-1 text-sm"
          >
            Browse files
          </button>
        </div>
        
        <button 
          className="mt-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md px-4 py-1 text-sm flex items-center"
          disabled={!file}
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
                disabled={loading || isListening}
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                type="submit"
                className="bg-white border border-gray-300 rounded-md px-4 py-1 text-sm flex items-center hover:bg-gray-50"
                disabled={loading || !question.trim() || isListening}
              >
                <span className="text-orange-500 mr-1">🔥</span>
                {loading ? 'Processing...' : 'Ask'}
              </button>

              <button 
                type="button"
                onClick={startListening}
                className="bg-white border border-gray-300 rounded-md px-4 py-1 text-sm flex items-center hover:bg-gray-50"
                disabled={loading || isListening}
              >
                <span className="text-blue-500 mr-1">🎤</span>
                {isListening ? 'Listening...' : 'Voice'}
              </button>

              {isStreaming && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-white border border-gray-300 rounded-md px-4 py-1 text-sm flex items-center hover:bg-gray-50"
                >
                  <span className="text-red-500 mr-1">⏹</span>
                  Stop
                </button>
              )}

              {answer && (
                <button
                  type="button"
                  onClick={isSpeaking ? stopSpeaking : () => speakText(answer)}
                  className="bg-white border border-gray-300 rounded-md px-4 py-1 text-sm flex items-center hover:bg-gray-50"
                >
                  <span className="text-green-500 mr-1">{isSpeaking ? '⏹' : '🔊'}</span>
                  {isSpeaking ? 'Stop Speaking' : 'Speak'}
                </button>
              )}
            </div>
          </form>

          {answer && (
            <div className="mt-6 p-4 bg-white rounded-lg shadow">
              <h2 className="text-lg font-medium mb-2">Answer:</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{answer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

