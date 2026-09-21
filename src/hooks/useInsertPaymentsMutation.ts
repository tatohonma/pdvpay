import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import {
	type InsertPaymentsRequest,
	insertPayments,
} from '../api/insert-payments';

export const useInsertPaymentsMutation = (
	options?: UseMutationOptions<unknown, unknown, InsertPaymentsRequest>,
) => {
	return useMutation({
		mutationFn: insertPayments,
		...options,
	});
};
