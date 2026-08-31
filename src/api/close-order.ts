import { api } from '../config/axios';

type CloseOrderRequest = {
	IDPedido: number;
	IDPdv: number;
	ChaveAcesso: string;
	DocNfe: string;
	DocFidelidade: string;
	GerarOrdemProducao: boolean;
	Cancelar: boolean;
	ImagemComprovante: 0;
};

export const closeOrder = async ({
	Cancelar = false,
	IDPdv,
	IDPedido,
}: CloseOrderRequest) => {
	const response = await api.post('/api/pedidos/fechar', {
		Cancelar,
		IDPdv,
		IDPedido,
	});
	return response.data;
};
