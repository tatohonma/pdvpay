import { useState } from 'react';
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

export const ExtraInfoModal = ({ product }: extraInfoModalProps) => {
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

	return (
		<>
			<OptionButton
				onPress={() => {
					actions.addSelectedProduct({
						idProduto: product.IDProduto,
						qtd: 1,
						viagem: 0,
						notas: '',
						nome: product.Nome,
						valorUnitario: product.ValorUnitario,
					});
				}}
				onLongPress={() => setVisible(true)}
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
				onRequestClose={() => setVisible(false)}
			>
				<View className="flex-1 justify-center items-center p-4">
					<View className="p-4 bg-zinc-50 rounded shadow-lg w-[92%] max-w-md">
						<View>
							<Text className="font-semibold text-lg mb-4">{product.Nome}</Text>
							<Text className="text-xs">Quantidade:</Text>
							<TextInput
								className="border-b border-b-zinc-400"
								inputMode="numeric"
								value={values.amount.toString()}
								onChangeText={(v) =>
									setValues((s) => ({ ...s, amount: Number(v) }))
								}
							/>
							<Text className="text-xs mt-2">Observação:</Text>
							<TextInput
								value={values.observation}
								className="border-b border-b-zinc-400 w-full"
								onChangeText={(v) =>
									setValues((s) => ({ ...s, observation: v }))
								}
							/>
						</View>
						<View className="flex-row mt-4 items-center justify-end gap-4">
							<TouchableOpacity onPress={() => setVisible(false)}>
								<Text>Cancelar</Text>
							</TouchableOpacity>
							<TouchableOpacity
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
								<Text>OK</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</>
	);
};
