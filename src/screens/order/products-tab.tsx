import { Lucide } from '@react-native-vector-icons/lucide';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	type ListRenderItemInfo,
	Text,
	TextInput,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
	useGetProducts,
	useModifierProducts,
	type Product,
} from '../../hooks/useGetProducts';
import { getNumColumns } from '../../utils/columns';
import { compareByName, normalizeText } from '../../utils/sort';
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
	const modifierProducts = useModifierProducts();
	const [search, setSearch] = useState('');
	const { width } = useWindowDimensions();
	const insets = useSafeAreaInsets();
	const numColumns = getNumColumns(width);

	// A busca vale só para a categoria atual; ao trocar de categoria, recomeça
	useEffect(() => {
		setSearch('');
	}, [categoryId]);

	// Filtra e ordena uma única vez por carga; trocar de categoria só refiltra.
	// Excluídos, inativos e indisponíveis não são vendidos. Modificadores também
	// chegam na lista de produtos, mas só são vendidos dentro dos painéis de modificação.
	const sellableProducts = useMemo(
		() =>
			(products.data ?? [])
				.filter(
					(p) =>
						p.IDProduto > 4 &&
						!p.Excluido &&
						p.Ativo &&
						p.Disponibilidade &&
						p.IDTipoProduto === 10 &&
						!modifierProducts.data?.has(p.IDProduto),
				)
				.sort(compareByName),
		[products.data, modifierProducts.data],
	);

	const categoryProducts = useMemo(
		() =>
			categoryId === 0
				? sellableProducts
				: sellableProducts.filter((p) =>
						p.Categorias.some((c) => c.IDCategoria === categoryId),
					),
		[sellableProducts, categoryId],
	);

	const filteredProducts = useMemo(() => {
		const term = normalizeText(search.trim());
		if (!term) return categoryProducts;
		return categoryProducts.filter((p) => normalizeText(p.Nome).includes(term));
	}, [categoryProducts, search]);

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
				subtitle={
					search.trim()
						? `Nenhum produto corresponde a "${search.trim()}"`
						: 'Não há produtos disponíveis para essa categoria'
				}
			/>
		);
	};

	return (
		<View className="flex-1">
			<View className="flex-row items-center gap-2 mx-2 mt-2 mb-1 h-11 rounded-lg bg-zinc-100 px-3">
				<Lucide name="search" size={18} color="#a1a1aa" />
				<TextInput
					value={search}
					onChangeText={setSearch}
					placeholder="Buscar produto"
					placeholderTextColor="#a1a1aa"
					autoCorrect={false}
					returnKeyType="search"
					className="flex-1 text-zinc-800"
				/>
				{search.length > 0 && (
					<TouchableOpacity
						onPress={() => setSearch('')}
						hitSlop={8}
						accessibilityLabel="Limpar busca"
					>
						<Lucide name="x" size={18} color="#a1a1aa" />
					</TouchableOpacity>
				)}
			</View>
			{/* Remonta ao trocar de categoria: a lista volta ao topo em vez de manter
			    o scroll da categoria anterior, que deixava listas curtas em branco */}
			<FlatList
				key={`${numColumns}-${categoryId}`}
				className="p-1"
				contentContainerClassName="flex-grow"
				contentContainerStyle={{ paddingBottom: insets.bottom }}
				data={filteredProducts}
				keyExtractor={(p) => String(p.IDProduto)}
				numColumns={numColumns}
				renderItem={renderItem}
				ListEmptyComponent={renderEmptyState}
				initialNumToRender={20}
				maxToRenderPerBatch={20}
				windowSize={9}
				// Sem removeClippedSubviews: no Android, com a aba fora da tela, ele
				// desanexa os itens e a lista fica em branco até rolar
				keyboardShouldPersistTaps="handled"
				keyboardDismissMode="on-drag"
			/>
		</View>
	);
};
