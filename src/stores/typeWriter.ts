import { create } from 'zustand';

type TypewriterState = {
  speed: number;
  text: string;
  count: number;
  setSpeed: (speed: number) => void;
  setText: (text: string) => void;
  incrementCount: () => void;
};

export const useTypeWriterStore = create<TypewriterState>((set) => ({
  speed: 80,
  text: '',
  count: 0,
  setSpeed: (speed: number) => set({ speed }),
  setText: (text: string) => set({ text }),
  incrementCount: () => set((state) => ({ count: state.count + 1 })),
}));
