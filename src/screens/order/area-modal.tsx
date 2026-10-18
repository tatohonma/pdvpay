import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { PrintAreaOption } from '../../utils/print-areas';

interface AreaModalProps {
	productNames: string[];
	options: PrintAreaOption[];
	onCancel: () => void;
	onSelect: (idArea: number) => void;
}

export const AreaModal = ({
	productNames,
	options,
	onCancel,
	onSelect,
}: AreaModalProps) => (
	<Modal transparent visible animationType="fade" onRequestClose={onCancel}>
		<View className="flex-1 justify-center items-center p-4 bg-black/40">
			<View className="p-5 bg-white rounded-2xl shadow-lg w-[92%] max-w-md max-h-[90%]">
				<Text className="font-semibold text-lg text-zinc-800">
					Informe a área de produção
				</Text>
				<Text className="text-xs text-zinc-500 mb-4">
					{productNames.join(', ')}
				</Text>

				<ScrollView className="grow-0">
					<View className="gap-1.5">
						{options.map((area) => (
							<TouchableOpacity
								key={area.id}
								activeOpacity={0.7}
								onPress={() => onSelect(area.id)}
								className="px-3 py-3 rounded-lg border border-zinc-200 bg-white"
							>
								<Text className="text-zinc-800 font-medium">{area.nome}</Text>
							</TouchableOpacity>
						))}
					</View>
				</ScrollView>

				<View className="flex-row mt-5 items-center justify-end">
					<TouchableOpacity
						onPress={onCancel}
						className="px-4 py-2.5 rounded-lg bg-zinc-100"
					>
						<Text className="text-zinc-600 font-medium">Cancelar</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	</Modal>
);
