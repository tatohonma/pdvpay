import { Helpers } from './helpers';

export const requestAccountClosure = async (params: any) => {
	const innerPayload = {
		solicitarFechamentoConta: {
			guidIdentificacao: params.guidIdentificacao,
			idTipoPedido: params.idTipoPedido,
			idPedido: params.idPedido,
			idUsuario: params.idUsuario,
			idPDV: params.idPDV,
			numero: params.numero,
			quantidadePessoas: params.quantidadePessoas || 1,
			ListaTipoPagamentos: {
				tipoPagamento: {
					idTipoPagamento: params.idTipoPagamento || 1,
				},
			},
			infoMesa: params.infoMesa || '1',
			cpf: params.cpf || '',
			tipoCliente: 0,
			cliente: params.cliente || params.cpf || '',
		},
	};

	const innerXmlString = Helpers.XML.build(innerPayload);

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
						'#text': innerXmlString,
					},
				},
			},
		},
	};

	const xml = Helpers.XML.build(req);

	const response = await Helpers.request({
		SOAPAction: 'SolicitarFechamentoConta',
		url: '/Pedido.asmx',
		xml,
	});

	const outerJs = Helpers.XML.parse(response);

	const envelope =
		outerJs['soap:Envelope'] || outerJs['S:Envelope'] || outerJs.Envelope;
	const body =
		envelope?.['soap:Body'] || envelope?.['S:Body'] || envelope?.Body;

	const resultString =
		body?.SolicitarFechamentoContaResponse?.SolicitarFechamentoContaResult;

	if (!resultString) {
		throw new Error('Falha ao fechar conta: Resposta inválida do servidor.');
	}

	const innerJs = Helpers.XML.parse(resultString);
	const data = innerJs.solicitarFechamentoConta;

	return {
		versao: data.versao,
		status: Number(data.status),
		retorno: data.retorno,
	};
};
