import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { solicitarFechamentoConta } from '../soap/solicitar-fechamento-conta';

export type AskCloseOrderParams = {
	guidIdentificacao: string;
	idTipoPedido: number;
	idPedido: number;
	idUsuario: number;
	idPDV: number;
	numero: number;
	quantidadePessoas: number;
	idTipoPagamento: number;
	infoMesa: number;
	impressaoConta: number;
};

export type AskCloseOrderResponse = {
	versao: string;
	status: number;

	descricaoErro?: string;
	descricaoDetalhadaErro?: string;
};

export const useAskCloseOrderMutation = (
	options?: UseMutationOptions<
		AskCloseOrderResponse,
		unknown,
		AskCloseOrderParams
	>,
) => {
	return useMutation({
		mutationFn: solicitarFechamentoConta,
		...options,
	});
};
