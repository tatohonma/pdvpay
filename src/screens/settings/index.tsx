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
import DeviceInfo from 'react-native-device-info';
import { useAppStore } from '../../store/useAppStore';
import { useSettingsStore } from '../../store/useSettingsStore';

export const SettingsScreen = () => {
	const {
		serverURL,
		actions,
		homeMenuItems,
		serverConfig,
		terminalTab,
		ambientePos,
	} = useSettingsStore();
	const navigation = useNavigation();
	const [visible, setVisible] = useState<boolean>(false);
	const { pdv } = useAppStore();

	return (
		<View className="flex-1 bg-zinc-50">
			<ScrollView
				contentContainerClassName="flex-grow"
				keyboardShouldPersistTaps="handled"
			>
				<View className="w-full max-w-2xl self-center p-4 sm:p-6 md:p-10 gap-5">
					<View>
						<Text className="mb-2 font-semibold text-cyan-600">
							Configurações
						</Text>
						<View className="bg-white rounded-xl border border-zinc-100 shadow-sm p-3.5">
							<Text className="mb-1 text-xs font-medium text-zinc-500">
								Server URL
							</Text>
							<TextInput
								className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-800"
								value={serverURL}
								onChangeText={actions.setServerURL}
							/>
						</View>
					</View>

					<View className="bg-white rounded-xl border border-zinc-100 shadow-sm">
						<View className="flex-row items-center justify-between border-b border-b-zinc-100 px-3.5 py-3">
							<Text className="text-zinc-700">Mesa</Text>
							<Switch
								trackColor={{ true: '#10b981' }}
								thumbColor="#fff"
								value={homeMenuItems.mesa}
								onValueChange={() => actions.toggleHomeMenu('mesa')}
							/>
						</View>

						<View className="flex-row items-center justify-between border-b border-b-zinc-100 px-3.5 py-3">
							<Text className="text-zinc-700">Comanda</Text>
							<Switch
								trackColor={{ true: '#10b981' }}
								thumbColor="#fff"
								value={homeMenuItems.comanda}
								onValueChange={() => actions.toggleHomeMenu('comanda')}
							/>
						</View>

						<View className="flex-row items-center justify-between border-b border-b-zinc-100 px-3.5 py-3">
							<Text className="text-zinc-700">Ticket</Text>
							<Switch
								trackColor={{ true: '#10b981' }}
								thumbColor="#fff"
								value={homeMenuItems.ticket}
								onValueChange={() => actions.toggleHomeMenu('ticket')}
							/>
						</View>

						<View className="flex-row items-center justify-between border-b border-b-zinc-100 px-3.5 py-3">
							<Text className="text-zinc-700">Ambiente Pos</Text>
							<Switch
								trackColor={{ true: '#10b981' }}
								thumbColor="#fff"
								value={ambientePos}
								onValueChange={() => actions.toggleAmbientePos()}
							/>
						</View>

						<View className="flex-row items-center justify-between px-3.5 py-3">
							<View className="flex-1 mr-3">
								<Text className="text-zinc-700">Usar terminal tab</Text>
								<Text className="text-xs text-zinc-400">
									Recomendado para tablet (requer licença especifica)
								</Text>
							</View>

							<Switch
								trackColor={{ true: '#10b981' }}
								thumbColor="#fff"
								value={terminalTab}
								onValueChange={() => actions.toggleTerminalTab()}
							/>
						</View>
					</View>

					<Pressable
						onPress={() => setVisible(true)}
						className="bg-white rounded-xl border border-zinc-100 shadow-sm px-3.5 py-3 flex-row gap-2 items-center justify-between"
					>
						<Text className="font-medium text-zinc-700">
							Configurações recebidas
						</Text>
						<Lucide name="chevron-right" size={18} color="#a1a1aa" />
					</Pressable>

					<View>
						<Text className="mb-2 font-semibold text-cyan-600">
							Sobre o Aplicativo
						</Text>
						<View className="bg-white rounded-xl border border-zinc-100 shadow-sm p-3.5 gap-3">
							<View>
								<Text className="text-zinc-700 font-medium">Identificação</Text>
								<Text className="text-zinc-500 text-sm">
									Hardware: {DeviceInfo.getAndroidIdSync()}
								</Text>
								<Text className="text-zinc-500 text-sm">
									Comanda: {pdv.name} {pdv.idPDV}
								</Text>
							</View>

							<View>
								<Text className="text-zinc-700 font-medium">
									Sobre o programa
								</Text>
								<Text className="text-zinc-500 text-sm">
									Versão do app: {DeviceInfo.getAndroidIdSync()}
								</Text>
							</View>
						</View>
					</View>

					<TouchableOpacity
						className="mt-3 bg-emerald-500 items-center py-3 rounded-lg"
						onPress={() => navigation.navigate('Auth')}
					>
						<Text className="font-semibold text-white">OK</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>

			<Modal
				transparent
				visible={visible}
				animationType="fade"
				onRequestClose={() => setVisible(false)}
			>
				<TouchableWithoutFeedback onPress={() => setVisible(false)}>
					<View className="flex-1 justify-center items-center p-4 bg-black/40">
						<TouchableWithoutFeedback>
							<View className="p-5 bg-white rounded-2xl shadow-lg w-[92%] max-w-md max-h-[80%]">
								<Text className="font-semibold text-lg text-zinc-800 mb-3">
									Configurações recebidas
								</Text>
								<ScrollView>
									{Object.entries(serverConfig).map(([key, value]) => {
										return (
											<View
												className="flex-row gap-2 justify-between py-1.5 border-b border-b-zinc-100"
												key={key}
											>
												<Text className="text-xs font-medium text-zinc-600">
													{key}
												</Text>
												<Text className="text-xs text-zinc-500">
													{String(value)}
												</Text>
											</View>
										);
									})}
								</ScrollView>
							</View>
						</TouchableWithoutFeedback>
					</View>
				</TouchableWithoutFeedback>
			</Modal>
		</View>
	);
};
