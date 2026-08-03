import { createMMKV } from 'react-native-mmkv';
import { createJSONStorage } from 'zustand/middleware';

export const storage = createMMKV();

export const MMKVStorage = createJSONStorage(() => ({
	getItem: (key) => storage.getString(key) || null,
	setItem: (key, value) => storage.set(key, value),
	removeItem: (key) => storage.remove(key),
}));
