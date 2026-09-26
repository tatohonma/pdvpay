import axios from 'axios';
import { useSettingsStore } from '../store/useSettingsStore';

export const api = axios.create({
	headers: {
		'Content-Type': 'application/json',
	},
});

api.interceptors.request.use((config) => {
	config.baseURL = useSettingsStore.getState().serverURL || '';
	return config;
});
