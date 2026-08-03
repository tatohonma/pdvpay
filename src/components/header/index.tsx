import { Text, View } from 'react-native';

type headerProps = {
	title?: string;
};

export const Header = ({ title = 'PDVSEVEN' }: headerProps) => {
	return (
		<View className="items-center py-2 bg-cyan-600">
			<Text className="font-semibold text-white">{title}</Text>
		</View>
	);
};
