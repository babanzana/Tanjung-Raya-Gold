// bottom-tab-navigator.tsx
import { Ionicons } from "@expo/vector-icons";
import { HomeScreen } from "../features/home/home.screen"; // Ganti dengan path yang benar
import { CartContainer } from "../features/cart/cart.container";
import { ProfileContainer } from "../features/profile/profile.container";
import { createMaterialBottomTabNavigator } from "react-native-paper/react-navigation";
import type { MaterialBottomTabNavigationOptions } from "react-native-paper/react-navigation";
import { RouteProp } from "@react-navigation/native";
// Buat stack navigator untuk home
import { createStackNavigator } from "@react-navigation/stack";
import { ProductDetailContainer } from "../features/home/detail-product/detail-product.container";

type TabParamList = {
  HomeStack: undefined; // Ubah menjadi stack navigator
  Cart: undefined;
  Profile: undefined;
};

type TabBarIconProps = {
  color: string;
  size: number;
};

const Tab = createMaterialBottomTabNavigator<TabParamList>();

const HomeStack = createStackNavigator();

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen
      name="Home"
      component={HomeScreen}
      options={{ headerShown: true }}
    />
    <HomeStack.Screen name="ProductDetail" component={ProductDetailContainer} />
  </HomeStack.Navigator>
);

export const BottomTabNavigator = () => {
  const getIconName = (routeName: string) => {
    switch (routeName) {
      case "HomeStack":
        return "home-outline";
      case "Cart":
        return "cart-outline";
      case "Profile":
        return "person-outline";
      default:
        return "home-outline";
    }
  };

  return (
    <Tab.Navigator
      initialRouteName="HomeStack"
      screenOptions={({ route }: { route: RouteProp<TabParamList> }) => ({
        tabBarIcon: ({ color }: TabBarIconProps) => {
          const iconName = getIconName(route.name);
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: "Home",
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartContainer}
        options={{
          tabBarLabel: "Cart",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileContainer}
        options={{
          tabBarLabel: "Profile",
        }}
      />
    </Tab.Navigator>
  );
};
