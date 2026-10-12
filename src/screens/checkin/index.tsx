import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import z from "zod";
import { Keypad } from "../../components/ui/keypad";
import { ResponsiveScreen } from "../../components/ui/layout";
import { useServerConfig } from "../../store/useSettingsStore";
import {
  StackActions,
  type StaticScreenProps,
  useNavigation,
} from "@react-navigation/native";
import {
  type ClientSearchParams,
  type InsertClientRequest,
  getClient,
  insertClient,
} from "../../api/client";
import { getCommandEntry, openCommand } from "../../api/command";
import { usePDV, useUser } from "../../store/useAppStore";
import { useOrderStoreActions } from "../../store/useOrderStore";
import { validateCommand } from "../../soap/validate-command";
import { useQuery } from "@tanstack/react-query";

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

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const isValidCpf = (cpf: string) => {
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  const digit = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += Number(cpf[i]) * (length + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
};

// TipoCliente 1 aceita os dois: CPF válido ou CNPJ é documento, o resto é telefone
const isDocument = (value: string, clientType: ClientType) => {
  if (clientType === 0) return true;
  if (clientType === 2) return false;
  return value.length === 14 || isValidCpf(value);
};

const buildSearchParams = (
  value: string,
  clientType: ClientType,
): ClientSearchParams =>
  isDocument(value, clientType) ? { documento: value } : { telefone: value };

const buildNewClient = (
  name: string,
  value: string,
  clientType: ClientType,
): InsertClientRequest => {
  if (isDocument(value, clientType)) {
    return { NomeCompleto: name, Documento1: value };
  }

  // Com DDD (10 ou 11 dígitos) o DDD vai em campo separado
  if (value.length >= 10) {
    return {
      NomeCompleto: name,
      Telefone1DDD: Number(value.slice(0, 2)),
      Telefone1Numero: Number(value.slice(2)),
    };
  }

  return { NomeCompleto: name, Telefone1Numero: Number(value) };
};

export const CheckIn = (props: Props) => {
  const [error, setError] = useState<string | null>("");
  const [loading, setLoading] = useState(false);
  const [entryOpen, setEntryOpen] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientId, setClientId] = useState<number | null>(null);
  const { TipoCliente, AbrirComanda } = useServerConfig();
  const { idPDV } = usePDV();
  const { id } = useUser();
  const { setCurrentOrderInfo } = useOrderStoreActions();
  const navigation = useNavigation();

  const { data: commandEntries } = useQuery({
    queryKey: ["command-entry"],
    queryFn: getCommandEntry,
  });

  const clientType = Number(TipoCliente ?? 0) as ClientType;
  const clientString = CLIENT_TYPE_MAP[clientType] ?? CLIENT_TYPE_MAP[0];
  const { type, number } = props.route.params;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      number: "",
      IDTipoEntrada: "0",
    },
  });

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    try {
      await fn();
    } catch (e) {
      setError("Ouve um erro ao abrir comanda!");
      Alert.alert("Erro ao abrir comanda", JSON.stringify(e));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCommand = async (
    selectedClientId: number,
    idTipoEntrada: number,
  ) => {
    const payload = {
      ClienteID: selectedClientId,
      Comanda: Number(number),
      IDTipoEntrada: idTipoEntrada,
      PDVID: idPDV as number,
      UsuarioID: id as number,
    };

    const validation = await openCommand({ ...payload, Validar: true });

    const errorMsg = "Já existe comanda aberta para esse cliente";
    if (validation?.Mensagem?.includes(errorMsg)) {
      setError(validation.Mensagem);
      return;
    }

    await openCommand({ ...payload, Validar: false });

    // Carrega os dados do pedido da comanda recém-aberta, como faz a Home
    const order = await validateCommand(number);
    if (order?.descricaoErro) {
      setError(order.descricaoErro);
      return;
    }

    setCurrentOrderInfo(order);
    navigation.dispatch(StackActions.replace("Order", { number, type }));
  };

  // Com tipos de entrada cadastrados, pergunta o tipo antes de abrir
  const continueWithClient = async (selectedClientId: number) => {
    setClientId(selectedClientId);

    if (commandEntries?.length) {
      form.setValue("IDTipoEntrada", String(commandEntries[0].IDTipoEntrada));
      setEntryOpen(true);
      return;
    }

    await handleOpenCommand(selectedClientId, 0);
  };

  const onSubmit = (data: z.infer<typeof schema>) =>
    run(async () => {
      const value = onlyDigits(data.number);
      if (!value) {
        setError(`Informe o ${clientString.toLowerCase()}`);
        return;
      }

      const client = await getClient(buildSearchParams(value, clientType));
      if (client?.length) {
        await continueWithClient(client[0].IDCliente);
        return;
      }

      // NOVO: cadastra o cliente; SIM: só aceita cliente já cadastrado
      if (AbrirComanda === "NOVO") {
        setClientName("");
        setNameOpen(true);
        return;
      }

      setError("Cliente não encontrado!");
    });

  const handleCreateClient = () =>
    run(async () => {
      const name = clientName.trim();
      if (!name) return;

      const value = onlyDigits(form.getValues("number"));
      const response = await insertClient(
        buildNewClient(name, value, clientType),
      );

      if (!response?.Id) {
        Alert.alert(
          "Não foi possível cadastrar o cliente",
          response?.Mensagem?.trim() || "Tente novamente",
        );
        return;
      }

      setNameOpen(false);
      await continueWithClient(response.Id);
    });

  const handleConfirmEntry = () =>
    run(async () => {
      if (clientId === null) return;

      setEntryOpen(false);
      await handleOpenCommand(clientId, Number(form.getValues("IDTipoEntrada")));
    });

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
        {loading && (
          <View className="flex-row items-center justify-center gap-2">
            <ActivityIndicator />
            <Text className="text-xs text-zinc-500">Carregando...</Text>
          </View>
        )}
      </View>

      <Modal
        transparent
        visible={nameOpen}
        animationType="fade"
        onRequestClose={() => setNameOpen(false)}
      >
        <View className="flex-1 justify-center items-center p-4 bg-black/40">
          <View className="p-5 bg-white rounded-2xl shadow-lg w-[92%] max-w-md">
            <Text className="text-xs font-medium text-zinc-500">
              Cliente não cadastrado
            </Text>
            <Text className="font-semibold text-lg text-zinc-800 mb-4">
              Novo cliente
            </Text>

            <Text className="text-xs font-medium text-zinc-500 mb-1.5">
              Nome *
            </Text>
            <TextInput
              autoFocus
              value={clientName}
              onChangeText={setClientName}
              autoCapitalize="words"
              placeholder="Nome do cliente"
              placeholderTextColor="#a1a1aa"
              className="h-11 rounded-lg bg-zinc-100 px-3 text-zinc-800"
            />

            <View className="flex-row mt-5 items-center justify-end gap-3">
              <TouchableOpacity
                onPress={() => setNameOpen(false)}
                className="px-4 py-2.5 rounded-lg bg-zinc-100"
              >
                <Text className="text-zinc-600 font-medium">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!clientName.trim() || loading}
                onPress={handleCreateClient}
                className={`px-5 py-2.5 rounded-lg bg-emerald-500 ${clientName.trim() && !loading ? "" : "opacity-50"}`}
              >
                <Text className="text-white font-semibold">Cadastrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={entryOpen}
        animationType="fade"
        onRequestClose={() => setEntryOpen(false)}
      >
        <View className="flex-1 justify-center items-center p-4 bg-black/40">
          <View className="p-5 bg-white rounded-2xl shadow-lg w-[92%] max-w-md">
            <Text className="text-xs font-medium text-zinc-500 mb-2">
              Tipo de entrada
            </Text>

            {(commandEntries ?? []).map((entry: any) => {
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
                onPress={() => setEntryOpen(false)}
                className="px-4 py-2.5 rounded-lg bg-zinc-100"
              >
                <Text className="text-zinc-600 font-medium">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmEntry}
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
