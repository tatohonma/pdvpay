// Um único Collator é muito mais rápido que `localeCompare(..., locale)`,
// que recria o collator a cada comparação (custoso no Hermes/Android).
const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' });

export const compareByName = (a: { Nome: string }, b: { Nome: string }) =>
	collator.compare(a.Nome, b.Nome);

// Minúsculas e sem acentos, para busca por texto ("pão" casa com "Pao")
export const normalizeText = (text: string) =>
	text
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();
