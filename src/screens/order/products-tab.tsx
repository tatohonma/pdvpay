import { ScrollView, Text, View } from 'react-native';
import { useGetProductsByCategories } from '../../hooks/useGetProductsByCategories';
import { ExtraInfoModal } from './modal';
import { useOrderStore } from '../../store/useOrderStore';

export const ProductsTab = () => {
	const categoryId = useOrderStore((state) => state.categoryId);
	const products = useGetProductsByCategories({
		categoryId: categoryId,
	});

	const filteredProducts = products.data?.filter(
		(p) => p.Disponibilidade && p.IDTipoProduto === 10,
	);

	return (
		<ScrollView className="p-1">
			<View className="flex-row flex-wrap">
				{filteredProducts &&
					filteredProducts?.length > 0 &&
					filteredProducts?.map((p, _i) => {
						return <ExtraInfoModal key={p.IDProduto} product={p} />;
					})}

				{!filteredProducts ||
					(filteredProducts.length === 0 && (
						<Text className="mt-2 text-zinc-700">
							Não existem produtos para essa categoria!
						</Text>
					))}
			</View>
		</ScrollView>
	);
};
