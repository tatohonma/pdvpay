import { Lucide } from '@react-native-vector-icons/lucide';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
	Modal,
	Pressable,
	ScrollView,
	Switch,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from 'react-native';
import { useSettingsStore } from '../../store/useSettingsStore';
import DeviceInfo from 'react-native-device-info';
import { useAppStore } from '../../store/useAppStore';

export const SettingsScreen = () => {
	const { serverURL, actions, homeMenuItems, serverConfig, terminalTab } =
		useSettingsStore();
	const navigation = useNavigation();
	const [visible, setVisible] = useState<boolean>(false);
	const { pdv } = useAppStore();

	return (
		<View className="flex-1">
			<ScrollView
				contentContainerClassName="flex-grow"
				keyboardShouldPersistTaps="handled"
			>
				<View className="w-full max-w-2xl self-center p-4 sm:p-6 md:p-10">
					<Text className="mb-2 font-medium text-cyan-600">Configurações</Text>
					<Text className="mb-0.5 mt-1 text-sm">Server URL</Text>
					<TextInput
						className="border-b border-b-zinc-200"
						value={serverURL}
						onChangeText={actions.setServerURL}
					/>
					<View className="mt-4">
						<View className="flex-row items-end justify-between border-b border-b-zinc-200 p-2.5">
							<Text>Mesa</Text>
							<Switch
								value={homeMenuItems.mesa}
								onValueChange={() => actions.toggleHomeMenu('mesa')}
							/>
						</View>

						<View className="flex-row items-end justify-between border-b border-b-zinc-200 p-2.5">
							<Text>Comanda</Text>
							<Switch
								value={homeMenuItems.comanda}
								onValueChange={() => actions.toggleHomeMenu('comanda')}
							/>
						</View>

						<View className="flex-row items-end justify-between border-b border-b-zinc-200 p-2.5">
							<Text>Ticket</Text>
							<Switch
								value={homeMenuItems.ticket}
								onValueChange={() => actions.toggleHomeMenu('ticket')}
							/>
						</View>

						<View className="flex-row items-end justify-between border-b border-b-zinc-200 p-2.5">
							<View>
								<Text>Usar terminal tab</Text>
								<Text className="text-xs text-zinc-600 font-extralight">
									Recomendado para tablet (requer licença especifica)
								</Text>
							</View>

							<Switch
								value={terminalTab}
								onValueChange={() => actions.toggleTerminalTab()}
							/>
						</View>
					</View>

					<View className="mt-4">
						<Pressable
							onPress={() => setVisible(true)}
							className="p-2 border-b border-b-zinc-200 flex-row gap-2 items-start"
						>
							<Text className="mb-3 font-medium">Configurações recebidas</Text>
							<Lucide name="search" size={16} />
						</Pressable>
					</View>

					<View className="mt-4">
					<Text className="mb-2 font-medium text-cyan-600">
						Sobre o Aplicativo
					</Text>
					<Text>Identificação</Text>
					<Text className="text-zinc-500">
						Hardware: {DeviceInfo.getAndroidIdSync()}
					</Text>
					<Text className="text-zinc-500">
						Comanda: {pdv.name} {pdv.idPDV}
					</Text>

					<Text className="mt-2">Sobre o programa</Text>
					<Text className="text-zinc-500">
						Versão do app: {DeviceInfo.getAndroidIdSync()}
					</Text>
				</View>

				<TouchableOpacity
					className="mt-8 bg-emerald-500 items-center py-2 rounded"
					onPress={() => navigation.navigate('Auth')}
				>
					<Text className="font-semibold text-white">OK</Text>
				</TouchableOpacity>
				</View>
			</ScrollView>

			<Modal
				transparent
				visible={visible}
				onRequestClose={() => setVisible(false)}
			>
				<TouchableWithoutFeedback onPress={() => setVisible(false)}>
					<View className="flex-1 justify-center items-center p-4">
						<View className="p-4 bg-zinc-50 rounded shadow-lg w-[92%] max-w-md">
							<Text className="font-medium">Configurações recebidas</Text>
							<View className="mt-4">
								{Object.entries(serverConfig).map(([key, value]) => {
									return (
										<View className="flex-row gap-2 mt-0.5" key={key}>
											<Text className="text-xs font-medium">{key}</Text>
											<Text className="text-xs text-zinc-600">
												{String(value)}
											</Text>
										</View>
									);
								})}
							</View>
						</View>
					</View>
				</TouchableWithoutFeedback>
			</Modal>
		</View>
	);
};
