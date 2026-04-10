import { create } from 'zustand';
import type { ChatMessage } from '../types';
import { chatApi } from '../api/chat';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  nextCursor: number | null;
  activeRequestId: number | null;

  loadMessages: (requestId: number, cursor?: number) => Promise<void>;
  sendMessage: (requestId: number, data: FormData) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  setActiveRequest: (requestId: number | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  nextCursor: null,
  activeRequestId: null,

  loadMessages: async (requestId, cursor) => {
    set({ isLoading: true });
    try {
      const res = await chatApi.getMessages(requestId, { cursor, limit: 50 });
      const { messages: newMessages, next_cursor } = res.data.data;
      set((state) => ({
        messages: cursor ? [...newMessages, ...state.messages] : newMessages,
        nextCursor: next_cursor,
        isLoading: false,
        activeRequestId: requestId,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  sendMessage: async (requestId, data) => {
    const res = await chatApi.sendMessage(requestId, data);
    set((state) => ({
      messages: [...state.messages, res.data.data],
    }));
  },

  addMessage: (message) => {
    set((state) => {
      if (state.messages.some((m) => m.id === message.id)) return state;
      return { messages: [...state.messages, message] };
    });
  },

  setActiveRequest: (requestId) => set({ activeRequestId: requestId }),
  clearMessages: () => set({ messages: [], nextCursor: null, activeRequestId: null }),
}));
