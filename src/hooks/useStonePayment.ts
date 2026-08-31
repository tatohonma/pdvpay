import { NativeModules } from 'react-native';

type StonePayParams = {
	amount: number;
	orderId?: number;
	transactionType?: string;
	installmentType?: string;
	installmentCount?: number;
	editableAmount?: boolean;
};
const pay = ({
	amount,
	orderId,
	transactionType = '',
	installmentType = '',
	installmentCount = 0,
	editableAmount = false,
}: StonePayParams) => {
	const amountInCents = Math.round(amount * 100);
	NativeModules.StonePayment.pay({
		amount: amountInCents,
		orderId: orderId ? String(orderId) : undefined,
		transactionType,
		installmentType,
		installmentCount,
		editableAmount,
	});
};
export const useStonePayment = () => {
	return { pay };
};
