import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { validateCommand } from '../soap/validate-command';

type ValidateCommandResponse = {
	versao: string;
	status: number;

	guidIdentificacao: string;
	idTipoPedido: number;
	numero: number;
	idPedido: number;

	referenciaLocalizacao: string;

	checkin: number;

	cliente: string | null;

	valorProdutos: number;
	valorServico: number;
	valorEntrada: number;
	valorConsumacaoMinima: number;
	valorTotal: number;

	totalECredito: number;
	porcentagemServico: number;

	qtdItens: number;

	descricaoErro?: string;
};

export const useValidateCommand = (
	options?: UseMutationOptions<
		ValidateCommandResponse,
		unknown,
		string | number
	>,
) => {
	return useMutation({
		mutationFn: validateCommand,
		...options,
	});
};
