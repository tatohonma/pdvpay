import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { api } from '../config/axios';

interface useGetCategoryResponse {
	IDCategoria: number;
	Nome: string;
	DtUltimaAlteracao: string;
	Disponibilidade: boolean;
	DtAlteracaoDisponibilidade: string;
}

export const categoriesQueryOptions = {
	queryKey: ['categories'],
	queryFn: async (): Promise<useGetCategoryResponse[]> => {
		const response = await api.get(`/api/Categorias`);
		return response.data;
	},
};

export const useGetCategories = () => {
	return useQuery<useGetCategoryResponse[], AxiosError<{ Mensagem: string }>>({
		retry: 0,
		...categoriesQueryOptions,
	});
};
