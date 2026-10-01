import { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface PriceModalProps {
	visible: boolean;
	productName: string;
	onCancel: () => void;
	onConfirm: (price: number) => void;
}

const parsePrice = (value: string) => Number(value.replace(',', '.'));

export const PriceModal = ({
	visible,
	productName,
	onCancel,
	onConfirm,
}: PriceModalProps) => {
	const [value, setValue] = useState('');
	const price = parsePrice(value);
	const isValid = value.trim() !== '' && Number.isFinite(price) && price >= 0;

	const handleCancel = () => {
		setValue('');
		onCancel();
	};

	const handleConfirm = () => {
		if (!isValid) return;
		setValue('');
		onConfirm(price);
	};

	return (
		<Modal
			transparent
			visible={visible}
			animationType="fade"
			onRequestClose={handleCancel}
		>
			<View className="flex-1 justify-center items-center p-4 bg-black/40">
				<View className="p-5 bg-white rounded-2xl shadow-lg w-[92%] max-w-md">
					<Text className="text-xs font-medium text-zinc-500">
						Informe o preço
					</Text>
					<Text
						numberOfLines={2}
						className="font-semibold text-lg text-zinc-800 mb-4"
					>
						{productName}
					</Text>

					<TextInput
						autoFocus
						value={value}
						onChangeText={setValue}
						inputMode="decimal"
						placeholder="0,00"
						placeholderTextColor="#a1a1aa"
						className="h-11 rounded-lg bg-zinc-100 text-center text-zinc-800 font-medium"
					/>

					<View className="flex-row mt-5 items-center justify-end gap-3">
						<TouchableOpacity
							onPress={handleCancel}
							className="px-4 py-2.5 rounded-lg bg-zinc-100"
						>
							<Text className="text-zinc-600 font-medium">Cancelar</Text>
						</TouchableOpacity>
						<TouchableOpacity
							disabled={!isValid}
							onPress={handleConfirm}
							className={`px-5 py-2.5 rounded-lg bg-emerald-500 ${isValid ? '' : 'opacity-50'}`}
						>
							<Text className="text-white font-semibold">Confirmar</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
};
