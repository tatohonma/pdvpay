import { create } from 'zustand';

type TabStore = {
	index: number;
	setIndex: (i: number) => void;
};

export const useTabStore = create<TabStore>((set) => ({
	index: 0,
	setIndex: (i) => set({ index: i }),
}));
