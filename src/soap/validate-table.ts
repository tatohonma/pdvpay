import { Helpers } from './helpers';

export const validateTable = async (num: string | number) => {
	const req = {
		'v:Envelope': {
			...Helpers.SOAP_NAMESPACES,
			'v:Body': {
				ValidarMesa: {
					'@_xmlns': 'http://tempuri.org/',
					'@_id': 'o0',
					'@_c:root': '1',
					numero: {
						'@_i:type': 'd:int',
						'#text': num,
					},
				},
			},
		},
	};

	const xml = Helpers.XML.build(req);
	const response = await Helpers.request({
		SOAPAction: 'ValidarMesa',
		url: '/pedido.asmx',
		xml,
	});

	const outerJs = Helpers.XML.parse(response);
	const result =
		outerJs['soap:Envelope']?.['soap:Body']?.ValidarMesaResponse
			?.ValidarMesaResult;

	if (!result) throw new Error('Falha na resposta');

	const innerJs = Helpers.XML.parse(result);
	const data = innerJs.validarMesa;

	return {
		versao: data.versao,
		status: Number(data.status),
		...data.retorno,
	};
};
