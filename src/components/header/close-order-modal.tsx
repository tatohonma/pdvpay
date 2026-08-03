import Lucide from "@react-native-vector-icons/lucide";
import { useState } from "react";
import { Alert, Modal, Text, TouchableOpacity, View } from "react-native";
import { useOrderStore } from "../../store/useOrderStore";
import {
  type RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextInput } from "../ui/text-input";
import { useAskCloseOrderMutation } from "../../hooks/useAskCloseAccountMutation";
import { useAppStore } from "../../store/useAppStore";
import { useServerConfig } from "../../store/useSettingsStore";

import { NativeModules } from "react-native";
import { useGetOrder } from "../../hooks/useGetOrder";
import { buildPreAccount } from "../../utils/pre-account";

type DetailsRouteProp = RouteProp<
  { Order: { number: string; type: "command" | "table" } },
  "Order"
>;

const schema = z.object({
  people_number: z.coerce.number({
    message: "Numero de pessoas é um campo obrigatório",
  }),
});

export const CloseOrderModal = () => {
  const { params } = useRoute<DetailsRouteProp>();
  const [visible, setVisible] = useState<boolean>(false);
  const { currentOrderInfo } = useOrderStore();
  const { pdv, user } = useAppStore();
  const navigation = useNavigation();
  const serverConfig = useServerConfig();

  const order = useGetOrder({ id: String(currentOrderInfo?.idPedido) });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      people_number: 1,
    },
  });

  const closeOrderMutation = useAskCloseOrderMutation({
    onSuccess: (data) => {
      console.log("Data", data);
      // if (data.status === 1) {
      if (serverConfig.AutenticarSempre === "1") {
        navigation.reset({
          index: 0,
          routes: [{ name: "Auth" }],
        });
        return;
      }
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
      return;
      // }
    },
    onError: (error) => {
      console.log("Something went wrong", error);
      Alert.alert("Algo deu errado");
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const x = 1;
    if (1 === x) {
      const content = JSON.stringify(buildPreAccount(order.data as any));
      NativeModules.StonePrinter.print(content);
      return;
    }
    await closeOrderMutation.mutateAsync({
      guidIdentificacao: String(currentOrderInfo?.guidIdentificacao),
      idPDV: Number(pdv.idPDV),
      idPedido: Number(currentOrderInfo?.idPedido),
      idTipoPagamento: 1,
      idTipoPedido: Number(currentOrderInfo?.idTipoPedido),
      idUsuario: Number(user.id),
      impressaoConta: 2, // buscar dinamicamente
      infoMesa: 0,
      numero: Number(params.number),
      quantidadePessoas: data.people_number,
    });
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className="p-1 rounded-full"
      >
        <Lucide name="dollar-sign" size={18} color="white" />
      </TouchableOpacity>
      <Modal
        transparent
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <View className="flex-1 justify-center items-center p-4">
          <View className="p-4 bg-zinc-50 rounded shadow-lg w-[92%] max-w-md">
            <Text className="text-sm text-zinc-600">Fechamento</Text>
            <Text className="font-medium text-lg">
              {params.type === "table" ? "Mesa" : "Comanda"}: {params.number}
            </Text>

            <TextInput
              control={form.control}
              label="Número de Pessoas"
              name="people_number"
              className="border-b border-b-zinc-600 text-zinc-500"
            />

            <View className="flex-row mt-4 items-center justify-end gap-4">
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={form.handleSubmit(onSubmit)}>
                <Text>Fechar conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
