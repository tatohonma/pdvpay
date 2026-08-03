import { Controller } from "react-hook-form";
import { TextInput as RNTextInput, Text, View } from "react-native";
import { cn } from "../../utils/cn";

interface TextInputProps extends React.ComponentProps<typeof RNTextInput> {
  control: any;
  name: string;
  label?: string;
}

export function TextInput({
  className,
  control,
  name,
  label,
  ...rest
}: TextInputProps) {
  return (
    <View>
      {label && <Text className="mb-1">{label}</Text>}
      <Controller
        control={control}
        name={name}
        render={({ field, formState: { errors } }) => {
          const error = errors[name]?.message;

          return (
            <>
              <RNTextInput
                className={cn("rounded text-zinc-700", className)}
                onChangeText={field.onChange}
                value={String(field.value)}
                {...rest}
              />
              {error && (
                <Text className="text-red-500 text-xs mt-0.5">
                  {error.toString()}
                </Text>
              )}
            </>
          );
        }}
      />
    </View>
  );
}
