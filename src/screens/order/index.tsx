import type { StaticScreenProps } from '@react-navigation/native';
import { useEffect, useLayoutEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { useOrderStoreActions } from '../../store/useOrderStore';
import { ProductsTab } from './products-tab';
import { useTabStore } from './useTabStore';
import { CategoryTab } from './category-tab';
import { OrderTab } from './order-tab';

const renderScene = SceneMap({
	categories_tab: CategoryTab,
	products_tab: ProductsTab,
	order_tab: OrderTab,
});

const routes = [
	{ key: 'categories_tab', title: 'Categorias' },
	{ key: 'products_tab', title: 'Produtos' },
	{ key: 'order_tab', title: 'Pedido' },
];

type Props = StaticScreenProps<{
	number: string;
	type: string;
}>;

export const OrderScreen = (_props: Props) => {
	const layout = useWindowDimensions();
	const { index, setIndex } = useTabStore();
	const { resetProducts, setCategoryId } = useOrderStoreActions();

	// A aba e a categoria ficam em stores globais: zera ao entrar e também ao
	// sair, para o TabView já montar na aba Categorias na próxima mesa/comanda
	useLayoutEffect(() => {
		const reset = () => {
			setIndex(0);
			setCategoryId(0);
		};

		reset();
		return reset;
	}, [setIndex, setCategoryId]);

	useEffect(() => {
		resetProducts();
		return () => resetProducts();
	}, [resetProducts]);

	return (
		<TabView
			navigationState={{ index, routes }}
			renderScene={renderScene}
			onIndexChange={setIndex}
			initialLayout={{ width: layout.width }}
			renderTabBar={(props) => (
				<TabBar
					{...props}
					style={{ backgroundColor: '#f1f1f1', elevation: 0, shadowOpacity: 0 }}
					activeColor="#c2410c"
					inactiveColor="#6b7280"
					indicatorStyle={{ backgroundColor: '#c2410c' }}
				/>
			)}
		/>
	);
};
