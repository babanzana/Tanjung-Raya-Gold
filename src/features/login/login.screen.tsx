import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";

export const LoginComponent = ({ navigation }: any) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // Tambahkan state untuk email
  const [showForgotPassword, setShowForgotPassword] = useState(false); // Toggle form lupa password

  const handleLogin = () => {
    // Validasi input tidak boleh kosong
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Username dan password harus diisi");
      return;
    }

    // Daftar user valid (ini hanya contoh, di real app gunakan backend/auth service)
    const validUsers = [
      { username: "tanjungraya@gmail.com", password: "tanjung123" },
      { username: "admintanjung@gmail.com", password: "admin123" },
    ];

    // Cari user yang sesuai
    const user = validUsers.find(
      (u) => u.username === username.trim() && u.password === password.trim()
    );

    if (user) {
      // Login berhasil
      Alert.alert("Success", "Login berhasil!");
      // Contoh: navigation.navigate('Home') untuk pindah ke halaman berikutnya
    } else {
      // Login gagal
      Alert.alert(
        "Error",
        "Username atau password salah",
        [{ text: "OK", onPress: () => setPassword("") }] // Reset password field
      );
      setPassword(""); // Clear password field
    }
  };

  const handleForgotPassword = () => {
    // Validasi email sederhana
    if (!email.includes("@") || !email.includes(".")) {
      Alert.alert("Error", "Masukkan email yang valid");
      return;
    }

    // Logika kirim email reset password
    console.log(`Email reset password dikirim ke: ${email}`);
    Alert.alert(
      "Email Terkirim",
      `Instruksi reset password telah dikirim ke ${email}`
    );
    setShowForgotPassword(false);
    setEmail("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.header}>Login</Text>

        {!showForgotPassword ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              onPress={() => setShowForgotPassword(true)}
              style={styles.forgotPasswordLink}
            >
              <Text style={styles.linkText}>Lupa Password?</Text>
            </TouchableOpacity>

            <Button title="Login" onPress={handleLogin} />
          </>
        ) : (
          <>
            <Text style={styles.subHeader}>Reset Password</Text>
            <Text style={styles.instruction}>
              Masukkan email Anda untuk menerima instruksi reset password
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <View style={styles.buttonGroup}>
              <Button
                title="Kirim Instruksi"
                onPress={handleForgotPassword}
                color="#007BFF"
              />
              <Button
                title="Kembali ke Login"
                onPress={() => setShowForgotPassword(false)}
                color="#999"
              />
            </View>
          </>
        )}

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account?</Text>
          <Text
            style={styles.registerLink}
            onPress={() => navigation.navigate("Register")}
          >
            Register here
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  form: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 10,
    elevation: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  subHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  instruction: {
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  forgotPasswordLink: {
    alignSelf: "flex-end",
    marginBottom: 15,
  },
  linkText: {
    color: "#007BFF",
    fontSize: 14,
  },
  buttonGroup: {
    flexDirection: "column",
    gap: 10,
    marginBottom: 20,
  },
  registerContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    color: "#007BFF",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
