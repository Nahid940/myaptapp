import { useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  Text,
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

    const newErrors: typeof errors = {};
    if (!username.trim()) newErrors.username = "Please enter your username!";
    if (!password) newErrors.password = "Please enter your password!";

    if (newErrors.username || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<{
        token?: string;
        message?: string;
        is_owner?: boolean;
        has_active_lease?: boolean;
      }>("/login", {
        username,
        password,
      });

      if (response?.token) {
        await login(response.token, {
          is_owner: response.is_owner,
          has_active_lease: response.has_active_lease,
        });
        router.replace("/(tabs)");
      } else {
        setErrors({ general: "Login Failed, Invalid credentials" });
      }
    } catch {
      setErrors({ general: "Login Failed, Invalid credentials" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.root, { backgroundColor: colors.bg }]}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          {/* Gradient hero */}
          <LinearGradient
            colors={["#159df8", "#0b7dd0", "#0a64b8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.circleOne} />
            <View style={styles.circleTwo} />

            <SafeAreaView edges={["top"]} style={styles.heroContent}>
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

          {/* Form */}
          <View style={styles.form}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Sign In</Text>
            <Text style={styles.formSubtitle}>Login to manage your residence</Text>

            {errors.general ? (
              <View style={styles.generalError}>
                <Ionicons name="alert-circle" size={18} color="#e11d48" />
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              </View>
            ) : null}

            {/* Username */}
            <Text style={[styles.label, { color: colors.text }]}>Username</Text>
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
                autoCorrect={false}
                returnKeyType="next"
                style={[styles.input, { color: colors.text }]}
              />
            </View>
            {errors.username ? <Text style={styles.fieldError}>{errors.username}</Text> : null}

            {/* Password */}
            <Text style={[styles.label, styles.labelSpaced, { color: colors.text }]}>Password</Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
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
                returnKeyType="go"
                onSubmitEditing={handleLogin}
                style={[styles.input, { color: colors.text }]}
              />
              <Pressable hitSlop={10} onPress={() => setShowPassword((s) => !s)} style={styles.eyeButton}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.muted}
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

            <View style={styles.secureNote}>
              <Ionicons name="shield-checkmark" size={14} color="#16a34a" />
              <Text style={styles.secureNoteText}>Your information is securely encrypted</Text>
            </View>

            <Text style={styles.footer}>ACL — Developed by MNP Techs.</Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },

  hero: {
    paddingBottom: 46,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: "hidden",
  },
  heroContent: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 14,
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
    width: 104,
    height: 104,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: { width: 76, height: 76 },
  heroTitle: { fontSize: 26, fontWeight: "800", color: "#fff", letterSpacing: 0.3 },
  heroSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.9)", marginTop: 6 },

  form: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  formTitle: { fontSize: 26, fontWeight: "800", letterSpacing: -0.3, textAlign: "center" },
  formSubtitle: { fontSize: 14.5, color: "#64748b", fontWeight: "500", marginTop: 4, marginBottom: 24, textAlign: "center" },

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
  generalErrorText: { color: "#e11d48", fontSize: 14, fontWeight: "600", flex: 1 },

  label: { fontSize: 13, fontWeight: "700", marginBottom: 8, marginLeft: 2, letterSpacing: 0.2 },
  labelSpaced: { marginTop: 18 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 56,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, height: "100%" },
  eyeButton: { paddingLeft: 8 },
  fieldError: { color: "#e11d48", fontSize: 13, marginTop: 6, marginLeft: 4 },

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
  buttonPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  buttonGradient: {
    height: 56,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "700" },

  secureNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 18,
  },
  secureNoteText: { color: "#94a3b8", fontSize: 12, fontWeight: "600" },

  footer: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 16,
  },
});
