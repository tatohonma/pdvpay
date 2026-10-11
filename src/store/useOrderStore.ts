import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type OrderProductModifier = {
	idProduto: number;
	nome: string;
	valor: number;
};

export type SelectedProduct = {
	/** Identifica a combinação produto + observação + modificadores. */
	groupKey: string;
	idProduto: number;
	qtd: number;
	viagem: number;
	notas?: string;
	nome: string;
	valorUnitario: number;
	/** Preço digitado pelo operador (AskPrice = 1); só nesse caso é enviado ao servidor. */
	valorInformado?: boolean;
	modificacoes: OrderProductModifier[];
};

export type AddProductInput = Omit<SelectedProduct, 'groupKey'>;

// Mesmo produto com observação/modificadores diferentes vira outra linha do pedido
const buildProductKey = (product: AddProductInput) =>
	JSON.stringify([
		product.idProduto,
		product.notas?.trim() || '',
		product.modificacoes.map((m) => m.idProduto).sort((a, b) => a - b),
	]);

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
	addSelectedProduct: (product: AddProductInput) => void;
	removeSelectedProduct: (groupKey: string) => void;
	resetProducts: () => void;
	setLocationRef: (ref: string) => void;
	setCategoryId: (id: number) => void;
};

type OrderStoreProps = {
	currentOrderInfo: currentOrderInfoProps | null;
	selectedProducts: SelectedProduct[];
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
					const groupKey = buildProductKey(product);
					const existentProduct = state.selectedProducts.find(
						(e) => e.groupKey === groupKey,
					);

					if (!existentProduct) {
						state.selectedProducts.push({ ...product, groupKey });
						return;
					}

					existentProduct.qtd += product.qtd;
				}),
			removeSelectedProduct: (groupKey) =>
				set((state) => {
					const existentProduct = state.selectedProducts.find(
						(e) => e.groupKey === groupKey,
					);

					if (existentProduct && existentProduct.qtd > 1) {
						existentProduct.qtd = existentProduct.qtd - 1;
						return;
					}

					state.selectedProducts = state.selectedProducts.filter(
						(e) => e.groupKey !== groupKey,
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
