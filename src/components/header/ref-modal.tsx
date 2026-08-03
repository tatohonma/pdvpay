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
				onRequestClose={() => setVisible(false)}
			>
				<View className="flex-1 justify-center items-center p-4">
					<View className="p-4 bg-zinc-50 rounded shadow-lg w-[92%] max-w-md">
						<Text className="text-xs">Referência:</Text>
						<TextInput
							className="border-b border-b-zinc-400"
							value={currentOrderInfo?.referenciaLocalizacao ?? ''}
							onChangeText={actions.setLocationRef}
						/>
						<View className="flex-row mt-4 items-center justify-end gap-4">
							<TouchableOpacity onPress={() => setVisible(false)}>
								<Text>Cancelar</Text>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => setVisible(false)}>
								<Text>OK</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</>
	);
};
