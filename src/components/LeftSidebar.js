'use client';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { MdQuiz } from 'react-icons/md';
import { BsChatLeftText } from 'react-icons/bs';
import FileUpload from './FileUpload';
import ConversationsList from './ConversationsList';
import { useState } from 'react';

export default function LeftSidebar() {
  const [showFileUpload, setShowFileUpload] = useState(true);

  return (
    <div className="w-1/4 min-w-[300px] bg-white border-r border-gray-200 flex flex-col h-screen font-sans">
      <div className="flex flex-col h-full p-4">
        <h1 className="text-2xl font-bold mb-8 text-center">Better PM</h1>
        <nav className="space-y-2 mb-8">
          <div>
            <button className="w-full flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 font-medium text-gray-800 focus:outline-none"
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
  );
}