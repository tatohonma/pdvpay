import { Lucide } from '@react-native-vector-icons/lucide';
import { memo, useCallback, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	Modal,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { OptionButton } from '../../components/ui/option-button';
import { type Product, useModifierProducts } from '../../hooks/useGetProducts';
import {
	type AddProductInput,
	type OrderProductModifier,
	useOrderStore,
	useOrderStoreActions,
} from '../../store/useOrderStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/format';
import { PriceModal } from './price-modal';

type ModalProduct = Pick<
	Product,
	'IDProduto' | 'Nome' | 'ValorUnitario' | 'PaineisDeModificacao'
>;

type PendingItem = Omit<AddProductInput, 'valorUnitario' | 'valorInformado'>;

interface extraInfoModalProps {
	product: ModalProduct;
}

export const ExtraInfoModal = memo(function ExtraInfoModal({
	product,
}: extraInfoModalProps) {
	const [visible, setVisible] = useState<boolean>(false);
	const actions = useOrderStoreActions();
	const askPrice = useSettingsStore(
		(state) => String(state.serverConfig.AskPrice) === '1',
	);
	// Soma todas as linhas do produto (podem existir várias com modificadores diferentes)
	const selectedQtd = useOrderStore((state) =>
		state.selectedProducts.reduce(
			(acc, e) => (e.idProduto === product.IDProduto ? acc + e.qtd : acc),
			0,
		),
	);
	const informedPrice = useOrderStore(
		(state) =>
			state.selectedProducts.find((e) => e.idProduto === product.IDProduto)
				?.valorUnitario,
	);
	const [pendingAdd, setPendingAdd] = useState<PendingItem | null>(null);

	const hasModifiers = product.PaineisDeModificacao?.some(
		(p) => p.Produtos?.length > 0,
	);

	// Produto sem preço cadastrado: o preço é informado pelo operador
	const asksPrice = askPrice && product.ValorUnitario === 0;
	// Pergunta só na primeira vez; as próximas linhas reaproveitam o preço informado
	const needsPrice = asksPrice && informedPrice === undefined;

	const addItem = useCallback(
		(item: PendingItem) => {
			if (needsPrice) {
				setPendingAdd(item);
				return;
			}

			actions.addSelectedProduct({
				...item,
				valorUnitario: informedPrice ?? product.ValorUnitario,
				valorInformado: asksPrice,
			});
		},
		[actions, needsPrice, asksPrice, informedPrice, product.ValorUnitario],
	);

	const handleAddPress = useCallback(() => {
		if (hasModifiers) {
			setVisible(true);
			return;
		}

		addItem({
			idProduto: product.IDProduto,
			qtd: 1,
			viagem: 0,
			notas: '',
			nome: product.Nome,
			modificacoes: [],
		});
	}, [addItem, hasModifiers, product.IDProduto, product.Nome]);

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
			{visible && (
				<ProductDetailsModal
					product={product}
					onCancel={() => setVisible(false)}
					onConfirm={(item) => {
						setVisible(false);
						addItem(item);
					}}
				/>
			)}
			{pendingAdd && (
				<PriceModal
					visible
					productName={product.Nome}
					onCancel={() => setPendingAdd(null)}
					onConfirm={(price) => {
						actions.addSelectedProduct({
							...pendingAdd,
							valorUnitario: price,
							valorInformado: true,
						});
						setPendingAdd(null);
					}}
				/>
			)}
		</>
	);
});

interface ProductDetailsModalProps {
	product: ModalProduct;
	onCancel: () => void;
	onConfirm: (item: PendingItem) => void;
}

