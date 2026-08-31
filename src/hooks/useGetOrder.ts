import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { api } from '../config/axios';

export type Order = {
	NumeroComanda: number | null;
	NumeroMesa: string;
	IDPedido: number;
	Cliente: Record<string, unknown>;
	IDTipoPedido: number;
	StatusPedido: number;
	TipoEntrada: Record<string, unknown>;
	GUIDIdentificacao: string;
	DtPedido: string;
	ValorDesconto: number;
	ValorTotal: number;
	Itens: OrderItem[];
	ItensCancelados: OrderItem[];
	Pagamentos: Payment[];
	Estabelecimento: Estabelecimento;
	DocumentoFiscal: string;
};

type OrderItem = {
	ID: number;
	IDProduto: number;
	Qtd: number;
	Modificacoes: unknown[]; // tipar melhor se houver estrutura
	Notas: string;
	Preco: number;
	Descricao: string;
};

type Payment = Record<string, unknown>; // ajustar quando souber os campos

type Estabelecimento = {
	IDEstabelecimento: number;
	Nome: string | null;
};

export const useGetOrder = ({ id, enabled = true }: { id: string; enabled?: boolean }) => {
	return useQuery<Order, AxiosError<{ Mensagem: string }>>({
		retry: 0,
		enabled,
		queryKey: ['order', id],
		queryFn: async () => {
			const response = await api.get(`/api/Pedidos/${id}`);
			return response.data;
		},
	});
};
