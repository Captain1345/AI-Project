const ASSEMBLYAI_API_KEY = process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY;

export async function uploadAudio(blob) {
  const res = await fetch('https://api.assemblyai.com/v2/upload', {
    method: 'POST',
    headers: { Authorization: ASSEMBLYAI_API_KEY },
    body: blob,
  });
  const data = await res.json();
  return data.upload_url;
}

export async function transcribeAudio(uploadUrl) {
  const res = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      Authorization: ASSEMBLYAI_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ audio_url: uploadUrl }),
  });
  const data = await res.json();
  return data.id;
}

export async function pollTranscription(transcriptId) {
  while (true) {
    const res = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: { Authorization: ASSEMBLYAI_API_KEY },
    });
    const data = await res.json();
    if (data.status === 'completed') return data.text;
    if (data.status === 'failed') throw new Error('Transcription failed');
    await new Promise(r => setTimeout(r, 2000));
  }
}