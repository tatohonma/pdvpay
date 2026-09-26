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
      {label && (
        <Text className="mb-1 text-xs font-medium text-zinc-500">{label}</Text>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field, formState: { errors } }) => {
          const error = errors[name]?.message;

          return (
            <>
              <RNTextInput
                placeholderTextColor="#a1a1aa"
                className={cn(
                  "rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-800",
                  className,
                )}
                onChangeText={field.onChange}
                value={field.value != null ? String(field.value) : ""}
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
