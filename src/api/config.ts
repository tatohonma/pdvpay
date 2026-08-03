import { api } from '../config/axios';

export const getConfig = async ({ idPDV }: { idPDV: string | number }) => {
	const body = [
		'ChaveUsuario',
		'SenhaSaida',
		'AbrirComanda',
		'ClienteCPFObrigatorio',
		'ClienteRGObrigatorio',
		'ClienteDataNascimentoObrigatorio',
		'SolicitarRef',
		'SolicitarPessoas',
		'MostrarResumo',
		'MostrarLista',
		'TipoCliente',
		'ImpressaoConta',
		'AutenticarSempre',
		'ProdutoViagem',
		'AskPrice',
		'UsarAreas',
		'AreasPadrao',
		'ReferenciaMesa',
		'ComandaComCheckin',
		'MostrarFecharConta',
		'SenhaMesa',
		'usarComanda',
		'VerifImagens',
	];

	const response = await api.post(
		`/api/configuracao/chaves?tipoPDV=40&idPDV=${idPDV}&sistema=true`,
		body,
	);

	return response.data;
};
