import React, { useState } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { DUMMY_USERS } from "../../../../dummy";

interface Customer {
  id: number;
  nama: string;
  username: string;
  email: string;
  roles: string;
  alamat: string;
  imageUrl: string;
}

export const AdminCustomersScreen = ({ navigation }: any) => {
  const [customers, setCustomers] = useState<Customer[]>(DUMMY_USERS[0].users);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredCustomers = customers.filter((customer) => {
    return (
      customer.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.roles.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleDelete = (id: number) => {
    setCustomers(customers.filter((customer) => customer.id !== id));
  };

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <View style={styles.customerCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.customerImage} />
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.nama}</Text>
        <Text style={styles.customerEmail}>{item.email}</Text>
        <Text style={styles.customerRole}>Role: {item.roles}</Text>
        <Text style={styles.customerAddress} numberOfLines={1}>
          {item.alamat}
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
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
      />

      {/* Add Customer Button */}
      <TouchableOpacity
        style={styles.addButton}
        // onPress={() => navigation.navigate("AddCustomer")}
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
  customerRole: {
    fontSize: 12,
    color: "#888",
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
