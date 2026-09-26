import { useNavigation } from '@react-navigation/native';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { cn } from '../../utils/cn';

interface KeypadButtonProps
	extends React.ComponentProps<typeof TouchableOpacity> {
	label: string;
	labelStyle?: string;
	containerStyle?: string;
}

interface KeypadProps {
	onChange: (value: string) => void;
	onNext: () => void;

	value: string;
	label: string;
	showBackspace?: boolean;
	sensitive?: boolean;
	autoFocus?: boolean;
}

const KeypadButton = ({
	label,
	className,
	labelStyle,
	containerStyle,
	...rest
}: KeypadButtonProps) => {
	return (
		<View className={cn('p-1 w-1/3', containerStyle)}>
			<TouchableOpacity
				className={cn(
					'bg-zinc-200 items-center justify-center py-4 md:py-5 rounded-lg',
					className,
				)}
				{...rest}
			>
				<Text maxFontSizeMultiplier={1.3} className={labelStyle}>
					{label}
				</Text>
			</TouchableOpacity>
		</View>
	);
};

export const Keypad = ({
	onChange,
	onNext,
	label,
	showBackspace = true,
	value,
	sensitive = false,
	autoFocus = true,
}: KeypadProps) => {
	const navigation = useNavigation();

	const handlePress = (str: string) => {
		onChange(value + str);
	};

	const handleErase = () => {
		onChange(value.slice(0, -1));
	};

	return (
		<View>
			<View className="flex-row items-end px-1 w-full pb-1">
				<View className="w-5/6">
					<Text maxFontSizeMultiplier={1.3} className="text-xs">
						{label}
					</Text>
					<View className="pr-2">
						<TextInput
							style={{ textAlignVertical: 'center' }}
							maxFontSizeMultiplier={1.3}
							className="h-11 md:h-14 px-2 border border-zinc-300 text-zinc-900 rounded-lg"
							value={value}
							onChangeText={onChange}
							secureTextEntry={sensitive}
							showSoftInputOnFocus={false}
							caretHidden
							autoFocus={autoFocus}
							keyboardType="numeric"
							returnKeyType="done"
							onSubmitEditing={onNext}
						/>
					</View>
				</View>

				<TouchableOpacity
					onPress={handleErase}
					className="bg-red-500 w-1/6 rounded-lg items-center justify-center h-11 md:h-14"
				>
					<Text maxFontSizeMultiplier={1.3} className="text-white font-bold">
						{'<'}
					</Text>
				</TouchableOpacity>
			</View>

			<View className="flex-row flex-wrap">
				{Array.from({ length: 9 }).map((_, i) => (
					<KeypadButton
						key={i}
						label={(i + 1).toString()}
						onPress={() => handlePress((i + 1).toString())}
					/>
				))}

				{showBackspace && (
					<KeypadButton
						label="VOLTAR"
						className="bg-zinc-300"
						onPress={() => navigation.goBack()}
					/>
				)}

				<KeypadButton label="0" onPress={() => handlePress('0')} />
				<KeypadButton
					label="OK"
					className="bg-emerald-500"
					labelStyle="text-zinc-50 font-medium"
					containerStyle={cn(!showBackspace && 'w-2/3')}
					onPress={onNext}
				/>
			</View>
		</View>
	);
};
