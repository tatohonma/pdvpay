import type { StaticParamList } from '@react-navigation/native';
import type { RootStack } from './routes';

export type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
	namespace ReactNavigation {
		interface RootParamList extends RootStackParamList {}
	}
}
