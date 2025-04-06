import { create } from 'zustand';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

interface ChatState {
  messages: Message[];
  addMessage: (message: Message) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  vcResults: any[] | null;
  setVcResults: (results: any[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  vcResults: null,
  setVcResults: (results) => set({ vcResults: results }),
}));