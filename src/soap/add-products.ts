import { Helpers } from './helpers';

interface ProductItem {
	idProduto: number;
	qtd: number;
	viagem: number;
	notas?: string;
}

export interface AddProductsParams {
	referenciaLocalizacao?: string;
	guidIdentificacao: string;
	idTipoPedido: number;
	idPedido: number;
	idUsuario: number;
	idPDV: number;
	guidPedido: string;
	numero: string | number;
	produtos: ProductItem[];
}

export const addProducts = async (params: AddProductsParams) => {
	const innerPayload = {
		adicionarProdutos: {
			...(params.referenciaLocalizacao && {
				referenciaLocalizacao: params.referenciaLocalizacao,
			}),
			guidIdentificacao: params.guidIdentificacao,
			idTipoPedido: params.idTipoPedido,
			idPedido: params.idPedido,
			idUsuario: params.idUsuario,
			idPDV: params.idPDV,
			guidPedido: params.guidPedido,
			numero: params.numero.toString(),
			listaProdutos: {
				produto: params.produtos.map((p) => ({
					idProduto: p.idProduto,
					qtd: p.qtd,
					viagem: p.viagem,
					notas: p.notas || '',
					listaModificacoes: { '#text': '' },
				})),
			},
		},
	};

	const innerXmlString = Helpers.XML.build(innerPayload);

	const req = {
		'v:Envelope': {
			...Helpers.SOAP_NAMESPACES,
			'v:Body': {
				AdicionarProdutos: {
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
		SOAPAction: 'AdicionarProdutos',
		url: '/Pedido.asmx',
		xml,
	});

	const outerJs = Helpers.XML.parse(response);
	const result =
		outerJs['soap:Envelope']?.['soap:Body']?.AdicionarProdutosResponse
			?.AdicionarProdutosResult;

	if (!result) throw new Error('Invalid SOAP response from AdicionarProdutos');

	const innerJs = Helpers.XML.parse(result);
	const data = innerJs.adicionarProdutos;

	return {
		versao: data.versao,
		status: Number(data.status),
		retorno: data.retorno,
	};
};
