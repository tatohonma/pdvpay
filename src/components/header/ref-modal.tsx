import Lucide from '@react-native-vector-icons/lucide';
import { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useOrderStore } from '../../store/useOrderStore';

export const AskRefModal = () => {
	const [visible, setVisible] = useState<boolean>(false);
	const { actions, currentOrderInfo } = useOrderStore();

	return (
		<>
			<TouchableOpacity
				onPress={() => setVisible(true)}
				className="p-1 rounded-full"
			>
				<Lucide name="map-pin" size={18} color="white" />
			</TouchableOpacity>
			<Modal
				transparent
				visible={visible}
				animationType="fade"
				onRequestClose={() => setVisible(false)}
			>
				<View className="flex-1 justify-center items-center p-4 bg-black/40">
					<View className="p-5 bg-white rounded-2xl shadow-lg w-[92%] max-w-md">
						<Text className="text-xs font-medium text-zinc-500 mb-1.5">
							Referência
						</Text>
						<TextInput
							className="border border-zinc-200 rounded-lg px-3 py-2 text-zinc-800"
							value={currentOrderInfo?.referenciaLocalizacao ?? ''}
							onChangeText={actions.setLocationRef}
						/>
						<View className="flex-row mt-5 items-center justify-end gap-3">
							<TouchableOpacity
								onPress={() => setVisible(false)}
								className="px-4 py-2.5 rounded-lg bg-zinc-100"
							>
								<Text className="text-zinc-600 font-medium">Cancelar</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => setVisible(false)}
								className="px-5 py-2.5 rounded-lg bg-emerald-500"
							>
								<Text className="text-white font-semibold">OK</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</>
	);
};
