import { create } from 'zustand';

interface AppStoreActions {
	setUser: (id: number, name: string) => void;
	setPdv: ({
		idPDV,
		name,
		versaoWS,
	}: {
		idPDV: number;
		name: string;
		versaoWS: string;
	}) => void;
}

interface AppState {
	user: {
		id?: number;
		name?: string;
	};
	pdv: {
		idPDV?: number;
		name?: string;
		versaoWS?: string;
	};
	actions: AppStoreActions;
}

export const useAppStore = create<AppState>((set) => ({
	user: {
		id: undefined,
		name: undefined,
	},
	pdv: {
		idPDV: undefined,
		name: undefined,
		versaoWS: undefined,
	},
	actions: {
		setUser: (id: number, name: string) => {
			set({ user: { id, name } });
		},
		setPdv: (data) => {
			set({ pdv: data });
		},
	},
}));

export const useUser = () => useAppStore((state) => state.user);
export const usePDV = () => useAppStore((state) => state.pdv);
export const useAppStoreActions = () => useAppStore((state) => state.actions);