const ProductDetailsModal = ({
	product,
	onCancel,
	onConfirm,
}: ProductDetailsModalProps) => {
	const modifierProducts = useModifierProducts();
	const [values, setValues] = useState({
		amount: 1,
		observation: '',
	});
	const [selectedIds, setSelectedIds] = useState<number[]>([]);

	const panels = useMemo(
		() =>
			(product.PaineisDeModificacao ?? [])
				.map((panel) => ({
					id: panel.IDPainelModificacao,
					title: panel.Titulo || panel.Nome,
					options: [...(panel.Produtos ?? [])]
						.sort((a, b) => a.Ordem - b.Ordem)
						.flatMap((m): OrderProductModifier[] => {
							const info = modifierProducts.data?.get(m.IDProduto);

							if (
								info &&
								(info.Excluido || !info.Ativo || !info.Disponibilidade)
							) {
								return [];
							}

							return [
								{
									idProduto: m.IDProduto,
									nome: info?.Nome ?? `Produto ${m.IDProduto}`,
									valor: m.Valor,
								},
							];
						}),
				}))
				.filter((panel) => panel.options.length > 0),
		[product.PaineisDeModificacao, modifierProducts.data],
	);

	const toggleModifier = (id: number) =>
		setSelectedIds((ids) =>
			ids.includes(id) ? ids.filter((e) => e !== id) : [...ids, id],
		);

	const handleConfirm = () => {
		const modificacoes = new Map<number, OrderProductModifier>();

		for (const panel of panels) {
			for (const option of panel.options) {
				if (selectedIds.includes(option.idProduto)) {
					modificacoes.set(option.idProduto, option);
				}
			}
		}

		onConfirm({
			idProduto: product.IDProduto,
			qtd: values.amount,
			viagem: 0,
			notas: values.observation,
			nome: product.Nome,
			modificacoes: [...modificacoes.values()],
		});
	};

	const renderModifiers = () => {
		if (modifierProducts.isLoading) {
			return (
				<View className="py-4 items-center">
					<ActivityIndicator color="#10b981" />
				</View>
			);
		}

		if (modifierProducts.isError) {
			return (
				<Text className="text-xs text-red-500 mb-4">
					Não foi possível carregar os modificadores
				</Text>
			);
		}

		return panels.map((panel) => (
			<View key={panel.id} className="mb-4">
				<Text className="text-xs font-medium text-zinc-500 mb-1.5">
					{panel.title}
				</Text>
				<View className="gap-1.5">
					{panel.options.map((option) => {
						const selected = selectedIds.includes(option.idProduto);

						return (
							<TouchableOpacity
								key={option.idProduto}
								activeOpacity={0.7}
								onPress={() => toggleModifier(option.idProduto)}
								className={cn(
									'flex-row items-center gap-2 px-3 py-2.5 rounded-lg border',
									selected
										? 'border-emerald-500 bg-emerald-50'
										: 'border-zinc-200 bg-white',
								)}
							>
								<Lucide
									name={selected ? 'square-check' : 'square'}
									size={18}
									color={selected ? '#10b981' : '#a1a1aa'}
								/>
								<Text numberOfLines={1} className="flex-1 text-zinc-800">
									{option.nome}
								</Text>
								{option.valor > 0 && (
									<Text className="text-xs text-zinc-500">
										+ {formatCurrency(option.valor)}
									</Text>
								)}
							</TouchableOpacity>
						);
					})}
				</View>
			</View>
		));
	};

	return (
		<Modal transparent visible animationType="fade" onRequestClose={onCancel}>
			<View className="flex-1 justify-center items-center p-4 bg-black/40">
				<View className="p-5 bg-white rounded-2xl shadow-lg w-[92%] max-w-md max-h-[90%]">
					<Text
						numberOfLines={2}
						className="font-semibold text-lg text-zinc-800 mb-4"
					>
						{product.Nome}
					</Text>

					<ScrollView className="grow-0" keyboardShouldPersistTaps="handled">
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

						{renderModifiers()}

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
					</ScrollView>

					<View className="flex-row mt-5 items-center justify-end gap-3">
						<TouchableOpacity
							onPress={onCancel}
							className="px-4 py-2.5 rounded-lg bg-zinc-100"
						>
							<Text className="text-zinc-600 font-medium">Cancelar</Text>
						</TouchableOpacity>
						<TouchableOpacity
							className="px-5 py-2.5 rounded-lg bg-emerald-500"
							onPress={handleConfirm}
						>
							<Text className="text-white font-semibold">Adicionar</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
};
