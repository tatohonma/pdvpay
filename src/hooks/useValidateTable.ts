import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { validateTable } from '../soap/validate-table';

type ValidateTableResponse = {
	versao: string;
	status: number;
	guidIdentificacao: string;
	idTipoPedido: number;
	idPedido: number;
	referenciaLocalizacao?: string;
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

export const useValidateTable = (
	options?: UseMutationOptions<ValidateTableResponse, unknown, string | number>,
) => {
	return useMutation({
		mutationFn: validateTable,
		...options,
	});
};
