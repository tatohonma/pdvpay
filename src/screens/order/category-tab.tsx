import { ScrollView, View } from 'react-native';

import { OptionButton } from '../../components/ui/option-button';
import { useGetCategories } from '../../hooks/useGetCategories';
import { useTabStore } from './useTabStore';
import { useOrderStoreActions } from '../../store/useOrderStore';

export const CategoryTab = () => {
	const { setIndex } = useTabStore();
	const categories = useGetCategories();
	const actions = useOrderStoreActions();

	return (
		<ScrollView className="p-1">
			<View className="flex-row flex-wrap">
				<OptionButton
					title="Todos"
					onPress={() => {
						actions.setCategoryId(0);
						setIndex(1);
					}}
				/>
				{categories.data?.map((c, _i) => {
					return (
						<OptionButton
							onPress={() => {
								actions.setCategoryId(c.IDCategoria);
								setIndex(1);
							}}
							title={c.Nome}
							key={c.IDCategoria}
						/>
					);
				})}
			</View>
		</ScrollView>
	);
};
