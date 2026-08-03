import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getConfig } from '../api/config';
import { useSettingsStoreActions } from '../store/useSettingsStore';

export const useSettingsMutation = ({ idPDV }: { idPDV: string | number }) => {
	const actions = useSettingsStoreActions();

	const mutation = useMutation({
		mutationFn: getConfig,
		onSuccess: (data) => {
			actions.updateServerConfig(data);
		},
	});

	useEffect(() => {
		if (idPDV) mutation.mutateAsync({ idPDV });
	}, [idPDV]);

	return mutation;
};
