import { Helpers } from './helpers';

type SolicitarFechamentoContaParams = {
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

export const solicitarFechamentoConta = async (
	params: SolicitarFechamentoContaParams,
) => {
	const innerXmlObj = {
		solicitarFechamentoConta: {
			guidIdentificacao: params.guidIdentificacao,
			idTipoPedido: params.idTipoPedido,
			idPedido: params.idPedido,
			idUsuario: params.idUsuario,
			idPDV: params.idPDV,
			numero: params.numero,
			quantidadePessoas: params.quantidadePessoas,
			ListaTipoPagamentos: {
				tipoPagamento: {
					idTipoPagamento: params.idTipoPagamento,
				},
			},
			infoMesa: params.infoMesa,
			impressaoConta: params.impressaoConta,
		},
	};

	const xmlSolicitacao = Helpers.XML.build(innerXmlObj);

	const req = {
		'v:Envelope': {
			...Helpers.SOAP_NAMESPACES,
			'v:Body': {
				SolicitarFechamentoConta: {
					'@_xmlns': 'http://tempuri.org/',
					'@_id': 'o0',
					'@_c:root': '1',
					xmlSolicitacao: {
						'@_i:type': 'd:string',
						'#text': xmlSolicitacao,
					},
				},
			},
		},
	};

	const xml = Helpers.XML.build(req);

	const response = await Helpers.request({
		SOAPAction: 'SolicitarFechamentoConta',
		url: '/pedido.asmx',
		xml,
	});

	const outerJs = Helpers.XML.parse(response);

	const result =
		outerJs['soap:Envelope']?.['soap:Body']?.SolicitarFechamentoContaResponse
			?.SolicitarFechamentoContaResult;

	if (!result) {
		throw new Error('Falha na resposta');
	}

	const innerJs = Helpers.XML.parse(result);

	const data = innerJs.solicitarFechamentoConta;

	return {
		versao: data.versao,
		status: Number(data.status),
		...data.retorno,
	};
};
