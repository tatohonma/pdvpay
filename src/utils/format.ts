export const formatCurrency = (p: number | string | undefined) => {
	if (!p) {
		return 'R$ 0,00';
	}

	if (typeof p === 'string') {
		p = p
			.trim()
			.replace(/\s/g, '')
			.replace(/\./g, '')
			.replace(',', '.')
			.replace(/[^\d.-]/g, '');
	}

	const value = Number(p);

	if (Number.isNaN(value)) return 'R$ 0,00';

	return value.toLocaleString('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	});
};
