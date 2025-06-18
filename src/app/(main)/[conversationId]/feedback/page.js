"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Retrieve the feedback from session storage
    const storedFeedback = sessionStorage.getItem('feedbackData');
    if (storedFeedback) {
      setFeedback(storedFeedback);
      // Clean up the session storage after reading the data
      sessionStorage.removeItem('feedbackData');
    } else {
      console.warn("No feedback data found in session storage. The user may have navigated here directly.");
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-gray-600">Loading feedback...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Interview Feedback</h1>
        <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
          <ReactMarkdown>
            {feedback || "No feedback available. Please generate it from the conversation page."}
          </ReactMarkdown>
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Back to Conversation
          </button>
        </div>
      </div>
    </div>
  );
}
