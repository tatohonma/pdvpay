import { Lucide } from '@react-native-vector-icons/lucide';
import { useCallback, useMemo } from 'react';
import {
	ActivityIndicator,
	FlatList,
	type ListRenderItemInfo,
	Text,
	useWindowDimensions,
	View,
} from 'react-native';
import { useGetProducts, type Product } from '../../hooks/useGetProducts';
import { getNumColumns } from '../../utils/columns';
import { ExtraInfoModal } from './modal';
import { useOrderStore } from '../../store/useOrderStore';

const StateMessage = ({
	icon,
	title,
	subtitle,
}: {
	icon: React.ReactNode;
	title: string;
	subtitle?: string;
}) => (
	<View className="flex-1 items-center justify-center gap-3 py-16 px-8">
		{icon}
		<View className="items-center gap-1">
			<Text className="text-zinc-600 font-semibold text-base text-center">
				{title}
			</Text>
			{subtitle && (
				<Text className="text-zinc-400 text-xs text-center">{subtitle}</Text>
			)}
		</View>
	</View>
);

export const ProductsTab = () => {
	const categoryId = useOrderStore((state) => state.categoryId);
	const products = useGetProducts();
	const { width } = useWindowDimensions();
	const numColumns = getNumColumns(width);

	const filteredProducts = useMemo(
		() =>
			products.data?.filter(
				(p) =>
					p.Disponibilidade &&
					p.IDTipoProduto === 10 &&
					(categoryId === 0 ||
						p.Categorias.some((c) => c.IDCategoria === categoryId)),
			) ?? [],
		[products.data, categoryId],
	);

	const renderItem = useCallback(
		({ item }: ListRenderItemInfo<Product>) => <ExtraInfoModal product={item} />,
		[],
	);

	const renderEmptyState = () => {
		if (products.isLoading) {
			return (
				<StateMessage
					icon={<ActivityIndicator size="large" color="#10b981" />}
					title="Carregando produtos..."
					subtitle="Isso pode levar alguns segundos"
				/>
			);
		}

		if (products.isError) {
			return (
				<StateMessage
					icon={<Lucide name="wifi-off" size={40} color="#a1a1aa" />}
					title="Não foi possível carregar os produtos"
					subtitle="Toque no ícone de atualizar no topo da tela para tentar novamente"
				/>
			);
		}

		return (
			<StateMessage
				icon={<Lucide name="package-search" size={40} color="#a1a1aa" />}
				title="Nenhum produto encontrado"
				subtitle="Não há produtos disponíveis para essa categoria"
			/>
		);
	};

	return (
		<FlatList
			key={numColumns}
			className="p-1"
			contentContainerClassName="flex-grow"
			data={filteredProducts}
			keyExtractor={(p) => String(p.IDProduto)}
			numColumns={numColumns}
			renderItem={renderItem}
			ListEmptyComponent={renderEmptyState}
			initialNumToRender={20}
			maxToRenderPerBatch={20}
			windowSize={9}
			removeClippedSubviews
		/>
	);
};
