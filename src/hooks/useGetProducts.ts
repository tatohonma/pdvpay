import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { api } from '../config/axios';

type categoriesType = {
	IDCategoria: number;
	Nome: string;
	Disponibilidade: boolean;
};

export interface Product {
	IDProduto: number;
	IDTipoProduto: number;
	Nome: string;
	Descricao: string;
	ValorUnitario: number;
	Ativo: boolean;
	Excluido: boolean;
	DtUltimaAlteracao: Date;
	Disponibilidade: boolean;
	DtAlteracaoDisponibilidade: Date;
	Categorias: categoriesType[];
}

export const useGetProducts = () => {
	return useQuery<Product[], AxiosError<{ Mensagem: string }>>({
		retry: 0,
		queryKey: ['products'],
		queryFn: async () => {
			const response = await api.get(`/api/produtos`, {
				params: {
					id: 0,
					tipo: 0,
					ativo: 'all',
					disponivel: 'all',
					categoria: 0,
				},
			});

			return response.data;
		},
	});
};
