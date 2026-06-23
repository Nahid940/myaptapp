import { useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  Text,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { api } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { colors, isDark } = useTheme();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<"username" | "password" | null>(null);
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
        router.replace("/(tabs)");
      } else {
        newErrors.general = "Login Failed, Invalid credentials";
        setErrors(newErrors);
      }
    } catch (error) {
      newErrors.general = "Login Failed, Invalid credentials";
      setErrors(newErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.root, { backgroundColor: colors.bg }]}>
        {/* Gradient hero */}
        <LinearGradient
          colors={["#159df8", "#0b7dd0", "#0a64b8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {/* decorative circles */}
          <View style={styles.circleOne} />
          <View style={styles.circleTwo} />

          <SafeAreaView style={styles.heroContent}>
            <View style={styles.logoBadge}>
              <Image
                source={require("../../assets/images/residdologo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.heroTitle}>Welcome to ACL</Text>
            <Text style={styles.heroSubtitle}>A complete platform for smarter living</Text>
          </SafeAreaView>
        </LinearGradient>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Floating card */}
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={styles.titleWrap}>
                <View
                  style={[
                    styles.titleIcon,
                    { backgroundColor: isDark ? "#0f2942" : "#e0f2fe" },
                  ]}
                >
                  <Ionicons name="lock-closed" size={22} color="#159df8" />
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Sign In</Text>
                <View style={styles.titleAccent} />
                <Text style={styles.cardSubtitle}>Login to manage your residence</Text>
              </View>

              {errors.general ? (
                <View style={styles.generalError}>
                  <Ionicons name="alert-circle" size={18} color="#e11d48" />
                  <Text style={styles.generalErrorText}>{errors.general}</Text>
                </View>
              ) : null}

              {/* Username */}
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: colors.inputBg, borderColor: colors.border },
                  focused === "username" && { borderColor: colors.primary },
                  errors.username && { borderColor: "#f43f5e" },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={focused === "username" ? colors.primary : colors.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  onFocus={() => setFocused("username")}
                  onBlur={() => setFocused(null)}
                  placeholder="Username"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  style={[styles.input, { color: colors.text }]}
                />
              </View>
              {errors.username ? <Text style={styles.fieldError}>{errors.username}</Text> : null}

              {/* Password */}
              <View
                style={[
                  styles.inputWrapper,
                  { marginTop: 16, backgroundColor: colors.inputBg, borderColor: colors.border },
                  focused === "password" && { borderColor: colors.primary },
                  errors.password && { borderColor: "#f43f5e" },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={focused === "password" ? colors.primary : colors.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  placeholder="Password"
                  placeholderTextColor={colors.muted}
                  secureTextEntry={!showPassword}
                  style={[styles.input, { color: colors.text }]}
                />
                <Pressable
                  hitSlop={10}
                  onPress={() => setShowPassword((s) => !s)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#94a3b8"
                  />
                </Pressable>
              </View>
              {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}

              {/* Login button */}
              <Pressable
                onPress={handleLogin}
                disabled={loading}
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              >
                <LinearGradient
                  colors={loading ? ["#7cc4f3", "#7cc4f3"] : ["#159df8", "#0b7dd0"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Login</Text>
                      <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </View>

            <Text style={styles.footer}>ACL — Developed by MNP Techs.</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  flex: {
    flex: 1,
  },
  hero: {
    height: 320,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
  },
  heroContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
  },
  circleOne: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.12)",
    top: -60,
    right: -40,
  },
  circleTwo: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.10)",
    top: 90,
    left: -30,
  },
  logoBadge: {
    width: 110,
    height: 110,
    borderRadius: 30,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.3,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 6,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    paddingTop: 30,
    marginTop: -24,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  titleWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  titleIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  titleAccent: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#159df8",
    marginTop: 10,
  },
  cardSubtitle: {
    fontSize: 14.5,
    color: "#64748b",
    fontWeight: "500",
    marginTop: 10,
    textAlign: "center",
  },
  generalError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  generalErrorText: {
    color: "#e11d48",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    height: 56,
  },
  inputWrapperFocused: {
    borderColor: "#159df8",
    backgroundColor: "#fff",
  },
  inputWrapperError: {
    borderColor: "#f43f5e",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0f172a",
    height: "100%",
  },
  eyeButton: {
    paddingLeft: 8,
  },
  fieldError: {
    color: "#e11d48",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  button: {
    marginTop: 28,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#159df8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  buttonGradient: {
    height: 56,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  footer: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 24,
  },
});
