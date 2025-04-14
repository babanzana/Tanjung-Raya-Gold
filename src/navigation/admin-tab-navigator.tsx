// File: src/navigation/bottom-tab-navigator.tsx
import { createMaterialBottomTabNavigator } from "react-native-paper/react-navigation";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AdminLayoutContainer } from "../features/admin/admin-screen/admin-layout/admin-layout.container";
import { AdminProductContainer } from "../features/admin/admin-screen/admin-product/admin-product.container";
import { AdminProductDetailContainer } from "../features/admin/admin-screen/admin-product-detail/admin-product-detail.container";
import { AdminCustomersContainer } from "../features/admin/admin-screen/admin-customers/admin-customers.container";
import { AdminCustomersDetailContainer } from "../features/admin/admin-screen/admin-customers-edit/admin-customers-detail.container";

// 1. Screen Components
function DashboardScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Dashboard</Text>
    </View>
  );
}

function TransactionsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Transactions</Text>
    </View>
  );
}

// Admin Sub-screens
function CustomersScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Customers</Text>
    </View>
  );
}

function ReportsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Reports</Text>
    </View>
  );
}

function LogoutScreen() {
  Alert.alert("Logout", "Yakin ingin keluar?", [
    { text: "Batal", style: "cancel" },
    { text: "Keluar", onPress: () => console.log("Logout executed") },
  ]);
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Memproses logout...</Text>
    </View>
  );
}

// 2. Admin Stack Navigator
const AdminStack = createStackNavigator();
const AdminProductStack = createStackNavigator();
function AdminStackScreen() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: true }}>
      <AdminStack.Screen name="Admin" component={AdminLayoutContainer} />
      <AdminStack.Screen name="Customers" component={AdminCustomersContainer} />
      <AdminStack.Screen
        name="EditCustomer"
        component={AdminCustomersDetailContainer}
      />
      <AdminStack.Screen name="Reports" component={ReportsScreen} />
      <AdminStack.Screen name="Logout" component={LogoutScreen} />
    </AdminStack.Navigator>
  );
}

function AdminProductScreen() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: true }}>
      <AdminStack.Screen
        name="AdminProducts"
        component={AdminProductContainer}
      />
      <AdminStack.Screen
        name="AdminProductEdit"
        component={AdminProductDetailContainer}
        options={{ title: "Edit Product" }}
      />
    </AdminStack.Navigator>
  );
}

// 3. Main Tab Navigator
const Tab = createMaterialBottomTabNavigator();

export function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: any) => ({
        tabBarIcon: ({ focused, color, size }: any) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          size = 24;
          color = focused ? "#1e88e5" : "gray";

          switch (route.name) {
            case "Dashboard":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Transactions":
              iconName = focused ? "receipt" : "receipt-outline";
              break;
            case "Products":
              iconName = focused ? "cube" : "cube-outline";
              break;
            case "Admin":
              iconName = focused ? "settings" : "settings-outline";
              break;
            default:
              iconName = "alert-circle";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#1e88e5",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Products" component={AdminProductScreen} />
      <Tab.Screen name="Admin" component={AdminStackScreen} />
    </Tab.Navigator>
  );
}
