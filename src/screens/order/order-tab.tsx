import { Lucide } from '@react-native-vector-icons/lucide';
import {
	type RouteProp,
	useNavigation,
	useRoute,
} from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import {
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
import { formatCurrency } from '../../utils/format';

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

	const mutation = useMutation({
		mutationFn: (newProducts: AddProductsParams) => addProducts(newProducts),
		onSettled: () => actions.resetProducts(),
		onError: () => {
			ToastAndroid.show('Erro ao Enviar Pedido', ToastAndroid.LONG);
		},
		onSuccess: async (data) => {
			if (data.status === 1) {
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
						return (
							<TouchableOpacity
								key={p.idProduto}
								activeOpacity={0.6}
								onPress={() => actions.addSelectedProduct({ ...p, qtd: 1 })}
								className="flex-row items-center justify-between py-1 gap-2"
							>
								<View className="flex-1 flex-row items-center gap-2">
									<TouchableOpacity
										onPress={() => actions.removeSelectedProduct(p.idProduto)}
									>
										<Lucide name="circle-x" size={20} color="red" />
									</TouchableOpacity>
									<Text
										numberOfLines={1}
										ellipsizeMode="tail"
										maxFontSizeMultiplier={1.3}
										className="flex-1 text-zinc-600"
									>
										{p.nome}
									</Text>
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
			<View
				className="items-center"
				style={{ paddingBottom: insets.bottom }}
			>
				<TouchableOpacity
					onPress={async () => {
						await mutation.mutateAsync({
							guidIdentificacao: String(currentOrderInfo?.guidIdentificacao),
							guidPedido: uuidv4(),
							idPDV: Number(pdv.idPDV),
							idPedido: Number(currentOrderInfo?.idPedido),
							idTipoPedido: Number(currentOrderInfo?.idTipoPedido),
							idUsuario: Number(user.id),
							numero: params.number,
							produtos: selectedProducts,
							referenciaLocalizacao: currentOrderInfo?.referenciaLocalizacao,
						});
					}}
					className="w-full p-2.5 items-center justify-center bg-emerald-500 rounded-lg"
				>
					<Text className="text-white font-semibold">Confirmar</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};
