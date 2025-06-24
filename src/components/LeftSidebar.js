'use client';
import { UploadIcon, ChatBubbleIcon, QuestionMarkCircledIcon, ExitIcon, HomeIcon } from '@radix-ui/react-icons';
import FileUpload from './FileUpload';
import ConversationsList from './ConversationsList';
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { getUser, LogOutUser } from '../actions/auth';
import Image from 'next/image';

export default function LeftSidebar() {
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const profileBtnRef = useRef(null);

    React.useEffect(() => {
    async function getUserDetails() {
      const result = await getUser();
      if (result.status === 'success') {
        setUser(result.user);
      }
    }
    getUserDetails();
  }, []);

  const handleLogout = async () => {
    await LogOutUser();
    // Optionally, redirect or refresh after logout
    // window.location.href = '/'; // Uncomment if you want to redirect
  };

  // Close menu on outside click
  // (basic implementation, for production use a library or add focus trap)
  React.useEffect(() => {
    function handleClick(e) {
      if (
        profileBtnRef.current &&
        !profileBtnRef.current.contains(e.target)
      ) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) {
      document.addEventListener('click', handleClick);
    }
    return () => document.removeEventListener('click', handleClick);
  }, [profileMenuOpen]);

  return (
    <div className="w-full flex flex-col h-full font-sans">
      {/* Top and scrollable area */}
      <div className="flex-1 flex flex-col p-4 min-h-0">
        <Link href="/">
          <div className="flex items-center justify-center gap-3 mb-8 cursor-pointer">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={36}
              height={36}
              className="w-9 h-9"
              priority
            />
            <h1 className="text-2xl font-bold self-center">Better PM</h1>
          </div>
        </Link>
        <nav className="space-y-2 mb-8">
          {user?.email === 'sumant.bagade@moxey.ai'   && (
          <div>
            <button className="w-full flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 font-medium text-gray-800 focus:outline-none"
              onClick={() => setShowFileUpload((prev) => !prev)}
            >
              <UploadIcon className="w-5 h-5" />
              <span>File Upload</span>
              <span className="ml-auto">{showFileUpload ? '▲' : '▼'}</span>
            </button>
            {showFileUpload && (
              <div className="pl-2 pt-2">
                <FileUpload />
              </div>
            )}
          </div>
          )}
          {/* Interview Option - styled with Tailwind */}
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 font-medium text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
          >
            <HomeIcon className="w-5 h-5" />
            <span>Interview</span>
          </Link>
          <Link href="/question-list" className="w-full flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 font-medium text-gray-800 focus:outline-none">
            <QuestionMarkCircledIcon className="w-5 h-5" />
            <span>Question Bank</span>
          </Link>
        </nav>
        <div className="flex items-center gap-2 px-4 py-2 mb-2">
          <ChatBubbleIcon className="w-5 h-5 text-gray-700" />
          <span className="font-medium text-gray-800">Interviews</span>
        </div>
        {/* Only this area scrolls */}
        <div className="flex-1 overflow-y-auto">
          <ConversationsList userId="6156270a-2ead-4294-a6b1-d98ae892de6b" />
        </div>
      </div>
      {/* Always visible at the bottom */}
      <div className="w-full px-4 pb-4 bg-white z-10">
        <button
          ref={profileBtnRef}
          onClick={() => setProfileMenuOpen((v) => !v)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition mb-2 relative"
        >
          <div className="w-9 h-9 rounded-full bg-green-700 flex items-center justify-center text-white font-semibold text-lg">
            S
          </div>
          <span className="text-gray-900 font-medium">My Profile</span>
        </button>
        {profileMenuOpen && (
          <div className="absolute left-0 bottom-16 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-fade-in flex flex-col py-2"
            onClick={e => e.stopPropagation()} 
          >
            <div className="px-4 pt-3 pb-2 text-gray-900 font-semibold text-base border-b border-gray-100">
              {user ? (
                <>
                  <div>{user.user_metadata?.username || user.email}</div>
                  <div className="text-gray-500 text-xs">{user.email}</div>
                </>
              ) : (
                <div>Loading...</div>
              )}
            </div>
            <button className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition text-gray-700 text-sm"
              onClick={e => {
                e.stopPropagation();
                handleLogout();
              }}>
              <ExitIcon className="w-5 h-5" />
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}