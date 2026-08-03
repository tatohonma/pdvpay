import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { Text, TouchableOpacity } from 'react-native';
import { z } from 'zod';
import { ResponsiveScreen } from '../../components/ui/layout';
import { TextInput } from '../../components/ui/text-input';
import { useSettingsStoreActions } from '../../store/useSettingsStore';

const schema = z.object({
	serverURL: z
		.string({ message: 'URL é obrigatória!' })
		.url({ message: 'URL inválida!' }),
});

export const SetupScreen = () => {
	const { control, handleSubmit } = useForm({
		resolver: zodResolver(schema),
	});

	const { setServerURL } = useSettingsStoreActions();
	const navigation = useNavigation();

	return (
		<ResponsiveScreen center>
			<TextInput control={control} name="serverURL" label="URL do Servidor" />

			<TouchableOpacity
				className="mt-2 p-2 rounded bg-emerald-500"
				onPress={handleSubmit(({ serverURL }) => {
					setServerURL(serverURL);
					navigation.navigate('Auth');
				})}
			>
				<Text className="text-white font-semibold text-center">Confirmar</Text>
			</TouchableOpacity>
		</ResponsiveScreen>
	);
};
