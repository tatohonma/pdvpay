import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Text, View } from "react-native";
import z from "zod";
import { Keypad } from "../../components/ui/keypad";
import { ResponsiveScreen } from "../../components/ui/layout";
import { useValidateCommand } from "../../hooks/useValidateCommand";
import { useValidateTable } from "../../hooks/useValidateTable";
import { useOrderStoreActions } from "../../store/useOrderStore";
import {
  useHomeMenuVisibility,
  useServerConfig,
} from "../../store/useSettingsStore";
import { SelectOptionButton } from "./select-option-button";

export type SelectOptions = "mesa" | "comanda" | "ticket";

const schema = z.object({
  number: z.coerce.string(),
});

export const HomeScreen = () => {
  const navigation = useNavigation();
  const homeIcons = useHomeMenuVisibility();
  const { AbrirComanda } = useServerConfig();
  const [active, setActive] = useState<SelectOptions>("mesa");
  const [error, setError] = useState<null | undefined | string>(null);

  const { setCurrentOrderInfo } = useOrderStoreActions();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      number: "",
    },
  });

  const shouldRedirectCheckin = (msg: string) => {
    const query =
      msg.includes("[B101] Comanda com checkin fechada!") &&
      AbrirComanda === "SIM";

    if (query) return true;
    return false;
  };

  const validateTableMutation = useValidateTable({
    onSuccess: (data) => {
      if (data?.descricaoErro) {
        setError(data?.descricaoErro);
        return;
      }

      setCurrentOrderInfo(data);
      navigation.navigate("Order", {
        number: form.getValues("number"),
        type: "table",
      });
    },
  });

  const validateCommandMutation = useValidateCommand({
    onSuccess: (data) => {
      if (data?.descricaoErro) {
        if (shouldRedirectCheckin(data?.descricaoErro)) {
          navigation.navigate("CheckIn", {
            number: form.getValues("number"),
            type: "command",
          });
          return;
        }

        setError(data?.descricaoErro);
        return;
      }

      setCurrentOrderInfo(data);
      navigation.navigate("Order", {
        number: form.getValues("number"),
        type: "command",
      });
    },
  });

  const onSubmit = async ({ number }: z.infer<typeof schema>) => {
    if (active === "mesa") {
      await validateTableMutation.mutateAsync(number);
    }

    if (active === "comanda") {
      await validateCommandMutation.mutateAsync(number);
    }
  };

  return (
    <ResponsiveScreen center>
      {Object.entries(homeIcons).map(([key, value]) => {
        if (!value) return null;

        return (
          <View key={key} className="mb-2">
            <SelectOptionButton
              active={active}
              name={key as SelectOptions}
              handleSelect={setActive}
            />
          </View>
        );
      })}

      <View className="mt-2">
        <Controller
          control={form.control}
          name="number"
          render={({ field }) => {
            return (
              <Keypad
                label="Número *"
                showBackspace={false}
                value={field.value}
                onNext={form.handleSubmit(onSubmit)}
                onChange={(v) => {
                  setError(null);
                  form.clearErrors();
                  field.onChange(v);
                }}
              />
            );
          }}
        />

        <View className="h-12 px-1 mt-1">
          {(form.formState.errors.number || error) && (
            <Text className="text-xs text-red-500 text-center">
              {form.formState.errors.number?.message ?? error}
            </Text>
          )}
          {validateTableMutation.isPending ||
            (validateCommandMutation.isPending && <ActivityIndicator />)}
        </View>
      </View>
    </ResponsiveScreen>
  );
};
