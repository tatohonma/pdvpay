import axios from 'axios';
import { useSettingsStore } from '../store/useSettingsStore';

const baseURL = useSettingsStore.getState().serverURL || '';

export const api = axios.create({
	baseURL,
	headers: {
		'Content-Type': 'application/json',
	},
});
