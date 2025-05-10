const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = 'AIzaSyDBUEXSzSrMc12ZhYcLh8E-hSxr6S6eJp0';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Initialize the model
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

/**
 * Generates a streaming response using the Gemini AI model
 * @param {string} userInput - The input text to generate response for
 * @param {function} onChunk - Callback function to handle each chunk of response
 * @param {AbortSignal} signal - AbortSignal to cancel the operation
 * @returns {Promise<void>}
 */
async function generateGeminiResponse(userInput, onChunk, signal) {
  try {
    if (!userInput) {
      throw new Error('Input is required');
    }

    const result = await model.generateContent(userInput);
    const response = await result.response;
    const text = response.text();
    
    // Simulate streaming by sending one character at a time
    for (let i = 0; i < text.length; i++) {
      // Check if operation was cancelled
      if (signal?.aborted) {
        throw new Error('AbortError');
      }
      
      onChunk(text[i]);
      // Add a small delay to make the streaming visible
      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(resolve, 20);
        
        // Clean up timeout if operation is cancelled
        signal?.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject(new Error('AbortError'));
        });
      });
    }
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

export default generateGeminiResponse;