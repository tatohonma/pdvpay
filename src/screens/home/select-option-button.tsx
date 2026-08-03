import { Text, TouchableOpacity } from 'react-native';
import { cn } from '../../utils/cn';
import type { SelectOptions } from '.';

interface SelectOptionButton
	extends React.ComponentProps<typeof TouchableOpacity> {
	active: SelectOptions;
	name: SelectOptions;
	handleSelect?: (s: SelectOptions) => void;
}

export const SelectOptionButton = ({
	handleSelect,
	name,
	active,
	...rest
}: SelectOptionButton) => {
	return (
		<TouchableOpacity
			className={cn(
				'py-2 bg-zinc-200 items-center rounded',
				active === name && 'bg-cyan-600',
			)}
			onPress={() => handleSelect?.(name)}
			{...rest}
		>
			<Text className={cn(active === name && 'text-white')}>
				{name.toUpperCase()}
			</Text>
		</TouchableOpacity>
	);
};
