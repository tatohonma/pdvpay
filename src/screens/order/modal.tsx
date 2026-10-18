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
import {
	type PainelDeModificacao,
	type Product,
	useModifierProducts,
} from '../../hooks/useGetProducts';
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

// A API pode mandar um objeto solto (ou null) no lugar de uma lista
const toArray = <T,>(value: T[] | T | null | undefined): T[] => {
	if (Array.isArray(value)) return value;
	return value ? [value] : [];
};

type Panel = {
	key: string;
	title: string;
	/** Mínimo de opções; 0 = opcional. */
	min: number;
	/** Máximo de opções; 0 = sem limite. */
	max: number;
	options: OrderProductModifier[];
};

const getPanelHint = ({ min, max }: Panel) => {
	if (min && max)
		return min === max ? `Escolha ${min}` : `Escolha de ${min} a ${max}`;
	if (min) return `Escolha pelo menos ${min}`;
	if (max) return `Escolha até ${max}`;
	return '';
};

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

	const hasModifiers = toArray(product.PaineisDeModificacao).some(
		(p) => toArray(p?.Produtos).length > 0,
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
	const advanced = useSettingsStore((state) => state.advancedModifierPanel);
	const [step, setStep] = useState(0);
	const [values, setValues] = useState({
		amount: 1,
		observation: '',
	});
	// Seleção por painel: o mesmo modificador pode estar em mais de um painel
	const [selected, setSelected] = useState<Record<string, number[]>>({});

	const panels = useMemo(
		(): Panel[] =>
			toArray(product.PaineisDeModificacao)
				.filter((panel): panel is PainelDeModificacao => panel != null)
				.map((panel, index) => ({
					// O mesmo painel pode vir repetido; chave duplicada derruba o app no Fabric
					key: `${panel.IDPainelModificacao}-${index}`,
					title: String(panel.Titulo || panel.Nome || ''),
					min: Number(panel.Min) || 0,
					// 0 = sem limite
					max: Number(panel.Max) || 0,
					options: toArray(panel.Produtos)
						.filter(Boolean)
						.sort((a, b) => (a.Ordem ?? 0) - (b.Ordem ?? 0))
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
									nome: String(info?.Nome ?? `Produto ${m.IDProduto}`),
									valor: Number(m.Valor) || 0,
								},
							];
						}),
				}))
				.filter((panel) => panel.options.length > 0)
				.map((panel) => ({
					...panel,
					// Opções indisponíveis podem deixar o painel com menos itens que o mínimo
					min: Math.min(panel.min, panel.options.length),
				})),
		[product.PaineisDeModificacao, modifierProducts.data],
	);

	// No modo avançado cada painel vira uma etapa; a última reúne quantidade e observação
	const isAdvancedLoading = advanced && modifierProducts.isLoading;
	const panelSteps =
		advanced && !modifierProducts.isLoading && !modifierProducts.isError
			? panels
			: [];
	const currentPanel = panelSteps[step];
	const isLastStep = step >= panelSteps.length;

	const countSelected = (panel: Panel) => selected[panel.key]?.length ?? 0;
	const meetsMin = (panel: Panel) => countSelected(panel) >= panel.min;

	// Sem modificadores carregados o item segue sem eles, como já acontecia
	const modifiersReady =
		!modifierProducts.isLoading && !modifierProducts.isError;
	const canConfirm = currentPanel
		? meetsMin(currentPanel)
		: !isAdvancedLoading && (!modifiersReady || panels.every(meetsMin));

	const goBack = () => (step > 0 ? setStep((s) => s - 1) : onCancel());

	const toggleModifier = (panel: Panel, id: number) =>
		setSelected((state) => {
			const ids = state[panel.key] ?? [];

			if (ids.includes(id)) {
				return { ...state, [panel.key]: ids.filter((e) => e !== id) };
			}

			// Máximo 1 funciona como escolha única: troca a opção marcada
			if (panel.max === 1) return { ...state, [panel.key]: [id] };
			if (panel.max && ids.length >= panel.max) return state;

			return { ...state, [panel.key]: [...ids, id] };
		});

	const handleConfirm = () => {
		const modificacoes = new Map<number, OrderProductModifier>();

		for (const panel of panels) {
			const ids = selected[panel.key] ?? [];

			for (const option of panel.options) {
				if (ids.includes(option.idProduto)) {
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

		return panels.map(renderPanel);
	};

	const renderPanel = (panel: Panel) => {
		const ids = selected[panel.key] ?? [];
		const single = panel.max === 1;
		const isFull = panel.max > 1 && ids.length >= panel.max;
		const hint = getPanelHint(panel);

		return (
			<View key={panel.key} className="mb-4">
				<View className="flex-row items-baseline justify-between gap-2 mb-1.5">
					<Text className="flex-1 text-xs font-medium text-zinc-500">
						{panel.title}
					</Text>
					{!!hint && (
						<Text
							className={cn(
								'text-xs',
								meetsMin(panel) ? 'text-zinc-400' : 'text-red-500',
							)}
						>
							{hint}
						</Text>
					)}
				</View>
				<View className="gap-1.5">
					{panel.options.map((option, index) => {
						const checked = ids.includes(option.idProduto);
						const blocked = isFull && !checked;
						const checkedIcon = single ? 'circle-check' : 'square-check';
						const uncheckedIcon = single ? 'circle' : 'square';

						return (
							<TouchableOpacity
								key={`${option.idProduto}-${index}`}
								activeOpacity={0.7}
								disabled={blocked}
								onPress={() => toggleModifier(panel, option.idProduto)}
								className={cn(
									'flex-row items-center gap-2 px-3 py-2.5 rounded-lg border',
									checked
										? 'border-emerald-500 bg-emerald-50'
										: 'border-zinc-200 bg-white',
									blocked && 'opacity-40',
								)}
							>
								<Lucide
									name={checked ? checkedIcon : uncheckedIcon}
									size={18}
									color={checked ? '#10b981' : '#a1a1aa'}
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
		);
	};

	const renderDetails = () => (
		<>
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
					onPress={() => setValues((s) => ({ ...s, amount: s.amount + 1 }))}
				>
					<Lucide name="plus" size={18} color="#3f3f46" />
				</TouchableOpacity>
			</View>

			{/* No modo avançado os painéis já passaram nas etapas anteriores */}
			{!advanced || modifierProducts.isError ? renderModifiers() : null}

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
		</>
	);

	const renderBody = () => {
		if (isAdvancedLoading) {
			return (
				<View className="py-8 items-center">
					<ActivityIndicator color="#10b981" />
				</View>
			);
		}

		return currentPanel ? renderPanel(currentPanel) : renderDetails();
	};

	return (
		<Modal transparent visible animationType="fade" onRequestClose={goBack}>
			<View className="flex-1 justify-center items-center p-4 bg-black/40">
				<View className="p-5 bg-white rounded-2xl shadow-lg w-[92%] max-w-md max-h-[90%]">
					<Text
						numberOfLines={2}
						className={cn(
							'font-semibold text-lg text-zinc-800',
							panelSteps.length > 0 ? 'mb-0.5' : 'mb-4',
						)}
					>
						{product.Nome}
					</Text>
					{panelSteps.length > 0 && (
						<Text className="text-xs text-zinc-400 mb-4">
							Etapa {step + 1} de {panelSteps.length + 1}
						</Text>
					)}

					{/* A chave remonta o scroll para cada etapa começar do topo */}
					<ScrollView
						key={step}
						className="grow-0"
						keyboardShouldPersistTaps="handled"
					>
						{renderBody()}
					</ScrollView>

					<View className="flex-row mt-5 items-center justify-end gap-3">
						<TouchableOpacity
							onPress={goBack}
							className="px-4 py-2.5 rounded-lg bg-zinc-100"
						>
							<Text className="text-zinc-600 font-medium">
								{step > 0 ? 'Voltar' : 'Cancelar'}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							disabled={!canConfirm}
							className={cn(
								'px-5 py-2.5 rounded-lg bg-emerald-500',
								!canConfirm && 'opacity-50',
							)}
							onPress={isLastStep ? handleConfirm : () => setStep((s) => s + 1)}
						>
							<Text className="text-white font-semibold">
								{isLastStep ? 'Adicionar' : 'Continuar'}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
};
