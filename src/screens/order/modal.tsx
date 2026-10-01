import { Lucide } from '@react-native-vector-icons/lucide';
import { memo, useCallback, useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { OptionButton } from '../../components/ui/option-button';
import { useOrderStore, useOrderStoreActions } from '../../store/useOrderStore';
import { useServerConfig } from '../../store/useSettingsStore';
import { PriceModal } from './price-modal';

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
	const serverConfig = useServerConfig();
	const selectedItem = useOrderStore((state) =>
		state.selectedProducts.find((e) => e.idProduto === product.IDProduto),
	);
	const selectedQtd = selectedItem?.qtd;
	const [pendingAdd, setPendingAdd] = useState<{
		qtd: number;
		notas: string;
		mode: 'add' | 'set';
	} | null>(null);

	// Produto sem preço cadastrado e ainda sem preço informado neste pedido
	const needsPrice =
		String(serverConfig.AskPrice) === '1' &&
		product.ValorUnitario === 0 &&
		!selectedItem;

	const [values, setValues] = useState({
		amount: 1,
		observation: '',
	});

	const handleAddPress = useCallback(() => {
		if (needsPrice) {
			setPendingAdd({ qtd: 1, notas: '', mode: 'add' });
			return;
		}

		actions.addSelectedProduct({
			idProduto: product.IDProduto,
			qtd: 1,
			viagem: 0,
			notas: '',
			nome: product.Nome,
			valorUnitario: product.ValorUnitario,
		});
	}, [actions, needsPrice, product.IDProduto, product.Nome, product.ValorUnitario]);

	const handleLongPress = useCallback(() => setVisible(true), []);

	return (
		<>
			<OptionButton
				onPress={handleAddPress}
				onLongPress={handleLongPress}
				title={product.Nome}
				textStyles="h-16"
			>
				{!!selectedQtd && (
					<View className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 items-center justify-center">
						<Text className="text-white text-[11px] font-bold">
							{selectedQtd}
						</Text>
					</View>
				)}
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
							onChangeText={(v) => setValues((s) => ({ ...s, observation: v }))}
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
									if (needsPrice) {
										setPendingAdd({
											qtd: values.amount,
											notas: values.observation,
											mode: 'set',
										});
										setVisible(false);
										return;
									}

									actions.setSelectedProduct({
										idProduto: product.IDProduto,
										qtd: values.amount,
										viagem: 0,
										notas: values.observation,
										nome: product.Nome,
										valorUnitario:
											selectedItem?.valorUnitario || product.ValorUnitario,
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
			<PriceModal
				visible={!!pendingAdd}
				productName={product.Nome}
				onCancel={() => setPendingAdd(null)}
				onConfirm={(price) => {
					if (!pendingAdd) return;

					const item = {
						idProduto: product.IDProduto,
						qtd: pendingAdd.qtd,
						viagem: 0,
						notas: pendingAdd.notas,
						nome: product.Nome,
						valorUnitario: price,
					};

					if (pendingAdd.mode === 'set') actions.setSelectedProduct(item);
					else actions.addSelectedProduct(item);

					setPendingAdd(null);
				}}
			/>
		</>
	);
});
