import { create } from 'zustand';

const useAppStore = create((set) => ({
  // File state
  file: null,
  setFile: (file) => set({ file }),
  
  // Question and answer state
  question: '',
  setQuestion: (question) => set({ question }),
  answer: '',
  setAnswer: (answer) => set({ answer }),
  appendToAnswer: (chunk) => set((state) => ({ answer: state.answer + chunk })),
  
  // UI state
  loading: false,
  setLoading: (loading) => set({ loading }),
  isListening: false,
  setIsListening: (isListening) => set({ isListening }),
  isStreaming: false,
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  isSpeaking: false,
  setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
  
  // References (not stored in Zustand state but accessible via actions)
  abortController: null,
  setAbortController: (abortController) => set({ abortController }),
  speechSynthesis: null,
  setSpeechSynthesis: (speechSynthesis) => set({ speechSynthesis }),
  
  // Actions
  resetAnswer: () => set({ answer: '' }),
  cancelRequest: () => {
    const { abortController } = useAppStore.getState();
    if (abortController) {
      abortController.abort();
      set({ abortController: null, isStreaming: false });
    }
  },
  stopSpeaking: () => {
    const { speechSynthesis } = useAppStore.getState();
    if (speechSynthesis) {
      speechSynthesis.cancel();
      set({ isSpeaking: false });
    }
  },
  speakText: (text) => {
    const { speechSynthesis } = useAppStore.getState();
    if (speechSynthesis) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => useAppStore.getState().setIsSpeaking(false);
      utterance.onerror = () => useAppStore.getState().setIsSpeaking(false);
      
      set({ isSpeaking: true });
      speechSynthesis.speak(utterance);
    }
  }
}));

export default useAppStore;