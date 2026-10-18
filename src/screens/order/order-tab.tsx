import { Lucide } from '@react-native-vector-icons/lucide';
import {
	type RouteProp,
	useNavigation,
	useRoute,
} from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	Text,
	ToastAndroid,
	TouchableOpacity,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';
import { type AddProductsParams, addProducts } from '../../soap/add-products';
import { useOrderStore } from '../../store/useOrderStore';
import { usePDV, useUser } from '../../store/useAppStore';
import { useServerConfig } from '../../store/useSettingsStore';
import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/format';
import { parseAreaIds, resolvePrintAreas } from '../../utils/print-areas';
import { useGetProducts } from '../../hooks/useGetProducts';
import { AreaModal } from './area-modal';

type DetailsRouteProp = RouteProp<
	{ Order: { number: string; type: 'command' | 'table' } },
	'Order'
>;

export const OrderTab = () => {
	const { params } = useRoute<DetailsRouteProp>();
	const navigation = useNavigation();

	const { selectedProducts, actions, currentOrderInfo } = useOrderStore();
	const serverConfig = useServerConfig();
	const pdv = usePDV();
	const user = useUser();
	const insets = useSafeAreaInsets();
	const products = useGetProducts();
	const [areaPrompt, setAreaPrompt] = useState<
		| (NonNullable<ReturnType<typeof resolvePrintAreas>['pending']> & {
				chosenAreas: number[];
		  })
		| null
	>(null);

	const productAreas = useMemo(
		() =>
			new Map(
				(products.data ?? []).map((p) => [p.IDProduto, p.AreasDeImpressao]),
			),
		[products.data],
	);

	// O servidor descarta pedidos com guidPedido repetido. Reaproveitar o GUID
	// enquanto o pedido não mudar evita lançar duas vezes quando o envio chegou
	// ao servidor mas a resposta se perdeu (rede caiu, timeout)
	const guidRef = useRef<{ key: string; guid: string } | null>(null);
	const getGuidPedido = () => {
		const key = JSON.stringify(
			selectedProducts.map((p) => [p.groupKey, p.qtd, p.valorUnitario]),
		);

		if (guidRef.current?.key !== key) {
			guidRef.current = { key, guid: uuidv4() };
		}

		return guidRef.current.guid;
	};

	const mutation = useMutation({
		mutationFn: (newProducts: AddProductsParams) => addProducts(newProducts),
		// Falha de rede: tenta de novo com o mesmo GUID, como o app antigo (4 tentativas)
		retry: 3,
		retryDelay: 1000,
		onError: () => {
			// O pedido continua na tela para o garçom tentar de novo
			ToastAndroid.show('Erro ao Enviar Pedido', ToastAndroid.LONG);
		},
		onSuccess: async (data) => {
			if (data.status === 1) {
				guidRef.current = null;
				actions.resetProducts();
				ToastAndroid.show('Pedido Enviado Com Sucesso', ToastAndroid.LONG);
				if (serverConfig.AutenticarSempre === '1') {
					navigation.reset({
						index: 0,
						routes: [{ name: 'Auth' }],
					});
					return;
				}
				navigation.reset({
					index: 0,
					routes: [{ name: 'Home' }],
				});
				return;
			}

			ToastAndroid.show('Erro ao Enviar Pedido', ToastAndroid.LONG);

			if (data.retorno?.descricaoErro) {
				Alert.alert(
					'Um erro ocorreu ao adicionar pedidos!',
					data.retorno?.descricaoErro,
				);
			}
		},
	});

	const submitOrder = (chosenAreas: number[]) => {
		if (mutation.isPending) return;

		if (selectedProducts.length === 0) {
			ToastAndroid.show('Nenhum item selecionado', ToastAndroid.SHORT);
			return;
		}

		const { items, pending } = resolvePrintAreas({
			items: selectedProducts,
			getAreas: (id) => productAreas.get(id),
			enabled: String(serverConfig.UsarAreas) === '1',
			defaultAreas: parseAreaIds(serverConfig.AreasPadrao),
			chosenAreas,
		});

		if (pending) {
			setAreaPrompt({ ...pending, chosenAreas });
			return;
		}

		setAreaPrompt(null);
		mutation.mutate({
			guidIdentificacao: String(currentOrderInfo?.guidIdentificacao),
			guidPedido: getGuidPedido(),
			idPDV: Number(pdv.idPDV),
			idPedido: Number(currentOrderInfo?.idPedido),
			idTipoPedido: Number(currentOrderInfo?.idTipoPedido),
			idUsuario: Number(user.id),
			numero: params.number,
			produtos: items,
			referenciaLocalizacao: currentOrderInfo?.referenciaLocalizacao,
		});
	};

	return (
		<View className="flex-1 p-2">
			<View className="bg-blue-100 rounded-lg px-2.5 py-1.5">
				<View className="flex-row flex-wrap justify-between gap-2">
					<Text className="font-medium text-base md:text-lg">
						{params.type === 'table' ? 'Mesa' : 'Comanda'}: {params.number}
					</Text>

					{serverConfig.MostrarResumo === '1' && (
						<Text className="font-medium text-base md:text-lg">
							Total: {formatCurrency(currentOrderInfo?.valorTotal)}
						</Text>
					)}
				</View>

				{serverConfig.MostrarResumo === '1' && (
					<View className="flex-row flex-wrap justify-between gap-2">
						<View className="flex-1">
							<Text className="text-zinc-600">
								Produtos: {formatCurrency(currentOrderInfo?.valorProdutos)}
							</Text>
							<Text className="text-zinc-600">
								Serviços: {formatCurrency(currentOrderInfo?.valorServico)} (
								{String(currentOrderInfo?.porcentagemServico).replace(
									',00',
									'',
								)}
								%)
							</Text>
						</View>
						<View className="flex-1">
							<Text className="text-zinc-600">
								Cons. Minima:{' '}
								{formatCurrency(currentOrderInfo?.valorConsumacaoMinima)}
							</Text>
							<Text className="text-zinc-600">
								Entrada: {formatCurrency(currentOrderInfo?.valorEntrada)}
							</Text>
						</View>
					</View>
				)}
			</View>
			<View className="px-2 py-1 bg-zinc-100 border-b border-b-zinc-200 mt-1">
				<View className="flex-row flex-wrap justify-between gap-2">
					<Text className="flex-1 text-zinc-600">Descrição</Text>
					<View className="flex-row gap-3 w-1/3 md:w-1/4">
						<Text className="text-zinc-600">Qtd.</Text>
						<Text className="text-zinc-600">Total</Text>
					</View>
				</View>
			</View>
			<ScrollView>
				<View className="px-2">
					{selectedProducts.map((p) => {
						const notas = p.notas?.trim();

						return (
							<TouchableOpacity
								key={p.groupKey}
								activeOpacity={0.6}
								onPress={() => actions.addSelectedProduct({ ...p, qtd: 1 })}
								className="flex-row items-center justify-between py-1 gap-2"
							>
								<View className="flex-1 flex-row items-center gap-2">
									<TouchableOpacity
										onPress={() => actions.removeSelectedProduct(p.groupKey)}
									>
										<Lucide name="circle-x" size={20} color="red" />
									</TouchableOpacity>
									<View className="flex-1">
										<Text
											numberOfLines={1}
											ellipsizeMode="tail"
											maxFontSizeMultiplier={1.3}
											className="text-zinc-600"
										>
											{p.nome}
										</Text>
										{p.modificacoes.length > 0 && (
											<Text
												maxFontSizeMultiplier={1.3}
												className="text-xs text-zinc-500"
											>
												{p.modificacoes.map((m) => `+ ${m.nome}`).join(', ')}
											</Text>
										)}
										{!!notas && (
											<Text
												maxFontSizeMultiplier={1.3}
												className="text-xs italic text-zinc-500"
											>
												Obs: {notas}
											</Text>
										)}
									</View>
								</View>
								<View className="flex-row items-center gap-3 w-1/3 md:w-1/4">
									<Text maxFontSizeMultiplier={1.3} className="text-zinc-600">
										{p.qtd}
									</Text>
									<Text
										numberOfLines={1}
										maxFontSizeMultiplier={1.3}
										className="text-zinc-600"
									>
										{(p.valorUnitario * p.qtd).toFixed(2)}
									</Text>
								</View>
							</TouchableOpacity>
						);
					})}
				</View>
			</ScrollView>
			<View className="items-center" style={{ paddingBottom: insets.bottom }}>
				<TouchableOpacity
					onPress={() => submitOrder([])}
					disabled={mutation.isPending}
					className={cn(
						'w-full p-2.5 flex-row gap-2 items-center justify-center bg-emerald-500 rounded-lg',
						(selectedProducts.length === 0 || mutation.isPending) &&
							'opacity-50',
					)}
				>
					{mutation.isPending && <ActivityIndicator color="white" />}
					<Text className="text-white font-semibold">
						{mutation.isPending
							? mutation.failureCount > 0
								? `Tentativa ${mutation.failureCount + 1} de 4...`
								: 'Enviando...'
							: 'Confirmar'}
					</Text>
				</TouchableOpacity>
			</View>

			{areaPrompt && (
				<AreaModal
					productNames={areaPrompt.productNames}
					options={areaPrompt.options}
					onCancel={() => setAreaPrompt(null)}
					onSelect={(idArea) =>
						submitOrder([...areaPrompt.chosenAreas, idArea])
					}
				/>
			)}
		</View>
	);
};
