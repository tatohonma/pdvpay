import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { api } from '../config/axios';

type categoriesType = {
	IDCategoria: number;
	Nome: string;
	Disponibilidade: boolean;
};

interface useGetProductsByCategoriesResponse {
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
	// PaineisDeModificacao: [];
	// AreasDeImpressao: [];
}

export const useGetProductsByCategories = ({
	categoryId,
}: {
	categoryId?: number;
}) => {
	return useQuery<
		useGetProductsByCategoriesResponse[],
		AxiosError<{ Mensagem: string }>
	>({
		retry: 0,
		queryKey: ['products', categoryId],
		queryFn: async () => {
			const response = await api.get(`/api/produtos`, {
				params: {
					id: 0,
					tipo: 0,
					ativo: 'all',
					disponivel: 'all',
					categoria: categoryId,
				},
			});

			return response.data;
		},
	});
};
