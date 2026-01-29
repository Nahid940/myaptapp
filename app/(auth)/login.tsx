import { useState } from "react";
import { View, TextInput, Pressable , Text, Alert, KeyboardAvoidingView, Platform, StyleSheet, Image } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});


  const handleLogin = async () => {

    setErrors({});

    let valid = true;
    const newErrors: typeof errors = {};

    if (!username.trim()) {
      newErrors.username = "Please enter your username!";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Please enter your password!";
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<{ token?: string; message?: string }>("/login", {
        username,
        password,
      });

      if (response?.token) {
        await login(response.token);
        router.replace("(tabs)/home");
      } else {
        Alert.alert("Login Failed", response?.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hide navigation header */}
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaProvider style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
        <Image
            source={require("../../assets/images/residdologo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>
                Welcome to Residoo
          </Text>
          <Text style={styles.message}>
                A complete platform for your smarter leaving
          </Text>
        <View style={styles.inputGroup}>
            {/* <Text style={styles.label}>Username</Text> */}
            {errors.username && <Text style={styles.error}>{errors.username}</Text>}
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Enter Your Username"
            autoCapitalize="none"
            style={styles.input}
          />
        </View> 
         <View style={styles.inputGroup}>
            {/* <Text style={styles.label}>Password</Text> */}
            {errors.password && <Text style={styles.error}>{errors.password}</Text>}
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter Your Password"
            secureTextEntry
            style={styles.input}
          />
        </View>         
        <Pressable  
            onPress={handleLogin}
            disabled={loading}
            style={styles.button}
          >
             <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                {loading ? "Loading..." : "Login"}
            </Text>
         </Pressable>
        </KeyboardAvoidingView>
      </SafeAreaProvider>
    </>
  );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#e8feffff",
    },
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 10,
    },
    button: {
        backgroundColor: "#4a9af0ff",
        height: 50,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        color:"#fff"
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
    },
    logo: {
        width: 150,
        height: 150,
        alignSelf: "center",
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        color:"#358fff"
    },

    message:{
        alignSelf:"center",
        marginBottom:10,
        color:'#ff0062ff',
        fontWeight:"bold"
    },
    inputGroup: {
        marginBottom: 0,
    },
    label: {
        marginBottom: 0,
        fontSize: 16,
        fontWeight: "500",
        color:"#358fff"
    },
    error: {
        color: "red",
        marginTop: 0,
        fontSize: 14,
    },
    errorGeneral: {
        color: "red",
        textAlign: "center",
        marginBottom: 0,
        fontSize: 14,
    },
});
