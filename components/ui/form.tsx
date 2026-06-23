import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  TextInputProps,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

/* ---------------- Field ---------------- */
type FieldProps = TextInputProps & {
  label?: string;
  icon?: IconName;
  error?: string;
  required?: boolean;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
};

export function Field({
  label,
  icon,
  error,
  required,
  isPassword,
  containerStyle,
  multiline,
  ...inputProps
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const { colors } = useTheme();

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
          {required ? <Text style={styles.req}> *</Text> : null}
        </Text>
      ) : null}

      <View
        style={[
          styles.wrapper,
          { backgroundColor: colors.inputBg, borderColor: colors.border },
          multiline && styles.wrapperMultiline,
          focused && { borderColor: colors.primary },
          !!error && { borderColor: "#f43f5e" },
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={20}
            color={focused ? colors.primary : colors.muted}
            style={[styles.icon, multiline && { marginTop: 14 }]}
          />
        ) : null}

        <TextInput
          {...inputProps}
          multiline={multiline}
          placeholderTextColor={colors.muted}
          secureTextEntry={isPassword && !show}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          style={[styles.input, { color: colors.text }, multiline && styles.inputMultiline]}
        />

        {isPassword ? (
          <Pressable hitSlop={10} onPress={() => setShow((s) => !s)} style={styles.eye}>
            <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

/* ---------------- Primary button ---------------- */
type ButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  icon?: IconName;
  colors?: [string, string];
  style?: ViewStyle;
};

export function PrimaryButton({
  label,
  onPress,
  loading,
  icon,
  colors = ["#159df8", "#0b7dd0"],
  style,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, style]}
    >
      <LinearGradient
        colors={loading ? ["#9ccdf3", "#9ccdf3"] : colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.buttonGradient}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.buttonText}>{label}</Text>
            {icon ? <Ionicons name={icon} size={20} color="#fff" /> : null}
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

/* ---------------- Screen header ---------------- */
export function FormHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon: IconName;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.header}>
      <View style={styles.headerIcon}>
        <Ionicons name={icon} size={26} color="#159df8" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 7,
    marginLeft: 2,
  },
  req: {
    color: "#ef4444",
  },
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    minHeight: 54,
  },
  wrapperMultiline: {
    alignItems: "flex-start",
  },
  wrapperFocused: {
    borderColor: "#159df8",
    backgroundColor: "#fff",
  },
  wrapperError: {
    borderColor: "#f43f5e",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15.5,
    color: "#0f172a",
    paddingVertical: 12,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  eye: {
    paddingLeft: 8,
  },
  error: {
    color: "#e11d48",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },

  /* Button */
  button: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#159df8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  buttonGradient: {
    height: 54,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 22,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 13.5,
    color: "#64748b",
    marginTop: 2,
  },
});
