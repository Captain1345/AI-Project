import { useRef, useState } from 'react';

export default function useAudioRecorder(onStop) {
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  const startRecording = async () => {
    if (!navigator.mediaDevices) {
      alert('Audio recording not supported in this browser.');
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    let chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      setAudioBlob(blob);
      if (onStop) onStop(blob);
      chunks = [];
      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const reset = () => {
    setAudioBlob(null);
    setIsRecording(false);
  };

 // Add this function inside your useAudioRecorder hook

 const hasVoiceActivity = async (activityThreshold = 0.19) => {
  if (!audioBlob) {
    console.warn("AudioBlob is null. Cannot detect voice activity.");
    return false; // No blob to analyze
  }

  let audioCtx; // Declare here to ensure it's accessible in finally block

  try {
    // Create a new AudioContext for this operation
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0); // Use the first channel

    if (channelData.length === 0) {
      console.warn("Audio data is empty.");
      return false; // No data to analyze
    }

    for (let i = 0; i < channelData.length; i++) {
      // Check if the absolute amplitude of any sample exceeds the threshold
      if (Math.abs(channelData[i]) > activityThreshold) {
        return true; // Sound activity detected
      }
    }

    // If the loop completes, no sample exceeded the threshold
    return false; // No significant sound activity (likely silence)
  } catch (error) {
    console.error("Error detecting voice activity:", error);
    // This can happen if the blob is not a valid audio format
    // or if AudioContext initialization fails.
    return false; // Indicate failure or no voice due to error
  } finally {
    // Ensure AudioContext is closed to free up resources
    if (audioCtx && audioCtx.state !== 'closed') {
      await audioCtx.close();
    }
  }
};

  return { isRecording, audioBlob, startRecording, stopRecording, reset, hasVoiceActivity };
}
