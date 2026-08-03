import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import DeviceInfo from 'react-native-device-info';
import { authPDV } from '../api/auth';
import { useAppStore } from '../store/useAppStore';

export const useAuthPdvMutation = () => {
	const { actions, pdv } = useAppStore();

	const mutation = useMutation({
		mutationFn: authPDV,
		onSuccess: (data) => {
			actions.setPdv({
				idPDV: data.idPDV,
				name: data.nome,
				versaoWS: data.versaoWS,
			});
		},
	});

	useEffect(() => {
		if (!pdv.idPDV) {
			const deviceId = DeviceInfo.getAndroidIdSync();
			mutation.mutateAsync({ deviceId });
		}
	}, [pdv.idPDV]);

	return mutation;
};
