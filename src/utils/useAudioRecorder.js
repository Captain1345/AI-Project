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
    const recorder = new window.MediaRecorder(stream);
    let chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      setAudioBlob(blob);
      if (onStop) onStop(blob);
      chunks = [];
      stream.getTracks().forEach(track => track.stop());
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

  return { isRecording, audioBlob, startRecording, stopRecording, reset };
}