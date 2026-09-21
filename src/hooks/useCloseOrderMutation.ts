import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { type CloseOrderRequest, closeOrder } from '../api/close-order';

export const useCloseOrderMutation = (
	options?: UseMutationOptions<unknown, unknown, CloseOrderRequest>,
) => {
	return useMutation({
		mutationFn: closeOrder,
		...options,
	});
};
