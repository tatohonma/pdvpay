import { useEffect, useRef } from 'react';
import { DeviceEventEmitter } from 'react-native';

export type StonePaymentResponse = {
	code: string;
	authorization_code?: string;
	success?: string;
	cardholder_name?: string;
	brand?: string;
	type?: string;
	installment_count?: string;
	order_id?: string;
};

export const usePaymentResponse = (
	onSuccess: (data: StonePaymentResponse) => void,
	onError: (data: StonePaymentResponse) => void,
	enabled = true,
) => {
	const onSuccessRef = useRef(onSuccess);
	const onErrorRef = useRef(onError);

	onSuccessRef.current = onSuccess;
	onErrorRef.current = onError;

	useEffect(() => {
		if (!enabled) return;

		const subscription = DeviceEventEmitter.addListener(
			'StonePaymentResponse',
			(data: StonePaymentResponse) => {
				if (data.code === '0' && data.success === 'true') {
					onSuccessRef.current(data);
				} else {
					onErrorRef.current(data);
				}
			},
		);

		return () => subscription.remove();
	}, [enabled]);
};
