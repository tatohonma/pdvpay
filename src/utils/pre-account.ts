import type { Order } from '../hooks/useGetOrder';

export const buildPreAccount = (order: Order) => {
	const SEPARATOR = '------------------------------------------------------';

	const header = [
		{
			type: 'text',
			content: 'ZOLV',
			align: 'center',
			size: 'big',
		},
		{
			type: 'text',
			content: 'DOCUMENTO NÃO FISCAL',
			align: 'center',
			size: 'medium',
		},
		{
			type: 'line',
			content: SEPARATOR,
		},
	];

	const clientHeaderCommandOrTable = order.NumeroMesa ? 'MESA' : 'COMANDA';

	const client = [
		{
			type: 'line',
			content: `PEDIDO: ${order.IDPedido} - ${clientHeaderCommandOrTable}: ${order?.NumeroMesa ? order.NumeroMesa : order.NumeroComanda}`,
		},
		{
			type: 'text',
			content: ` Cliente: ${order.Cliente?.Nome || 'Não informado'}`,
			size: 'medium',
			align: 'start',
		},
		{
			type: 'text',
			content: ` Telefone: ${order.Cliente?.Telefone || 'Não informado'}`,
			size: 'medium',
			align: 'start',
		},
		{
			type: 'text',
			content: ` Endereço: ${order.Cliente?.Endereco || 'Não informado'}`,
			size: 'medium',
			align: 'start',
		},
		{
			type: 'line',
			content: SEPARATOR,
		},
	];

	const itensHeader = [
		{
			type: 'line',
			content: 'QTD DESC/ITEM  VL ITEM',
		},
	];

	const itens = (order.Itens || []).map((item) => ({
		type: 'text',
		content: ` ${item.Qtd} x ${item.Descricao} - R$ ${item.Preco.toFixed(2)}`,
		size: 'medium',
		align: 'start',
	}));

	const total = [
		{
			type: 'line',
			content: SEPARATOR,
		},
		{
			type: 'text',
			content: ` Desconto: R$ ${order.ValorDesconto.toFixed(2)}`,
			size: 'medium',
			align: 'start',
		},
		{
			type: 'line',
			content: `TOTAL: R$ ${order.ValorTotal.toFixed(2)}`,
		},
	];

	const footer = [
		{
			type: 'line',
			content: SEPARATOR,
		},
		{
			type: 'text',
			content: 'ZOLV',
			align: 'center',
			size: 'medium',
		},
	];

	return [...header, ...client, ...itensHeader, ...itens, ...total, ...footer];
};
