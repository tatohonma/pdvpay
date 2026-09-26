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
import type { PaymentEntry } from '../../api/insert-payments';
import { useAskCloseOrderMutation } from '../../hooks/useAskCloseAccountMutation';
import { useCloseOrderMutation } from '../../hooks/useCloseOrderMutation';
import { useGetOrder } from '../../hooks/useGetOrder';
import { useInsertPaymentsMutation } from '../../hooks/useInsertPaymentsMutation';
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

const CARTAO_CREDITO_ID = 2;
const CARTAO_DEBITO_ID = 3;

const getTipoPagamentoId = (transactionType?: string) => {
	if (transactionType?.toLowerCase().includes('debit')) {
		return CARTAO_DEBITO_ID;
	}
	return CARTAO_CREDITO_ID;
};

export const CloseOrderModal = () => {
	const { params } = useRoute<DetailsRouteProp>();
	const [visible, setVisible] = useState<boolean>(false);
	const [waitingPayment, setWaitingPayment] = useState<boolean>(false);

	const [paymentIndex, setPaymentIndex] = useState(0);
	const [totalPayments, setTotalPayments] = useState(1);

	const paymentAmountRef = useRef(0);
	const paymentsRef = useRef<PaymentEntry[]>([]);

	const { currentOrderInfo } = useOrderStore();
	const { pdv, user } = useAppStore();
	const navigation = useNavigation();
	const serverConfig = useServerConfig();
	const ambientePos = useSettingsStore((state) => state.ambientePos);
	const stonePayment = useStonePayment();

	const closeOrderRestMutation = useCloseOrderMutation({
		onError: (err) => {
			Alert.alert('Erro ao fechar pedido', JSON.stringify(err, null, 2));
			console.log('Erro ao fechar pedido', JSON.stringify(err, null, 2));
		},
	});

	const insertPaymentsMutation = useInsertPaymentsMutation({
		onError: (err) => {
			Alert.alert('Erro ao registrar pagamento', JSON.stringify(err, null, 2));
			console.log('Erro ao registrar pagamento', JSON.stringify(err, null, 2));
		},
	});

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
		async (data: StonePaymentResponse) => {
			paymentsRef.current.push({
				Valor: getPaymentAmount(),
				TipoPagamento: { IDTipoPagamento: getTipoPagamentoId(data.type) },
				Autorizacao: data.authorization_code,
				Bandeira: data.brand,
			});

			const nextPaymentIndex = paymentIndex + 1;

			if (nextPaymentIndex < totalPayments) {
				setPaymentIndex(nextPaymentIndex);

				stonePayment.pay({
					amount: getPaymentAmount(),
					orderId: currentOrderInfo?.idPedido,
				});

				return;
			}

			await insertPaymentsMutation.mutateAsync({
				GUIDSolicitacao: String(currentOrderInfo?.guidIdentificacao),
				IDTipoPedido: Number(currentOrderInfo?.idTipoPedido),
				Numero: Number(params.number),
				IDUsuario: Number(user.id),
				IDPDV: Number(pdv.idPDV),
				Pagamentos: paymentsRef.current,
			});

			await closeOrderRestMutation.mutateAsync({
				IDPedido: Number(currentOrderInfo?.idPedido),
				IDPdv: Number(pdv.idPDV),
				ChaveAcesso: String(user.chaveAcesso ?? ''),
			});

			setWaitingPayment(false);
			navigateRef.current();
		},
		[
			paymentIndex,
			totalPayments,
			getPaymentAmount,
			stonePayment,
			currentOrderInfo?.idPedido,
			currentOrderInfo?.guidIdentificacao,
			currentOrderInfo?.idTipoPedido,
			closeOrderRestMutation,
			insertPaymentsMutation,
			pdv.idPDV,
			user.id,
			user.chaveAcesso,
			params.number,
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
			paymentsRef.current = [];

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
					animationType="fade"
					onRequestClose={() => setVisible(false)}
				>
					<View className="flex-1 justify-center items-center p-4 bg-black/40">
						<View className="p-5 bg-white rounded-2xl shadow-lg w-[92%] max-w-md">
							<Text className="text-xs font-medium text-zinc-500">
								Fechamento
							</Text>
							<Text className="font-semibold text-lg text-zinc-800 mb-4">
								{params.type === 'table' ? 'Mesa' : 'Comanda'}: {params.number}
							</Text>

							<Text className="text-xs font-medium text-zinc-500 mb-1.5">
								Numero de pessoas
							</Text>

							<View className="flex-row items-center gap-3">
								<TouchableOpacity
									className="w-10 h-10 rounded-lg bg-zinc-100 items-center justify-center"
									onPress={() =>
										form.setValue(
											'people_number',
											Number(form.getValues('people_number')) - 1 > 1
												? Number(form.getValues('people_number')) - 1
												: 1,
										)
									}
								>
									<Lucide name="minus" size={18} color="#3f3f46" />
								</TouchableOpacity>
								<View className="flex-1">
									<TextInput
										control={form.control}
										name="people_number"
										className="h-10 rounded-lg bg-zinc-100 text-zinc-800 font-medium text-center"
										autoFocus
										showSoftInputOnFocus={false}
									/>
								</View>
								<TouchableOpacity
									className="w-10 h-10 rounded-lg bg-zinc-100 items-center justify-center"
									onPress={() =>
										form.setValue(
											'people_number',
											Number(form.getValues('people_number')) + 1,
										)
									}
								>
									<Lucide name="plus" size={18} color="#3f3f46" />
								</TouchableOpacity>
							</View>

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
									<Text className="text-white font-semibold">
										Fechar conta
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</Modal>
			)}
		</>
	);
};
