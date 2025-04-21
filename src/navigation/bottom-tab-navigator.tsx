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
import { CheckoutContainer } from "../features/cart/checkout/checkout.container";
import { TransactionHistoryContainer } from "../features/profile/transaction-history/transaction-history.container";
import { WishlistContainer } from "../features/profile/wishlist/wishlist.container";
import { FAQContainer } from "../features/profile/faq/faq.container";
import { AboutContainer } from "../features/profile/about/about.container";
import { ProfileDetailContainer } from "../features/profile/profile-detail/profile-detail.container";

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
const CartStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: true }}>
    <HomeStack.Screen
      name="Home"
      component={HomeScreen}
      options={{ headerShown: true, title: "Tanjung Raya Gold" }}
    />
    <HomeStack.Screen
      name="ProductDetail"
      component={ProductDetailContainer}
      options={{ title: "Product Detail" }}
    />
  </HomeStack.Navigator>
);

const CartStackNavigator = () => (
  <CartStack.Navigator screenOptions={{ headerShown: true }}>
    <CartStack.Screen
      name="Cart"
      component={CartContainer}
      options={{ title: "Cart" }}
    />
    <CartStack.Screen
      name="Checkout"
      component={CheckoutContainer}
      options={{ title: "Checkout" }}
    />
  </CartStack.Navigator>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: true }}>
    <ProfileStack.Screen
      name="Profile"
      component={ProfileContainer}
      options={{ title: "Profile" }}
    />
    <ProfileStack.Screen
      name="ProfileDetail"
      component={ProfileDetailContainer}
      options={{ title: "Profile Detail" }}
    />
    <CartStack.Screen
      name="TransactionHistory"
      component={TransactionHistoryContainer}
      options={{ title: "Transaction History" }}
    />
    <CartStack.Screen
      name="Wishlist"
      component={WishlistContainer}
      options={{ title: "Wishlist" }}
    />
    <CartStack.Screen
      name="FAQ"
      component={FAQContainer}
      options={{ title: "FAQ" }}
    />
    <CartStack.Screen
      name="About"
      component={AboutContainer}
      options={{ title: "About" }}
    />
  </ProfileStack.Navigator>
);

export const BottomTabNavigator = () => {
  const getIconName = (routeName: string) => {
    switch (routeName) {
      case "HomeStack":
        return "home-outline";
      case "CartStack":
        return "cart-outline";
      case "ProfileStack":
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
        name="CartStack"
        component={CartStackNavigator}
        options={{
          tabBarLabel: "Cart",
        }}
      />
      <Tab.Screen
        name="ProfileStack"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: "Profile",
        }}
      />
    </Tab.Navigator>
  );
};
