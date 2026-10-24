import { useQuery } from '@tanstack/react-query';
import { type AxiosError, isAxiosError } from 'axios';
import { api } from '../config/axios';
import { useSettingsStore } from '../store/useSettingsStore';

export interface Product {
	IDProduto: number;
	IDTipoProduto: number;
	/** Só vem no endpoint api/app/produtos (tbProduto.Codigo). */
	Codigo?: string | null;
	/** Só vem no endpoint api/app/produtos (tbProduto.CodigoERP). */
	CodigoERP?: string | null;
	Nome: string;
	Descricao: string;
	ValorUnitario: number;
	Ativo: boolean;
	Excluido: boolean;
	DtUltimaAlteracao: string;
	Disponibilidade: boolean;
	DtAlteracaoDisponibilidade: string;
	Categorias: Categoria[];
	/** A API pode mandar painéis null no meio da lista. */
	PaineisDeModificacao: (PainelDeModificacao | null)[];
	AreasDeImpressao: AreaDeImpressao[];
}

export interface Categoria {
	IDCategoria: number;
	Nome: string;
	Disponibilidade: boolean;
}

export interface PainelDeModificacao {
	IDPainelModificacao: number;
	Nome: string;
	Titulo: string;
	/** Mínimo de opções selecionadas; ausente = opcional. */
	Min?: number;
	/** Máximo de opções selecionadas; ausente = sem limite. */
	Max?: number;
	Produtos: ProdutoModificacao[];
}

export interface ProdutoModificacao {
	IDProduto: number;
	Valor: number;
	Ordem: number;
}

export interface AreaDeImpressao {
	IDAreaImpressao: number;
	Nome: string;
	IDTIpo: number;
}

// Rotas de listagem, da mais nova para a mais antiga:
// - api/app/v2/produtos: listagem otimizada compilada junto com o WS2
// - api/app/produtos: a mesma listagem no AppExtensions.dll (servidores antes do WS2 novo)
// - api/produtos: listagem original, sem Codigo/CodigoERP
// Servidor que não tem uma rota responde 404 e o app tenta a próxima
const PRODUCT_ROUTES = [
	'/api/app/v2/produtos',
	'/api/app/produtos',
	'/api/produtos',
] as const;

// Primeira rota que funcionou para o servidor configurado, para não repetir
// os 404 a cada carga; recomeça do início se a URL do servidor mudar
let resolvedRoute: { serverURL: string | undefined; index: number } | null =
	null;

const fetchProducts = async (tipo: number): Promise<Product[]> => {
	const serverURL = useSettingsStore.getState().serverURL;
	const cached = resolvedRoute;
	const start = cached && cached.serverURL === serverURL ? cached.index : 0;

	for (let index = start; index < PRODUCT_ROUTES.length; index++) {
		const isLast = index === PRODUCT_ROUTES.length - 1;

		try {
			const response = await api.get(PRODUCT_ROUTES[index], {
				params: { tipo },
			});
			resolvedRoute = { serverURL, index };
			return response.data;
		} catch (error) {
			const notFound =
				isAxiosError(error) && error.response?.status === 404;
			if (!notFound || isLast) throw error;
		}
	}

	throw new Error('Nenhuma rota de produtos disponível');
};

export const productsQueryOptions = {
	queryKey: ['products'],
	queryFn: () => fetchProducts(10),
};

export const useGetProducts = () => {
	return useQuery<Product[], AxiosError<{ Mensagem: string }>>({
		retry: 0,
		...productsQueryOptions,
	});
};

// Os modificadores são produtos de outro tipo; o painel só traz o IDProduto,
// então o nome vem desta lista.
export const modifierProductsQueryOptions = {
	queryKey: ['products', 'modifiers'],
	queryFn: () => fetchProducts(20),
};

const toProductMap = (products: Product[]) =>
	new Map(products.map((p) => [p.IDProduto, p]));

export const useModifierProducts = () => {
	return useQuery<
		Product[],
		AxiosError<{ Mensagem: string }>,
		Map<number, Product>
	>({
		retry: 0,
		select: toProductMap,
		...modifierProductsQueryOptions,
	});
};
