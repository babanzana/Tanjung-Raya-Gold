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
import { AdminDashboardContainer } from "../features/admin/admin-screen/admin-dashboard/admin-dashboard.container";
import { AdminTransactionsContainer } from "../features/admin/admin-screen/admin-transactions/admin-transactions.container";
import { AdminReportContainer } from "../features/admin/admin-screen/admin-report/admin-report.container";

function TransactionsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Transactions</Text>
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
const AdminDashboardStack = createStackNavigator();
const AdminTransactionsStack = createStackNavigator();
// Stack navigator untuk Dashboard
function AdminDashboardScreen() {
  return (
    <AdminDashboardStack.Navigator>
      <AdminDashboardStack.Screen
        name="AdminDashboard"
        component={AdminDashboardContainer}
        options={{ headerShown: true }} // Menampilkan header
      />
    </AdminDashboardStack.Navigator>
  );
}

function AdminTransactionsScreen() {
  return (
    <AdminTransactionsStack.Navigator>
      <AdminTransactionsStack.Screen
        name="AdminTransactions"
        component={AdminTransactionsContainer}
        options={{ headerShown: true }}
      />
    </AdminTransactionsStack.Navigator>
  );
}

function AdminStackScreen() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: true }}>
      <AdminStack.Screen name="AdminLayout" component={AdminLayoutContainer} />
      <AdminStack.Screen name="Customers" component={AdminCustomersContainer} />
      <AdminStack.Screen
        name="EditCustomer"
        component={AdminCustomersDetailContainer}
      />
      <AdminStack.Screen name="Reports" component={AdminReportContainer} />
      <AdminStack.Screen name="Logout" component={LogoutScreen} />
    </AdminStack.Navigator>
  );
}

function AdminProductScreen() {
  return (
    <AdminProductStack.Navigator screenOptions={{ headerShown: true }}>
      <AdminProductStack.Screen
        name="AdminProducts"
        component={AdminProductContainer}
      />
      <AdminProductStack.Screen
        name="AdminProductEdit"
        component={AdminProductDetailContainer}
        options={{ title: "Edit Product" }}
      />
    </AdminProductStack.Navigator>
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
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardScreen} // Menggunakan StackNavigator untuk Dashboard
      />
      <Tab.Screen
        name="Transactions"
        component={AdminTransactionsScreen} // Menggunakan StackNavigator untuk Dashboard
      />
      <Tab.Screen name="Products" component={AdminProductScreen} />
      <Tab.Screen name="Admin" component={AdminStackScreen} />
    </Tab.Navigator>
  );
}
