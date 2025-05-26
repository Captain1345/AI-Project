import { AssemblyAI } from "assemblyai";

export const config = {
  api: {
    bodyParser: false, // We'll handle the stream manually
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "AssemblyAI API key not set" });
  }

  const assemblyai = new AssemblyAI({ apiKey });

  // Collect the audio file from the request
  const chunks = [];
  
  // Use a Promise to properly handle the async nature of the request
  await new Promise((resolve, reject) => {
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", resolve);
    req.on("error", reject);
  });
  
  try {
    const buffer = Buffer.concat(chunks);
    // Upload the audio file
    const uploadRes = await assemblyai.files.upload(buffer);
    
    // Start the transcription
    const transcript = await assemblyai.transcripts.transcribe({ audio_url: uploadRes });
    
    // Poll for completion
    let completed = false;
    let text = "";
    while (!completed) {
      const polling = await assemblyai.transcripts.get(transcript.id);
      if (polling.status === "completed") {
        text = polling.text;
        completed = true;
      } else if (polling.status === "failed") {
        return res.status(500).json({ error: "Transcription failed" });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}