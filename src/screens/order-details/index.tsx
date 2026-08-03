import { ScrollView, Text, View } from 'react-native';
import { useGetOrder } from '../../hooks/useGetOrder';
import { useOrderStore } from '../../store/useOrderStore';
import { formatCurrency } from '../../utils/format';

export const OrderDetailsScreen = () => {
	const { currentOrderInfo } = useOrderStore();
	const order = useGetOrder({ id: String(currentOrderInfo?.idPedido) });

	return (
		<View className="flex-1 p-2">
			<ScrollView>
				<View className="bg-amber-100 shadow rounded-md px-2.5 py-1.5">
					<View className="flex-row flex-wrap justify-between gap-2">
						{order.data?.NumeroMesa && (
							<Text className="font-medium text-base md:text-lg">
								Mesa: {order.data.NumeroMesa}
							</Text>
						)}
						{order.data?.NumeroComanda && (
							<Text className="font-medium text-base md:text-lg">
								Comanda: {order.data.NumeroComanda}
							</Text>
						)}
						<Text className="font-medium text-base md:text-lg">
							Total: {formatCurrency(currentOrderInfo?.valorTotal)}
						</Text>
					</View>

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

					<View className="border-b border-dashed border-zinc-200 my-2" />

					<View className="pb-2">
						{order.data?.Itens.map((p) => {
							return (
								<View
									key={p.ID}
									className="flex-row items-center justify-between py-1 gap-2"
								>
									<View className="flex-1 flex-row items-center gap-2">
										<Text
											numberOfLines={1}
											ellipsizeMode="tail"
											maxFontSizeMultiplier={1.3}
											className="flex-1 text-zinc-600"
										>
											{p.Descricao}
										</Text>
									</View>
									<View className="flex-row items-center gap-3 w-1/3 md:w-1/4">
										<Text maxFontSizeMultiplier={1.3} className="text-zinc-600">
											x{p.Qtd}
										</Text>
										<Text
											numberOfLines={1}
											maxFontSizeMultiplier={1.3}
											className="text-zinc-600"
										>
											{formatCurrency(p.Preco * p.Qtd)}
										</Text>
									</View>
								</View>
							);
						})}
					</View>
				</View>
			</ScrollView>
			{/* <View className="px-2 py-1 bg-zinc-100 border-b border-b-zinc-200 mt-1">
        <View className="flex-row justify-between">
          <Text className="w-2/3 text-zinc-600">Descrição</Text>
          <View className="flex-row gap-4 w-1/3">
            <Text className="text-zinc-600">Qtd.</Text>
            <Text className="text-zinc-600">Total</Text>
          </View>
        </View>
      </View> */}
		</View>
	);
};
