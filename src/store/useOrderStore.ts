import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type addProductsProps = {
	idProduto: number;
	qtd: number;
	viagem: number;
	notas?: string;
	nome: string;
	valorUnitario: number;
};

export type currentOrderInfoProps = {
	guidIdentificacao: string;
	idTipoPedido: number;
	idPedido: number;
	referenciaLocalizacao?: string;
	cliente: string | null;
	valorProdutos: number;
	valorServico: number;
	valorEntrada: number;
	valorConsumacaoMinima: number;
	valorTotal: number;
	totalECredito: number;
	porcentagemServico: number;
	qtdItens: number;

	descricaoErro?: string;
};

type OrderStoreActions = {
	setCurrentOrderInfo: (order: currentOrderInfoProps) => void;
	addSelectedProduct: (product: addProductsProps) => void;
	setSelectedProduct: (product: addProductsProps) => void;
	removeSelectedProduct: (id: number) => void;
	resetProducts: () => void;
	setLocationRef: (ref: string) => void;
	setCategoryId: (id: number) => void;
};

type OrderStoreProps = {
	currentOrderInfo: currentOrderInfoProps | null;
	selectedProducts: addProductsProps[];
	actions: OrderStoreActions;
	categoryId: number;
};

export const useOrderStore = create<OrderStoreProps>()(
	immer((set) => ({
		categoryId: 0,
		currentOrderInfo: null,
		selectedProducts: [],
		actions: {
			setCategoryId: (id) =>
				set((state) => {
					state.categoryId = id;
				}),
			setCurrentOrderInfo: (order) => set({ currentOrderInfo: order }),
			setLocationRef: (ref: string) =>
				set((state) => {
					if (state.currentOrderInfo) {
						state.currentOrderInfo.referenciaLocalizacao = ref;
					}
				}),
			addSelectedProduct: (product) =>
				set((state) => {
					const existentProduct = state.selectedProducts.find(
						(e) => e.idProduto === product.idProduto,
					);

					if (!existentProduct) {
						state.selectedProducts.push(product);
						return;
					}

					existentProduct.qtd += product.qtd;
				}),
			setSelectedProduct: (product) =>
				set((state) => {
					const existentProduct = state.selectedProducts.find(
						(e) => e.idProduto === product.idProduto,
					);

					if (!existentProduct) {
						state.selectedProducts.push(product);
						return;
					}

					if (product.qtd === 0) {
						state.selectedProducts = state.selectedProducts.filter(
							(e) => e.idProduto !== product.idProduto,
						);
					}

					existentProduct.qtd = product.qtd;
				}),
			removeSelectedProduct: (id) =>
				set((state) => {
					const existentProduct = state.selectedProducts.find(
						(e) => e.idProduto === id,
					);

					if (existentProduct && existentProduct?.qtd > 1) {
						existentProduct.qtd = existentProduct.qtd - 1;
						return;
					}

					state.selectedProducts = state.selectedProducts.filter(
						(e) => e.idProduto !== id,
					);
				}),

			resetProducts: () => {
				set((state) => {
					state.selectedProducts = [];
				});
			},
		},
	})),
);

export const useOrderStoreActions = () =>
	useOrderStore((state) => state.actions);

export const useCurrentOrderInfo = () =>
	useOrderStore((state) => state.currentOrderInfo);

export const useSelectedProducts = () =>
	useOrderStore((state) => state.selectedProducts);
