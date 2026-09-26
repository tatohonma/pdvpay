import { memo, type ReactNode } from 'react';
import {
	Text,
	TouchableOpacity,
	type TouchableOpacityProps,
} from 'react-native';
import { cn } from '../../utils/cn';

interface OptionButtonProps extends TouchableOpacityProps {
	title: string;
	textStyles?: string;
	containerStyles?: string;
	children?: ReactNode;
}

export const OptionButton = memo(function OptionButton({
	title,
	textStyles,
	containerStyles,
	children,
	...rest
}: OptionButtonProps) {
	return (
		<TouchableOpacity
			className={cn(
				'p-1.5 w-1/2 md:w-1/3 lg:w-1/4 justify-center items-center relative',
				containerStyles,
			)}
			{...rest}
		>
			<Text
				numberOfLines={2}
				ellipsizeMode="tail"
				maxFontSizeMultiplier={1.3}
				className={cn(
					'bg-zinc-100 border border-zinc-200 py-4 w-full text-center rounded-lg text-xs px-2 text-zinc-700',
					textStyles,
				)}
			>
				{title}
			</Text>
			{children}
		</TouchableOpacity>
	);
});
