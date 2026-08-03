import type { ReactNode } from 'react';
import {
	Text,
	TouchableOpacity,
	type TouchableOpacityProps,
} from 'react-native';

interface OptionButtonProps extends TouchableOpacityProps {
	title: string;
	textStyles?: string;
	containerStyles?: string;
	children?: ReactNode;
}

export const OptionButton = ({
	title,
	textStyles,
	containerStyles,
	children,
	...rest
}: OptionButtonProps) => {
	return (
		<TouchableOpacity
			className={`p-1.5 w-1/2 md:w-1/3 lg:w-1/4 justify-center items-center relative${containerStyles}`}
			{...rest}
		>
			<Text
				numberOfLines={2}
				ellipsizeMode="tail"
				maxFontSizeMultiplier={1.3}
				className={`bg-zinc-300 py-4 w-full text-center rounded text-xs px-2 ${textStyles}`}
			>
				{title}
			</Text>
			{children}
		</TouchableOpacity>
	);
};
