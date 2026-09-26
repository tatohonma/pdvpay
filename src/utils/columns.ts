export const getNumColumns = (width: number) => {
	if (width >= 1024) return 4;
	if (width >= 768) return 3;
	return 2;
};
