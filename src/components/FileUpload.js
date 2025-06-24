'use client';
import React from 'react';
import { FileTextIcon, Cross2Icon, GearIcon, UploadIcon } from '@radix-ui/react-icons';
import { convertPDFsToChunks, addToVectorCollection } from '../services/api';

export default function FileUpload() {
  const [file, setFile] = React.useState(null);
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleFileUpload = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setFile(newFiles[0]);
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

  const senddFilesForChunking = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await convertPDFsToChunks(uploadedFiles);
      if (!result.raw_chunks) {
        throw new Error('No chunks received from PDF processing');
      }
      const vectorCollectionResponse = await addToVectorCollection(result.raw_chunks, Object.keys(result.results)[0]);
    } catch (error) {
      setError('Failed to process PDFs');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    if (file && uploadedFiles.indexOf(file) === index) {
      setFile(null);
    }
  };

  return (
    <div className="mb-4 px-4">
      <div
        className="border-2 border-dashed border-blue-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer mb-4 bg-gradient-to-br from-white via-blue-50 to-blue-100 transition-shadow hover:shadow-lg"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col items-center w-full">
          <UploadIcon className="w-6 h-6 text-blue-500 mb-2" />
          <p className="text-sm text-gray-700 font-medium mb-2 text-center">
            Drag & Drop PDF
          </p>
          <span className="text-xs text-gray-500 mb-2 font-normal">Limit 200MB</span>
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
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="button"
          >
            <UploadIcon className="w-4 h-4" />
            Browse files
          </button>
        </div>
      </div>

      {/* Display uploaded files with delete option */}
      <div className="space-y-2 mb-4">
        {uploadedFiles.map((file, index) => (
          <div key={index} className="flex items-center p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="w-6 h-6 flex-shrink-0 mr-2 flex items-center justify-center">
              <FileTextIcon className="text-blue-600 w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              onClick={() => removeFile(index)}
              className="ml-2 text-red-500 hover:text-red-700 p-1 rounded transition"
              title="Remove file"
              aria-label="Remove file"
              type="button"
            >
              <Cross2Icon className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <button
        className={`mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition
          ${loading
            ? 'bg-blue-300 text-white cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg'}
          disabled:opacity-60`}
        disabled={!file || loading}
        onClick={senddFilesForChunking}
        type="button"
      >
        <GearIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Uploading...' : 'Process & Analyze'}
      </button>
      {error && (
        <div className="w-full flex items-center justify-center mt-3">
          <span className="text-red-500 text-sm font-medium bg-red-50 px-3 py-1 rounded-lg shadow-sm">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}