import type { AreaDeImpressao } from '../hooks/useGetProducts';

export type PrintAreaOption = { id: number; nome: string };

type AreaItem = { idProduto: number; nome: string };

type ResolveAreasParams<T extends AreaItem> = {
	items: T[];
	getAreas: (idProduto: number) => AreaDeImpressao[] | undefined;
	/** Config UsarAreas = "1". */
	enabled: boolean;
	/** Config AreasPadrao ("ID1, ID2, IDn"). */
	defaultAreas: number[];
	/** Áreas escolhidas pelo operador nas perguntas anteriores. */
	chosenAreas: number[];
};

export const parseAreaIds = (value: unknown) =>
	String(value ?? '')
		.split(',')
		.map((id) => Number.parseInt(id.trim(), 10))
		.filter((id) => id > 0);

// Mesma regra do app antigo (WebPedido.preparaPedido):
// - UsarAreas desligado ou produto sem área: não envia, o servidor usa o padrão
// - uma área: imprime nela
// - várias áreas: a que estiver em AreasPadrao; senão a escolhida pelo operador;
//   sem nenhuma das duas o item fica pendente e o operador precisa escolher
export const resolvePrintAreas = <T extends AreaItem>({
	items,
	getAreas,
	enabled,
	defaultAreas,
	chosenAreas,
}: ResolveAreasParams<T>) => {
	const pending: { item: T; areas: PrintAreaOption[] }[] = [];

	const resolved = items.map((item) => {
		const areas = (getAreas(item.idProduto) ?? [])
			.filter((a) => a?.IDAreaImpressao > 0)
			.map((a): PrintAreaOption => ({ id: a.IDAreaImpressao, nome: a.Nome }));

		if (!enabled || areas.length === 0) return { ...item, idArea: undefined };
		if (areas.length === 1) return { ...item, idArea: areas[0].id };

		const area =
			areas.find((a) => defaultAreas.includes(a.id)) ??
			areas.find((a) => chosenAreas.includes(a.id));

		if (!area) pending.push({ item, areas });

		return { ...item, idArea: area?.id };
	});

	// Uma pergunta cobre todos os pendentes; quem não tiver a área escolhida
	// volta na pergunta seguinte
	const options = new Map<number, PrintAreaOption>();
	for (const { areas } of pending) {
		for (const area of areas) options.set(area.id, area);
	}

	return {
		items: resolved,
		pending: pending.length
			? {
					productNames: [...new Set(pending.map(({ item }) => item.nome))],
					options: [...options.values()],
				}
			: null,
	};
};
