import { Helpers } from './helpers';

export const validateCommand = async (num: string | number) => {
	const req = {
		'v:Envelope': {
			...Helpers.SOAP_NAMESPACES,
			'v:Header': {},
			'v:Body': {
				ValidarComanda: {
					'@_xmlns': 'http://tempuri.org/',
					'@_id': 'o0',
					'@_c:root': '1',
					numero: {
						'@_i:type': 'd:long',
						'#text': num,
					},
				},
			},
		},
	};

	const xml = Helpers.XML.build(req);

	const response = await Helpers.request({
		SOAPAction: 'ValidarComanda',
		url: '/pedido.asmx',
		xml,
	});

	const outerJs = Helpers.XML.parse(response);

	const result =
		outerJs['soap:Envelope']?.['soap:Body']?.ValidarComandaResponse
			?.ValidarComandaResult;

	if (!result) {
		throw new Error('Falha na resposta');
	}

	const innerJs = Helpers.XML.parse(result);

	const data = innerJs.validarComanda;

	return {
		versao: data.versao,
		status: Number(data.status),
		...data.retorno,
	};
};
