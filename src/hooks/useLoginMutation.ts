import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { auth } from '../api/auth';
import { useAppStoreActions } from '../store/useAppStore';

export const useAuthMutation = () => {
	const actions = useAppStoreActions();
	const navigation = useNavigation();

	return useMutation({
		mutationFn: auth,
		onSuccess: (data) => {
			actions.setUser(data.idUsuario, data.nome);
			navigation.navigate('Home');
		},
	});
};
