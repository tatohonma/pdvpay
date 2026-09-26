import { Lucide } from '@react-native-vector-icons/lucide';
import { memo, useCallback, useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { OptionButton } from '../../components/ui/option-button';
import { useOrderStore, useOrderStoreActions } from '../../store/useOrderStore';

interface extraInfoModalProps {
	product: {
		IDProduto: number;
		Nome: string;
		ValorUnitario: number;
	};
}

export const ExtraInfoModal = memo(function ExtraInfoModal({
	product,
}: extraInfoModalProps) {
	const [visible, setVisible] = useState<boolean>(false);
	const actions = useOrderStoreActions();
	const selectedQtd = useOrderStore(
		(state) =>
			state.selectedProducts.find((e) => e.idProduto === product.IDProduto)
				?.qtd,
	);

	const [values, setValues] = useState({
		amount: 1,
		observation: '',
	});

	const handleAddPress = useCallback(() => {
		actions.addSelectedProduct({
			idProduto: product.IDProduto,
			qtd: 1,
			viagem: 0,
			notas: '',
			nome: product.Nome,
			valorUnitario: product.ValorUnitario,
		});
	}, [actions, product.IDProduto, product.Nome, product.ValorUnitario]);

	const handleLongPress = useCallback(() => setVisible(true), []);

	return (
		<>
			<OptionButton
				onPress={handleAddPress}
				onLongPress={handleLongPress}
				title={product.Nome}
				textStyles="h-16"
			>
				<Text className="absolute left-4 bottom-2.5 text-xs p-0.5">
					{selectedQtd ?? ''}
				</Text>
			</OptionButton>
			<Modal
				transparent
				visible={visible}
				animationType="fade"
				onRequestClose={() => setVisible(false)}
			>
				<View className="flex-1 justify-center items-center p-4 bg-black/40">
					<View className="p-5 bg-white rounded-2xl shadow-lg w-[92%] max-w-md">
						<Text
							numberOfLines={2}
							className="font-semibold text-lg text-zinc-800 mb-4"
						>
							{product.Nome}
						</Text>

						<Text className="text-xs font-medium text-zinc-500 mb-1.5">
							Quantidade
						</Text>
						<View className="flex-row items-center gap-3 mb-4">
							<TouchableOpacity
								className="w-10 h-10 rounded-lg bg-zinc-100 items-center justify-center"
								onPress={() =>
									setValues((s) => ({
										...s,
										amount: Math.max(1, s.amount - 1),
									}))
								}
							>
								<Lucide name="minus" size={18} color="#3f3f46" />
							</TouchableOpacity>
							<TextInput
								className="flex-1 h-10 rounded-lg bg-zinc-100 text-center text-zinc-800 font-medium"
								inputMode="numeric"
								value={values.amount.toString()}
								onChangeText={(v) =>
									setValues((s) => ({ ...s, amount: Number(v) || 1 }))
								}
							/>
							<TouchableOpacity
								className="w-10 h-10 rounded-lg bg-zinc-100 items-center justify-center"
								onPress={() =>
									setValues((s) => ({ ...s, amount: s.amount + 1 }))
								}
							>
								<Lucide name="plus" size={18} color="#3f3f46" />
							</TouchableOpacity>
						</View>

						<Text className="text-xs font-medium text-zinc-500 mb-1.5">
							Observação
						</Text>
						<TextInput
							value={values.observation}
							placeholder="Ex: sem cebola, ponto da carne, etc."
							placeholderTextColor="#a1a1aa"
							multiline
							numberOfLines={3}
							textAlignVertical="top"
							className="border border-zinc-200 rounded-lg px-3 py-2 text-zinc-800 min-h-20"
							onChangeText={(v) =>
								setValues((s) => ({ ...s, observation: v }))
							}
						/>

						<View className="flex-row mt-5 items-center justify-end gap-3">
							<TouchableOpacity
								onPress={() => setVisible(false)}
								className="px-4 py-2.5 rounded-lg bg-zinc-100"
							>
								<Text className="text-zinc-600 font-medium">Cancelar</Text>
							</TouchableOpacity>
							<TouchableOpacity
								className="px-5 py-2.5 rounded-lg bg-emerald-500"
								onPress={() => {
									actions.setSelectedProduct({
										idProduto: product.IDProduto,
										qtd: values.amount,
										viagem: 0,
										notas: values.observation,
										nome: product.Nome,
										valorUnitario: product.ValorUnitario,
									});

									setVisible(false);
								}}
							>
								<Text className="text-white font-semibold">Adicionar</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</>
	);
});
