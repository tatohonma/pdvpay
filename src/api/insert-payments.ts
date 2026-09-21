import { api } from '../config/axios';

export type PaymentEntry = {
	Valor: number;
	TipoPagamento: {
		IDTipoPagamento: number;
	};
	Autorizacao?: string;
	Bandeira?: string;
	ReferenciaPagamento?: string;
};

export type InsertPaymentsRequest = {
	GUIDSolicitacao: string;
	IDTipoPedido: number;
	Numero: number;
	IDUsuario: number;
	IDPDV: number;
	Pagamentos: PaymentEntry[];
};

export const insertPayments = async (data: InsertPaymentsRequest) => {
	const response = await api.post('/api/Pagamentos', data);
	return response.data;
};
