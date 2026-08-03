import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { MMKVStorage } from '../config/mmkv';

type ServerConfigKeys =
	| 'ChaveUsuario'
	| 'SenhaSaida'
	| 'AbrirComanda'
	| 'ClienteCPFObrigatorio'
	| 'ClienteRGObrigatorio'
	| 'ClienteDataNascimentoObrigatorio'
	| 'SolicitarRef'
	| 'SolicitarPessoas'
	| 'MostrarResumo'
	| 'MostrarLista'
	| 'TipoCliente'
	| 'ImpressaoConta'
	| 'AutenticarSempre'
	| 'ProdutoViagem'
	| 'AskPrice'
	| 'UsarAreas'
	| 'AreasPadrao'
	| 'ReferenciaMesa'
	| 'ComandaComCheckin'
	| 'MostrarFecharConta'
	| 'SenhaMesa'
	| 'usarComanda'
	| 'VerifImagens';

type ServerConfig = Partial<Record<ServerConfigKeys, string | number | null>>;

type SettingsState = {
	serverURL: string | undefined;
	serverConfig: ServerConfig;
	terminalTab: boolean;
	homeMenuItems: {
		mesa: boolean;
		comanda: boolean;
		ticket: boolean;
	};
	actions: {
		setServerURL: (url: string) => void;
		toggleHomeMenu: (key: keyof SettingsState['homeMenuItems']) => void;
		toggleTerminalTab: () => void;
		updateServerConfig: (
			config: { chave: ServerConfigKeys; valor: string | null }[],
		) => void;
	};
};

export const useSettingsStore = create<SettingsState>()(
	persist(
		immer((set) => ({
			serverURL: undefined,
			terminalTab: false,
			serverConfig: {},
			homeMenuItems: {
				mesa: true,
				comanda: true,
				ticket: true,
			},

			actions: {
				setServerURL: (url) =>
					set((state) => {
						state.serverURL = url;
					}),

				toggleHomeMenu: (key) =>
					set((state) => {
						state.homeMenuItems[key] = !state.homeMenuItems[key];
					}),

				toggleTerminalTab: () => {
					set((state) => {
						state.terminalTab = !state.terminalTab;
					});
				},

				updateServerConfig: (config) =>
					set((state) => {
						config.forEach((item) => {
							state.serverConfig[item.chave as ServerConfigKeys] = item.valor;
						});
					}),
			},
		})),
		{
			name: '@pdvseven-settings-storage',
			storage: MMKVStorage,
			partialize: (state) => ({
				serverURL: state.serverURL,
				homeMenuItems: state.homeMenuItems,
				terminalTab: state.terminalTab,
			}),
		},
	),
);

export const useSettingsStoreActions = () =>
	useSettingsStore((state) => state.actions);

export const useServerURL = () => useSettingsStore((state) => state.serverURL);
export const useServerConfig = () =>
	useSettingsStore((state) => state.serverConfig);

export const useHomeMenuVisibility = () =>
	useSettingsStore((state) => state.homeMenuItems);
