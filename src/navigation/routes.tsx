import { createStaticNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { WithLayout } from "../components/ui/layout";
import { AuthScreen } from "../screens/auth";
import { HomeScreen } from "../screens/home";
import { SetupScreen } from "../screens/setup";
import { useSettingsStore } from "../store/useSettingsStore";
import { OrderScreen } from "../screens/order";
import { SettingsScreen } from "../screens/settings";
import { OrderActions } from "../components/header/orders-actions";
import { OrderDetailsScreen } from "../screens/order-details";
import { CheckIn } from "../screens/checkin";

const getInicialRouteName = () => {
  const serverURL = useSettingsStore.getState().serverURL;
  if (!serverURL) return "Setup";

  return "Auth";
};

export const RootStack = createNativeStackNavigator({
  initialRouteName: getInicialRouteName(),
  screenOptions: {
    headerShown: true,
    animation: "fade",
    headerStyle: {
      backgroundColor: "#0891B2",
    },
    headerTintColor: "#fff",
    headerShadowVisible: false,
    title: "PDVSEVEN",
  },
  screens: {
    Home: HomeScreen,
    Setup: SetupScreen,
    Auth: AuthScreen,
    Settings: WithLayout(SettingsScreen),
    CheckIn: CheckIn,
    Order: {
      screen: OrderScreen,
      options: {
        title: "Pedido",
        headerRight: OrderActions,
      },
    },
    OrderDetails: {
      screen: OrderDetailsScreen,
      options: {
        title: "Confirmados",
      },
    },
  },
});

export const Navigation = createStaticNavigation(RootStack);
