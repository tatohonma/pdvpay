import { useCallback, useMemo } from 'react';
import {
	FlatList,
	type ListRenderItemInfo,
	useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OptionButton } from '../../components/ui/option-button';
import { useGetCategories } from '../../hooks/useGetCategories';
import { useOrderStoreActions } from '../../store/useOrderStore';
import { getNumColumns } from '../../utils/columns';
import { compareByName } from '../../utils/sort';
import { useTabStore } from './useTabStore';

type CategoryItem = {
	IDCategoria: number;
	Nome: string;
};

const ALL_CATEGORY: CategoryItem = { IDCategoria: 0, Nome: 'Todos' };

export const CategoryTab = () => {
	const { setIndex } = useTabStore();
	const categories = useGetCategories();
	const actions = useOrderStoreActions();
	const { width } = useWindowDimensions();
	const insets = useSafeAreaInsets();
	const numColumns = getNumColumns(width);

	const data = useMemo(
		() => [
			ALL_CATEGORY,
			...[...(categories.data ?? [])].sort(compareByName),
		],
		[categories.data],
	);

	const handleSelect = useCallback(
		(id: number) => {
			actions.setCategoryId(id);
			setIndex(1);
		},
		[actions, setIndex],
	);

	const renderItem = useCallback(
		({ item }: ListRenderItemInfo<CategoryItem>) => (
			<OptionButton
				title={item.Nome}
				onPress={() => handleSelect(item.IDCategoria)}
			/>
		),
		[handleSelect],
	);

	return (
		<FlatList
			key={numColumns}
			className="p-1"
			contentContainerStyle={{ paddingBottom: insets.bottom }}
			data={data}
			keyExtractor={(c) => String(c.IDCategoria)}
			numColumns={numColumns}
			renderItem={renderItem}
			initialNumToRender={20}
			maxToRenderPerBatch={20}
			windowSize={9}
			removeClippedSubviews
		/>
	);
};
