import React from 'react';
import { AiFillFilePdf } from 'react-icons/ai';
import { convertPDFsToChunks, addToVectorCollection } from '../services/api';

export default function FileUpload() {
  const [file, setFile] = React.useState(null);
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleFileUpload = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      console.log("File Uploaded to Browser", newFiles);
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

  const senddFilesForChunking = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await convertPDFsToChunks(uploadedFiles);
      if (!result.raw_chunks) {
        throw new Error('No chunks received from PDF processing');
      }
      console.log("File Converted To Chunks", result);
      const vectorCollectionResponse = await addToVectorCollection(result.raw_chunks, Object.keys(result.results)[0]);
      console.log('Vector Collection Response:', vectorCollectionResponse);
    } catch (error) {
      console.error('Error processing PDFs:', error);
      setError('Failed to process PDFs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
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
  );
}