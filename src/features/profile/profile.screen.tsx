import React, { useState } from "react";
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
import { auth, logoutUser } from "../../../firebase";

interface User {
  name: string;
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

export const ProfileScreen = ({ route, navigation }: any) => {
  const [user, setUser] = useState<User>({
    name: "Kevin",
    email: "kevin11@gmail.com",
    nohp: "081234567890",
    address: "Jl. Raya No. 123, Pontianak",
  });

  const [wishlist, setWishlist] = useState<Product[]>([
    {
      id: 1,
      name: "Emas Batangan 1 Gram",
      price: 985000,
      quantity: 1,
      image:
        "https://www.logammulia.com/uploads/ngc_master_item/5cdcae8ad46b6_20190516072754-2.jpg",
      category: "Batangan",
      stock: 15,
    },
    {
      id: 8,
      name: "Emas Koin 0.2 Gram",
      category: "Koin",
      price: 500000,
      quantity: 1,
      stock: 25,
      rating: 4.6,
      image:
        "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//catalog-image/108/MTA-150699626/idn_bulion_citraperkasa_idn_bulion_angpao_naga_koin_emas_logam_mulia_-0-2_g_-_24k_-_999-9_gold-_full09_isgvag1j.jpg",
      description:
        "Koin emas setengah gram dengan gambar khusus edisi terbatas.",
    },
    {
      id: 9,
      name: "Emas Koin 0.5 Gram",
      category: "Koin",
      price: 990000,
      quantity: 3,
      stock: 18,
      rating: 4.7,
      image:
        "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/2/13/04829d0c-a545-40c7-a88d-7f688b136c51.jpg",
      description:
        "Koin emas 1 gram dengan kemasan eksklusif. Nilai investasi yang stabil.",
    },
  ]);

  const [transactionHistory, setTransactionHistory] = useState<Product[]>([
    {
      id: 1,
      name: "Emas Batangan 1 Gram",
      price: 985000,
      quantity: 1,
      image:
        "https://www.logammulia.com/uploads/ngc_master_item/5cdcae8ad46b6_20190516072754-2.jpg",
      category: "Batangan",
    },
    {
      id: 9,
      name: "Emas Koin 0.5 Gram",
      category: "Koin",
      price: 990000,
      quantity: 3,
      image:
        "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/2/13/04829d0c-a545-40c7-a88d-7f688b136c51.jpg",
    },
  ]);

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
      navigation.navigate("ProfileDetail", { user, setUser });
    } else if (screen === "TransactionHistory") {
      navigation.navigate("TransactionHistory", {
        transactions: transactionHistory,
      });
    } else if (screen === "Wishlist") {
      navigation.navigate("Wishlist", { wishlist, setWishlist });
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
          source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>{user.name}</Text>
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
