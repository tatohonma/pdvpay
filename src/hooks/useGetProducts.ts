import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { api } from '../config/axios';

export interface Product {
	IDProduto: number;
	IDTipoProduto: number;
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

export const productsQueryOptions = {
	queryKey: ['products'],
	queryFn: async (): Promise<Product[]> => {
		const response = await api.get(`/api/produtos`, {
			params: {
				tipo: 10,
			},
		});
		return response.data;
	},
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
	queryFn: async (): Promise<Product[]> => {
		const response = await api.get(`/api/produtos`, {
			params: {
				tipo: 20,
			},
		});

		return response.data;
	},
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
