import { ScrollView, View } from 'react-native';
import { cn } from '../../utils/cn';

export const PageLayout = ({ children }: { children: React.ReactNode }) => {
	return <View className="flex-1">{children}</View>;
};

export const WithLayout = (Component: React.ComponentType) => (props: any) => {
	return (
		<PageLayout>
			<Component {...props} />
		</PageLayout>
	);
};

interface ResponsiveScreenProps {
	children: React.ReactNode;
	center?: boolean;
	contentClassName?: string;
}

export const ResponsiveScreen = ({
	children,
	center = false,
	contentClassName,
}: ResponsiveScreenProps) => {
	return (
		<ScrollView
			className="flex-1"
			contentContainerClassName={cn(
				'flex-grow w-full p-4 sm:p-6 md:p-10',
				center && 'justify-center',
				contentClassName,
			)}
			keyboardShouldPersistTaps="handled"
		>
			<View className={cn('w-full max-w-lg self-center', center && 'justify-center')}>
				{children}
			</View>
		</ScrollView>
	);
};
