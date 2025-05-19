import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  RefreshControl,
} from "react-native";
import {
  deleteCustomer,
  getAllCustomers,
  searchCustomers,
} from "../../../../../firebase";

interface Customer {
  id: number;
  nama: string;
  username: string;
  email: string;
  nohp: string;
  alamat: string;
  imageUrl: string;
}

export const AdminCustomersScreen = ({ navigation }: any) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const filteredCustomers = customers.filter((customer) => {
    return (
      customer.nama?.toLowerCase().includes(searchQuery.toLowerCase() || "") ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase() || "") ||
      customer.nohp?.toLowerCase().includes(searchQuery.toLowerCase() || "") // Search by phone number
    );
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Function to fetch customers
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await getAllCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      Alert.alert("Error", "Failed to load customers. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Function to handle search
  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const results = await searchCustomers(searchQuery);
      setCustomers(results);
    } catch (error) {
      console.error("Search failed:", error);
      Alert.alert("Error", "Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Search on text change
  useEffect(() => {
    // Debounce search to avoid too many requests
    const debounceTimeout = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  // Function to handle delete
  const handleDelete = (customer: Customer) => {
    Alert.alert(
      "Delete Customer",
      `Are you sure you want to delete ${customer.nama}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCustomer(customer.id);
              // Remove from local state
              setCustomers((prevCustomers) =>
                prevCustomers.filter((c) => c.id !== customer.id)
              );
              Alert.alert("Success", "Customer deleted successfully");
            } catch (error) {
              console.error("Delete failed:", error);
              Alert.alert(
                "Error",
                "Failed to delete customer. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCustomers();
  };

  const renderCustomerItem = ({ item }: { item: any }) => {
    // console.log("🚀 ~ renderCustomerItem ~ item:", item);
    return (
      <View style={styles.customerCard}>
        {/* <Image
        source={{ uri: item.imageUrl || "https://placekitten.com/200/200" }}
        style={styles.customerImage}
      /> */}
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.fullName || "No Name"}</Text>
          <Text style={styles.customerEmail}>{item.email || "No Email"}</Text>
          <Text style={styles.customerPhone}>
            No. HP: {item.phoneNumber || "-"}
          </Text>
          <Text style={styles.customerAddress} numberOfLines={1}>
            {item.address || "No Address"}
          </Text>
        </View>
        <View style={styles.customerActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate("EditCustomer", { customer: item })
            }
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Customer List */}
      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomerItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No customers found</Text>
        }
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      />

      {/* Add Customer Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("EditCustomer")}
      >
        <Text style={styles.addButtonText}>+ Add New Customer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  listContainer: {
    paddingBottom: 80,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
  customerCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  customerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  customerName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  customerPhone: {
    // New style for phone number
    fontSize: 14,
    color: "#444",
    marginBottom: 2,
  },
  customerAddress: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  customerActions: {
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  editButton: {
    backgroundColor: "#28a745",
    padding: 6,
    borderRadius: 4,
    marginBottom: 4,
    minWidth: 60,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    padding: 6,
    borderRadius: 4,
    minWidth: 60,
  },
  buttonText: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
