import { api } from '../config/axios';

export type CloseOrderRequest = {
	IDPedido: number;
	IDPdv: number;
	ChaveAcesso: string;
	DocNfe?: string;
	DocFidelidade?: string;
	GerarOrdemProducao?: boolean;
	Cancelar?: boolean;
	ImagemComprovante?: number;
};

export const closeOrder = async ({
	IDPedido,
	IDPdv,
	ChaveAcesso,
	DocNfe = '',
	DocFidelidade = '',
	GerarOrdemProducao = false,
	Cancelar = false,
	ImagemComprovante = 0,
}: CloseOrderRequest) => {
	const response = await api.post('/api/pedidos/fechar', {
		IDPedido,
		IDPdv,
		ChaveAcesso,
		DocNfe,
		DocFidelidade,
		GerarOrdemProducao,
		Cancelar,
		ImagemComprovante,
	});
	return response.data;
};
