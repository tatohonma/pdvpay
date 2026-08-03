import { api } from '../config/axios';

export const authPDV = async ({ deviceId }: { deviceId: string }) => {
	const response = await api.post('/api/autenticacao/pdv', {
		hardware: deviceId,
		tipoPDV: 40,
		versaoAPP: '1.24.2',
	});

	return response.data;
};

export const auth = async ({ password }: { password: string }) => {
	const response = await api.post('/api/autenticacao/usuario', {
		senha: password,
	});
	return response.data;
};
