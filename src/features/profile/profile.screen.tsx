import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db, logoutUser } from "../../../firebase";
import { Auth, getAuth } from "@firebase/auth";
import { Database, get, ref } from "@firebase/database";

interface User {
  fullName: string;
  email: string;
  nohp: string;
  address: string;
}

interface MenuItem {
  id: number;
  title: string;
  icon: string;
  screen?: string;
  action?: () => void;
}

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  stock?: number;
  rating?: number;
  description?: string;
}
const auth: Auth = getAuth();
const database: Database = db;

export const ProfileScreen = ({ route, navigation }: any) => {
  const [user, setUser] = useState<User>({
    fullName: "Kevin",
    email: "kevin11@gmail.com",
    nohp: "081234567890",
    address: "Jl. Raya No. 123, Pontianak",
  });

  const menuItems: MenuItem[] = [
    {
      id: 1,
      title: "Profile Detail",
      icon: "📝",
      screen: "ProfileDetail",
    },
    {
      id: 2,
      title: "Transaction History",
      icon: "📋",
      screen: "TransactionHistory",
    },
    {
      id: 3,
      title: "Wishlist",
      icon: "❤️",
      screen: "Wishlist",
    },
    {
      id: 4,
      title: "FAQ",
      icon: "❓",
      screen: "FAQ",
    },
    {
      id: 5,
      title: "About",
      icon: "ℹ️",
      screen: "About",
    },
    {
      id: 6,
      title: "Logout",
      icon: "🚪",
      action: () => handleLogout(),
    },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = ref(database, `users/${user.uid}`);
          const snapshot = await get(userRef);

          if (snapshot.exists()) {
            setUser(snapshot.val());
          } else {
            // setError("User data not found");
          }
        } else {
          // setError("User not authenticated");
        }
      } catch (err) {
        // setError((err as Error).message);
      } finally {
        // setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            console.log("User logged out");
            logoutUser();
          },
        },
      ],
      { cancelable: false }
    );
  };

  const navigateToScreen = (screen: string) => {
    if (screen === "ProfileDetail") {
      navigation.navigate("ProfileDetail");
    } else if (screen === "TransactionHistory") {
      navigation.navigate("TransactionHistory");
    } else if (screen === "Wishlist") {
      navigation.navigate("Wishlist");
    } else {
      navigation.navigate(screen);
    }
  };

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() =>
        item.screen ? navigateToScreen(item.screen) : item.action?.()
      }
    >
      <Text style={styles.menuIcon}>{item.icon}</Text>
      <Text style={styles.menuText}>{item.title}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* User Info Section */}
      <View style={styles.userInfoContainer}>
        <Image
          source={require("../../../assets/profile.jpg")}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>{user.fullName}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      {/* Menu Section */}
      <View style={styles.menuContainer}>{menuItems.map(renderMenuItem)}</View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  userInfoContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
  },
  menuContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  menuArrow: {
    fontSize: 24,
    color: "#999",
  },
});
