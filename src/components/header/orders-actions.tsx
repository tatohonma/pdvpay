import { Lucide } from '@react-native-vector-icons/lucide';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity, View } from 'react-native';
import { queryClient } from '../../config/query';
import { useServerConfig, useSettingsStore } from '../../store/useSettingsStore';
import { CloseOrderModal } from './close-order-modal';
import { AskRefModal } from './ref-modal';
import { RequestPreAccountModal } from './request-pre-account';

export const OrderActions = () => {
	const navigation = useNavigation();
	const serverConfig = useServerConfig();
	const ambientePos = useSettingsStore((state) => state.ambientePos);

	return (
		<View className="flex-row gap-1">
			<TouchableOpacity
				onPress={() => {
					queryClient.invalidateQueries({ queryKey: ['categories'] });
					queryClient.invalidateQueries({ queryKey: ['products'] });
				}}
				className="p-1 rounded-full"
			>
				<Lucide name="rotate-cw" size={18} color="white" />
			</TouchableOpacity>
			{serverConfig?.MostrarLista === '1' && (
				<TouchableOpacity
					onPress={() => navigation.navigate('OrderDetails')}
					className="p-1 rounded-full"
				>
					<Lucide name="menu" size={18} color="white" />
				</TouchableOpacity>
			)}

			{serverConfig.SolicitarRef === '1' && <AskRefModal />}
			{ambientePos && <RequestPreAccountModal />}
			<CloseOrderModal />
			{/* {serverConfig.MostrarFecharConta === '1' && <CloseOrderModal />} */}
		</View>
	);
};
