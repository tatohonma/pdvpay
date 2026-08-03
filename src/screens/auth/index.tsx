import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Text, View } from 'react-native';
import z from 'zod';
import { Keypad } from '../../components/ui/keypad';
import { ResponsiveScreen } from '../../components/ui/layout';
import { useAuthPdvMutation } from '../../hooks/useAuthPdvMutation';
import { useAuthMutation } from '../../hooks/useLoginMutation';
import { useSettingsMutation } from '../../hooks/useSettingsMutation';

const schema = z.object({
	password: z.string().min(1, 'Pin é obrigatório!'),
});

export const AuthScreen = () => {
	const authPdvMutation = useAuthPdvMutation();
	const authMutation = useAuthMutation();
	const navigation = useNavigation();

	const settingsMutation = useSettingsMutation({
		idPDV: authPdvMutation?.data?.idPDV,
	});

	const form = useForm({
		resolver: zodResolver(schema),
		defaultValues: { password: '' },
	});

	const onSubmit = async (data: z.infer<typeof schema>) => {
		if (data.password === '2606') {
			navigation.navigate('Settings');
			return;
		}

		authMutation.mutate({ password: data.password });
	};

	const isLoading = () => {
		const isLoading =
			authMutation.isPending ||
			authPdvMutation.isPending ||
			settingsMutation.isPending;

		if (isLoading) return true;
		return false;
	};

	return (
		<ResponsiveScreen center>
			{authPdvMutation.error && (
				<View>
					<Text className="text-center text-red-600">
						{authPdvMutation.error.message}
					</Text>
					<Text className="text-zinc-500 text-center font-light">
						Contate nossa equipe de suporte!
					</Text>
				</View>
			)}
			{!authPdvMutation.error && (
				<View>
					<Controller
						control={form.control}
						name="password"
						render={({ field }) => {
							return (
								<Keypad
									label="Chave de acesso"
									sensitive
									showBackspace={false}
									value={field.value}
									onNext={form.handleSubmit(onSubmit)}
									onChange={(v) => {
										form.clearErrors();
										field.onChange(v);
									}}
								/>
							);
						}}
					/>

					<View className="h-12 px-1 mt-1">
						{authMutation.error && (
							<Text className="text-xs text-red-500 text-center">
								Crendenciais inválidas!
							</Text>
						)}
						{isLoading() && <ActivityIndicator />}
					</View>
				</View>
			)}
		</ResponsiveScreen>
	);
};
