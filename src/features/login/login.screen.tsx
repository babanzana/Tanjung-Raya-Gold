import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { loginUser, resetPassword } from "../../../firebase";
// import { auth } from "../../../firebase";

export const LoginComponent = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    return () => setIsMounted(false);
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Email and password must be filled");
      return;
    }

    setLoading(true);
    try {
      const result = await loginUser(email, password);
      if (!isMounted) return;

      if (!result.success) {
        Alert.alert("Error", "Wrong Password or Email");
        setPassword("");
      }
    } catch (error) {
      if (!isMounted) return;
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.includes("@") || !email.includes(".")) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email);
      if (!isMounted) return;

      if (result.success) {
        Alert.alert(
          "Email Sent",
          `Password reset instructions have been sent to ${email}`
        );
        setShowForgotPassword(false);
      } else {
        Alert.alert("Error", result.error);
      }
    } catch (error) {
      if (!isMounted) return;
      Alert.alert("Error", "Failed to send reset email. Please try again.");
    } finally {
      if (isMounted) setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.header}>Login</Text>

        {!showForgotPassword ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
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
              <Text style={styles.linkText}>Forgot Password?</Text>
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <Button title="Login" onPress={handleLogin} />
            )}
          </>
        ) : (
          <>
            <Text style={styles.subHeader}>Reset Password</Text>
            <Text style={styles.instruction}>
              Enter your email to receive password reset instructions
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
              {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : (
                <>
                  <Button
                    title="Send Instructions"
                    onPress={handleForgotPassword}
                    color="#007BFF"
                  />
                  <Button
                    title="Back to Login"
                    onPress={() => setShowForgotPassword(false)}
                    color="#999"
                  />
                </>
              )}
            </View>
          </>
        )}

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerLink}>Register here</Text>
          </TouchableOpacity>
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
