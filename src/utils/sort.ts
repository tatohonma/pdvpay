// Um único Collator é muito mais rápido que `localeCompare(..., locale)`,
// que recria o collator a cada comparação (custoso no Hermes/Android).
const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' });

export const compareByName = (a: { Nome: string }, b: { Nome: string }) =>
	collator.compare(a.Nome, b.Nome);
