import { zodResolver } from '@hookform/resolvers/zod';
import Lucide from '@react-native-vector-icons/lucide';
import { type RouteProp, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
	Modal,
	NativeModules,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import z from 'zod';
import { type Order, useGetOrder } from '../../hooks/useGetOrder';
import { useOrderStore } from '../../store/useOrderStore';
import { buildPreAccount } from '../../utils/pre-account';

type DetailsRouteProp = RouteProp<
	{ Order: { number: string; type: 'command' | 'table' } },
	'Order'
>;

const schema = z.object({
	people_number: z.coerce.number({
		message: 'Numero de pessoas é um campo obrigatório',
	}),
});

export const RequestPreAccountModal = () => {
	const { params } = useRoute<DetailsRouteProp>();
	const [visible, setVisible] = useState<boolean>(false);
	// const [waitingPayment, setWaitingPayment] = useState<boolean>(false);

	// const [paymentIndex, setPaymentIndex] = useState(0);
	// const [totalPayments, setTotalPayments] = useState(1);

	// const paymentAmountRef = useRef(0);

	const { currentOrderInfo } = useOrderStore();
	// const { pdv, user } = useAppStore();
	// const navigation = useNavigation();
	// const serverConfig = useServerConfig();
	// const ambientePos = useSettingsStore((state) => state.ambientePos);
	// const stonePayment = useStonePayment();

	// const getPaymentAmount = useCallback(() => {
	// 	const total = paymentAmountRef.current;

	// 	if (totalPayments <= 0) {
	// 		return 0;
	// 	}

	// 	return total / totalPayments;
	// }, [totalPayments]);

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

	// const navigateAfterClose = useCallback(() => {
	// 	if (serverConfig.AutenticarSempre === '1') {
	// 		navigation.reset({
	// 			index: 0,
	// 			routes: [{ name: 'Auth' }],
	// 		});
	// 		return;
	// 	}
	// 	navigation.reset({
	// 		index: 0,
	// 		routes: [{ name: 'Home' }],
	// 	});
	// }, [serverConfig.AutenticarSempre, navigation]);

	// const navigateRef = useRef(navigateAfterClose);
	// navigateRef.current = navigateAfterClose;

	// const orderDataRef = useRef(order.data);
	// orderDataRef.current = order.data;

	// const onPaymentSuccess = useCallback(
	// 	(_data: StonePaymentResponse) => {
	// 		const nextPaymentIndex = paymentIndex + 1;

	// 		if (nextPaymentIndex < totalPayments) {
	// 			setPaymentIndex(nextPaymentIndex);

	// 			stonePayment.pay({
	// 				amount: getPaymentAmount(),
	// 				orderId: currentOrderInfo?.idPedido,
	// 			});

	// 			return;
	// 		}

	// 		setWaitingPayment(false);

	// 		navigateRef.current();
	// 	},
	// 	[
	// 		paymentIndex,
	// 		totalPayments,
	// 		getPaymentAmount,
	// 		stonePayment,
	// 		currentOrderInfo?.idPedido,
	// 	],
	// );

	// const onPaymentError = useCallback((_data: StonePaymentResponse) => {
	// 	setWaitingPayment(false);
	// 	Alert.alert('Pagamento não concluído');
	// }, []);

	// usePaymentResponse(
	// 	onPaymentSuccess,
	// 	onPaymentError,
	// 	waitingPayment || (visible && ambientePos),
	// );

	// const RequestPreAccountMutation = use({
	// 	onSuccess: () => {
	// 		// navigateAfterClose();
	// 	},
	// 	onError: () => {
	// 		Alert.alert('Algo deu errado');
	// 	},
	// });

	const onSubmit = async (data: z.infer<typeof schema>) => {
		NativeModules.StonePrinter.print(
			JSON.stringify(buildPreAccount(order.data as Order)),
		);
		// if (ambientePos) {
		// 	const total = order.data?.ValorTotal ?? 0;
		// 	const peopleNumber = Math.max(1, data.people_number);
		// 	paymentAmountRef.current = total;
		// 	setTotalPayments(peopleNumber);
		// 	setPaymentIndex(0);
		// 	setWaitingPayment(true);
		// 	setVisible(false);
		// 	stonePayment.pay({
		// 		amount: total / peopleNumber,
		// 		orderId: currentOrderInfo?.idPedido,
		// 	});
		// 	return;
		// }
		// await RequestPreAccountMutation.mutateAsync({
		// 	guidIdentificacao: String(currentOrderInfo?.guidIdentificacao),
		// 	idPDV: Number(pdv.idPDV),
		// 	idPedido: Number(currentOrderInfo?.idPedido),
		// 	idTipoPagamento: 1,
		// 	idTipoPedido: Number(currentOrderInfo?.idTipoPedido),
		// 	idUsuario: Number(user.id),
		// 	impressaoConta: 2,
		// 	infoMesa: 0,
		// 	numero: Number(params.number),
		// 	quantidadePessoas: data.people_number,
		// });
	};

	return (
		<>
			<TouchableOpacity
				onPress={() => setVisible(true)}
				className="p-1 rounded-full"
			>
				<Lucide name="printer" size={18} color="white" />
			</TouchableOpacity>
			{visible && (
				<Modal
					transparent
					visible={visible}
					animationType="fade"
					onRequestClose={() => setVisible(false)}
				>
					<View className="flex-1 justify-center items-center p-4 bg-black/40">
						<View className="p-5 bg-white rounded-2xl shadow-lg w-[92%] max-w-md">
							<Text className="text-xs font-medium text-zinc-500">
								Imprimir conta
							</Text>
							<Text className="font-semibold text-lg text-zinc-800">
								{params.type === 'table' ? 'Mesa' : 'Comanda'}: {params.number}
							</Text>

							<View className="flex-row mt-5 items-center justify-end gap-3">
								<TouchableOpacity
									onPress={() => setVisible(false)}
									className="px-4 py-2.5 rounded-lg bg-zinc-100"
								>
									<Text className="text-zinc-600 font-medium">Cancelar</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={form.handleSubmit(onSubmit)}
									className="px-5 py-2.5 rounded-lg bg-emerald-500"
								>
									<Text className="text-white font-semibold">Confirmar</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</Modal>
			)}
		</>
	);
};
