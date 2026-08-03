import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from './navigation/routes';
import 'react-native-get-random-values';

import './global.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/query';
import { useEffect } from 'react';
import { useSettingsStore } from './store/useSettingsStore';
import Orientation from 'react-native-orientation-locker';

function App() {
	const { terminalTab } = useSettingsStore();

	useEffect(() => {
		if (terminalTab) {
			Orientation.lockToLandscape();
			return;
		}

		if (!terminalTab) {
			Orientation.lockToPortrait();
			return;
		}

		return () => {
			Orientation.unlockAllOrientations();
		};
	}, [terminalTab]);

	return (
		<SafeAreaProvider style={{ backgroundColor: '#f1f1f1' }}>
			<StatusBar barStyle="light-content" />
			<QueryClientProvider client={queryClient}>
				<Navigation />
			</QueryClientProvider>
		</SafeAreaProvider>
	);
}

export default App;
