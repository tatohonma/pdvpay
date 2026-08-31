declare module '*.css';

interface StonePaymentNative {
	pay: (params: {
		amount: number;
		orderId?: string;
		transactionType?: string;
		installmentType?: string;
		installmentCount?: number;
		editableAmount?: boolean;
	}) => void;
}

interface StonePrinterNative {
	print: (content: string) => void;
}
