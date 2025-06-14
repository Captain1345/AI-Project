import { create } from 'zustand';

const useAppStore = create((set) => ({
  // File state
  file: null,
  setFile: (file) => set({ file }),
  
  // Question and answer state
  question: '',
  setQuestion: (question) => set({ question }),
  
  // UI state
  loading: false,
  setLoading: (loading) => set({ loading }),
  isListening: false,
  setIsListening: (isListening) => set({ isListening }),
  
  // References (not stored in Zustand state but accessible via actions)
  
  // Actions

}));

export default useAppStore;