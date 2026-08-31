import { zodResolver } from '@hookform/resolvers/zod';
import Lucide from '@react-native-vector-icons/lucide';
import {
	type RouteProp,
	useNavigation,
	useRoute,
} from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
	Alert,
	Modal,
	NativeModules,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import z from 'zod';
import { useAskCloseOrderMutation } from '../../hooks/useAskCloseAccountMutation';
import { useGetOrder } from '../../hooks/useGetOrder';
import {
	type StonePaymentResponse,
	usePaymentResponse,
} from '../../hooks/usePaymentResponse';
import { useStonePayment } from '../../hooks/useStonePayment';
import { useAppStore } from '../../store/useAppStore';
import { useOrderStore } from '../../store/useOrderStore';
import {
	useServerConfig,
	useSettingsStore,
} from '../../store/useSettingsStore';
import { TextInput } from '../ui/text-input';

type DetailsRouteProp = RouteProp<
	{ Order: { number: string; type: 'command' | 'table' } },
	'Order'
>;

const schema = z.object({
	people_number: z.coerce.number({
		message: 'Numero de pessoas é um campo obrigatório',
	}),
});

export const CloseOrderModal = () => {
	const { params } = useRoute<DetailsRouteProp>();
	const [visible, setVisible] = useState<boolean>(false);
	const [waitingPayment, setWaitingPayment] = useState<boolean>(false);

	const [paymentIndex, setPaymentIndex] = useState(0);
	const [totalPayments, setTotalPayments] = useState(1);

	const paymentAmountRef = useRef(0);

	const { currentOrderInfo } = useOrderStore();
	const { pdv, user } = useAppStore();
	const navigation = useNavigation();
	const serverConfig = useServerConfig();
	const ambientePos = useSettingsStore((state) => state.ambientePos);
	const stonePayment = useStonePayment();

	const getPaymentAmount = useCallback(() => {
		const total = paymentAmountRef.current;

		if (totalPayments <= 0) {
			return 0;
		}

		return total / totalPayments;
	}, [totalPayments]);

	const order = useGetOrder({
		id: String(currentOrderInfo?.idPedido),
		enabled: visible,
	});

	const form = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			people_number: 1,
		},
	});

	const navigateAfterClose = useCallback(() => {
		if (serverConfig.AutenticarSempre === '1') {
			navigation.reset({
				index: 0,
				routes: [{ name: 'Auth' }],
			});
			return;
		}
		navigation.reset({
			index: 0,
			routes: [{ name: 'Home' }],
		});
	}, [serverConfig.AutenticarSempre, navigation]);

	const navigateRef = useRef(navigateAfterClose);
	navigateRef.current = navigateAfterClose;

	const orderDataRef = useRef(order.data);
	orderDataRef.current = order.data;

	const onPaymentSuccess = useCallback(
		(_data: StonePaymentResponse) => {
			const nextPaymentIndex = paymentIndex + 1;

			if (nextPaymentIndex < totalPayments) {
				setPaymentIndex(nextPaymentIndex);

				stonePayment.pay({
					amount: getPaymentAmount(),
					orderId: currentOrderInfo?.idPedido,
				});

				return;
			}

			setWaitingPayment(false);

			navigateRef.current();
		},
		[
			paymentIndex,
			totalPayments,
			getPaymentAmount,
			stonePayment,
			currentOrderInfo?.idPedido,
		],
	);

	const onPaymentError = useCallback((_data: StonePaymentResponse) => {
		setWaitingPayment(false);
		Alert.alert('Pagamento não concluído');
	}, []);

	usePaymentResponse(
		onPaymentSuccess,
		onPaymentError,
		waitingPayment || (visible && ambientePos),
	);

	const closeOrderMutation = useAskCloseOrderMutation({
		onSuccess: () => {
			navigateAfterClose();
		},
		onError: () => {
			Alert.alert('Algo deu errado');
		},
	});

	const onSubmit = async (data: z.infer<typeof schema>) => {
		if (ambientePos) {
			const total = order.data?.ValorTotal ?? 0;
			const peopleNumber = Math.max(1, data.people_number);

			paymentAmountRef.current = total;

			setTotalPayments(peopleNumber);
			setPaymentIndex(0);
			setWaitingPayment(true);
			setVisible(false);

			stonePayment.pay({
				amount: total / peopleNumber,
				orderId: currentOrderInfo?.idPedido,
			});

			return;
		}

		await closeOrderMutation.mutateAsync({
			guidIdentificacao: String(currentOrderInfo?.guidIdentificacao),
			idPDV: Number(pdv.idPDV),
			idPedido: Number(currentOrderInfo?.idPedido),
			idTipoPagamento: 1,
			idTipoPedido: Number(currentOrderInfo?.idTipoPedido),
			idUsuario: Number(user.id),
			impressaoConta: 2,
			infoMesa: 0,
			numero: Number(params.number),
			quantidadePessoas: data.people_number,
		});
	};

	return (
		<>
			<TouchableOpacity
				onPress={() => setVisible(true)}
				className="p-1 rounded-full"
			>
				<Lucide name="dollar-sign" size={18} color="white" />
			</TouchableOpacity>
			{visible && (
				<Modal
					transparent
					visible={visible}
					onRequestClose={() => setVisible(false)}
				>
					<View className="flex-1 justify-center items-center p-4">
						<View className="p-4 bg-zinc-50 rounded shadow-lg w-[92%] max-w-md">
							<Text className="text-sm text-zinc-600">Fechamento</Text>
							<Text className="font-medium text-lg">
								{params.type === 'table' ? 'Mesa' : 'Comanda'}: {params.number}
							</Text>

							<Text className="text-zinc-400 text-xs font-medium">
								Numero de pessoas
							</Text>

							<View className="flex-row items-center justify-between mt-2">
								<TouchableOpacity
									className="px-4 py-2 rounded bg-zinc-200"
									onPress={() =>
										form.setValue(
											'people_number',
											Number(form.getValues('people_number')) - 1 > 1
												? Number(form.getValues('people_number')) - 1
												: 1,
										)
									}
								>
									<Text>-</Text>
								</TouchableOpacity>
								<View className="flex-1">
									<TextInput
										control={form.control}
										name="people_number"
										className="border-none text-zinc-500 text-center align-middle justify-center items-center"
										autoFocus
										showSoftInputOnFocus={false}
									/>
								</View>
								<TouchableOpacity
									className="px-4 py-2 rounded bg-zinc-200"
									onPress={() =>
										form.setValue(
											'people_number',
											Number(form.getValues('people_number')) + 1,
										)
									}
								>
									<Text>+</Text>
								</TouchableOpacity>
							</View>

							<View className="flex-row mt-6 items-center justify-end gap-4">
								<TouchableOpacity
									onPress={() => setVisible(false)}
									className="bg-zinc-100 px-4 py-2 rounded-lg"
								>
									<Text>Cancelar</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={form.handleSubmit(onSubmit)}
									className="bg-zinc-100 px-4 py-2 rounded-lg"
								>
									<Text>Fechar conta</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</Modal>
			)}
		</>
	);
};
