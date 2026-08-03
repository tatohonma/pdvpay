import { Lucide } from "@react-native-vector-icons/lucide";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity, View } from "react-native";
import { queryClient } from "../../config/query";
import { useServerConfig } from "../../store/useSettingsStore";
import { AskRefModal } from "./ref-modal";
import { CloseOrderModal } from "./close-order-modal";

export const OrderActions = () => {
  const navigation = useNavigation();
  const serverConfig = useServerConfig();

  return (
    <View className="flex-row gap-1">
      <TouchableOpacity
        onPress={() => queryClient.invalidateQueries()}
        className="p-1 rounded-full"
      >
        <Lucide name="rotate-cw" size={18} color="white" />
      </TouchableOpacity>
      {serverConfig?.MostrarLista === "1" && (
        <TouchableOpacity
          onPress={() => navigation.navigate("OrderDetails")}
          className="p-1 rounded-full"
        >
          <Lucide name="menu" size={18} color="white" />
        </TouchableOpacity>
      )}

      {serverConfig.SolicitarRef === "1" && <AskRefModal />}
      <CloseOrderModal />
      {/* {serverConfig.MostrarFecharConta === '1' && <CloseOrderModal />} */}
    </View>
  );
};
