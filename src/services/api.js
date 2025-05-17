import axios from 'axios';

export const queryVectorCollection = async (question) => {
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

  return await response.json();
};

export const convertPDFsToChunks = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await fetch('http://localhost:8001/api/convert-pdfs-chunks', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to process PDFs');
  }

  return await response.json();
};

export const addToVectorCollection = async (chunks, fileName) => {
  const response = await axios.post('http://localhost:8001/api/vector-collection/add', {
    chunks: chunks.map(chunk => ({
      page_content: chunk.page_content,
      metadata: chunk.metadata
    })),
    fileName: fileName
  });
  return response.data;
};