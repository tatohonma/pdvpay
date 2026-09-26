import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import z from "zod";
import { Keypad } from "../../components/ui/keypad";
import { ResponsiveScreen } from "../../components/ui/layout";
import { useServerConfig } from "../../store/useSettingsStore";
import { StaticScreenProps, useNavigation } from "@react-navigation/native";
import { getClient } from "../../api/client";
import { getCommandEntry, openCommand } from "../../api/command";
import { usePDV, useUser } from "../../store/useAppStore";
import { useMutation, useQuery } from "@tanstack/react-query";

const schema = z.object({
  number: z.coerce.string(),
  IDTipoEntrada: z.coerce.string(),
});

const CLIENT_TYPE_MAP = {
  0: "CPF/CNPJ",
  1: "CPF ou Telefone",
  2: "Telefone",
} as const;

type ClientType = keyof typeof CLIENT_TYPE_MAP;

type Props = StaticScreenProps<{
  number: string;
  type: string;
}>;

export const CheckIn = (props: Props) => {
  const [error, setError] = useState<string | null>("");
  const [open, setOpen] = useState(false);
  const { TipoCliente } = useServerConfig();
  const { idPDV } = usePDV();
  const { id } = useUser();
  const navigation = useNavigation();

  const { data: commandEntries } = useQuery({
    queryKey: ["command-entry"],
    queryFn: getCommandEntry,
  });

  const clientString = CLIENT_TYPE_MAP[Number(TipoCliente ?? 0) as ClientType];
  const { type, number } = props.route.params;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      number: "",
      IDTipoEntrada: "0",
    },
  });

  const mutation = useMutation({
    mutationFn: openCommand,
  });

  const handleOpenCommand = async (data: z.infer<typeof schema>) => {
    try {
      const client = await getClient({ telefone: data.number });
      const response = await mutation.mutateAsync({
        ClienteID: client[0].IDCliente,
        Comanda: Number(number),
        IDTipoEntrada: Number(data.IDTipoEntrada),
        PDVID: idPDV as number,
        UsuarioID: id as number,
        Validar: true,
      });

      const errorMsg = "Já existe comanda aberta para esse cliente";
      if (response.Mensagem.includes(errorMsg)) {
        setError(response.Mensagem);
        return;
      }

      await mutation.mutateAsync({
        ClienteID: client[0].IDCliente,
        Comanda: Number(number),
        IDTipoEntrada: Number(data.IDTipoEntrada),
        PDVID: idPDV as number,
        UsuarioID: id as number,
        Validar: false,
      });

      navigation.navigate("Order", {
        number,
        type,
      });
    } catch (e) {
      setError("Ouve um erro ao abrir comanda!");
      Alert.alert("Ok comanda aberta com successo", JSON.stringify(e));
    }
  };

  const onSubmit = async (data: z.infer<typeof schema>) => {
    if (commandEntries) {
      setOpen(true);
      return;
    }

    await handleOpenCommand(data);
  };

  return (
    <ResponsiveScreen center>
      <View>
        <Text className="text-lg font-medium">
          {type === "command" && `COMANDA ${number}`}
        </Text>
        <Text className="text-zinc-600">
          {`Digite o numero do ${clientString.toLowerCase()} para fazer o check in`}
        </Text>
      </View>
      <View className="mt-4">
        <Controller
          control={form.control}
          name="number"
          render={({ field }) => {
            return (
              <Keypad
                label={`${clientString} *`}
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
      </View>
      <View className="h-12 px-1 mt-1">
        {error && (
          <Text className="text-xs text-red-500 text-center">{error}</Text>
        )}
        {mutation.isPending || (mutation.isPending && <ActivityIndicator />)}
      </View>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View className="flex-1 justify-center items-center p-4 bg-black/40">
          <View className="p-5 bg-white rounded-2xl shadow-lg w-[92%] max-w-md">
            <Text className="text-xs font-medium text-zinc-500 mb-2">
              Tipo de entrada
            </Text>

            {commandEntries.map((entry: any) => {
              return (
                <Pressable
                  key={entry.IDTipoEntrada}
                  className="flex-row items-center gap-3 py-2"
                  onPress={() =>
                    form.setValue(
                      "IDTipoEntrada",
                      String(entry.IDTipoEntrada),
                    )
                  }
                >
                  <View className="h-5 w-5 rounded-full border-2 border-zinc-300 items-center justify-center">
                    {form.watch("IDTipoEntrada") ===
                      String(entry.IDTipoEntrada) && (
                      <View className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    )}
                  </View>
                  <Text className="text-zinc-700">{entry.Nome}</Text>
                </Pressable>
              );
            })}

            <View className="flex-row mt-5 items-center justify-end gap-3">
              <TouchableOpacity
                onPress={() => setOpen(false)}
                className="px-4 py-2.5 rounded-lg bg-zinc-100"
              >
                <Text className="text-zinc-600 font-medium">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={form.handleSubmit(handleOpenCommand)}
                className="px-5 py-2.5 rounded-lg bg-emerald-500"
              >
                <Text className="text-white font-semibold">Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ResponsiveScreen>
  );
};
