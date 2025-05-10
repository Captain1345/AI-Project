import React, { useEffect } from 'react';
import { useSpeechRecognition, useSpeechSynthesis } from 'react-speech-kit';
import generateGeminiResponse from './utils/geminiResponse';
import useAppStore from './store/appStore';

function App() {
  // Get state and actions from the store
  const {
    file, setFile,
    question, setQuestion,
    answer, resetAnswer, appendToAnswer,
    loading, setLoading,
    isListening, setIsListening,
    isStreaming, setIsStreaming,
    isSpeaking, setIsSpeaking,
    setAbortController, cancelRequest
  } = useAppStore();

  // Speech recognition with react-speech-kit
  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result) => {
      setQuestion(result);
    },
    onEnd: () => {
      setIsListening(false);
    },
    onError: (event) => {
      console.error('Speech recognition error:', event);
      setIsListening(false);
    }
  });

  // Update isListening state when listening changes
  useEffect(() => {
    setIsListening(listening);
  }, [listening, setIsListening]);

  // Speech synthesis with react-speech-kit
  const { speak, cancel, speaking } = useSpeechSynthesis();

  // Update isSpeaking state when speaking changes
  useEffect(() => {
    setIsSpeaking(speaking);
  }, [speaking, setIsSpeaking]);

  // Function to speak text
  const speakText = (text) => {
    if (text) {
      speak({ text });
    }
  };

  // Function to stop speaking
  const stopSpeaking = () => {
    cancel();
  };

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
    listen();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    resetAnswer();
    setIsStreaming(true);
    stopSpeaking();
    
    // Create a new AbortController for this request
    const controller = new AbortController();
    setAbortController(controller);

    try {
      let accumulatedText = '';
      await generateGeminiResponse(
        question,
        (chunk) => {
          if (!controller.signal.aborted) {
            accumulatedText += chunk;
            appendToAnswer(chunk);
            
            // Speak when we get a complete sentence
            if (['.', '!', '?', '\n'].includes(chunk)) {
              speakText(accumulatedText);
              accumulatedText = '';
            }
          }
        },
        controller.signal
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
        appendToAnswer('Error: Failed to get response from AI');
      }
    } finally {
      setLoading(false);
      setIsStreaming(false);
      setAbortController(null);
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
                onClick={isListening ? stop : startListening}
                className="bg-white border border-gray-300 rounded-md px-4 py-1 text-sm flex items-center hover:bg-gray-50"
                disabled={loading}
              >
                <span className="text-blue-500 mr-1">🎤</span>
                {isListening ? 'Stop Listening' : 'Voice'}
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

