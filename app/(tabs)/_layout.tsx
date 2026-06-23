import { Ionicons } from "@expo/vector-icons";
import { Tabs, Redirect } from "expo-router";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

type Meta = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  activeIcon: React.ComponentProps<typeof Ionicons>["name"];
};

const TAB_META: Record<string, Meta> = {
  index: { label: "Home", icon: "home-outline", activeIcon: "home" },
  invoices: { label: "Invoice", icon: "document-text-outline", activeIcon: "document-text" },
  payments: { label: "Payments", icon: "wallet-outline", activeIcon: "wallet" },
  more: { label: "More", icon: "grid-outline", activeIcon: "grid" },
};

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: colors.card, paddingBottom: insets.bottom ? insets.bottom : 12 },
      ]}
    >
      <View style={styles.barInner}>
        {state.routes.map((route: any, index: number) => {
          const meta = TAB_META[route.name];
          if (!meta) return null;

          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              android_ripple={{ color: "transparent" }}
            >
              <View
                style={[
                  styles.item,
                  focused && {
                    backgroundColor: isDark ? "rgba(58,169,240,0.18)" : "#e0f2fe",
                  },
                ]}
              >
                <Ionicons
                  name={focused ? meta.activeIcon : meta.icon}
                  size={23}
                  color={focused ? colors.primary : colors.muted}
                />
                <Text
                  style={[
                    styles.label,
                    { color: focused ? colors.primary : colors.muted, fontWeight: focused ? "700" : "600" },
                  ]}
                >
                  {meta.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { user, loading } = useAuth();

  // Wait for the stored session to be restored before deciding.
  if (loading) return null;

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="invoices" options={{ title: "Invoices" }} />
      <Tabs.Screen name="payments" options={{ title: "Payments" }} />
      <Tabs.Screen name="more" options={{ title: "More" }} />
      {/* Routable but no tab button (reached from menus / greeting) */}
      <Tabs.Screen name="tickets" options={{ title: "New Ticket" }} />
      <Tabs.Screen name="guestRegister" options={{ title: "Guest Register" }} />
      <Tabs.Screen name="account" options={{ title: "Profile" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 16,
  },
  barInner: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  tab: {
    flex: 1,
    alignItems: "center",
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    minWidth: 64,
  },
  itemActive: {
    backgroundColor: "#e0f2fe",
  },
  label: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#94a3b8",
  },
  labelActive: {
    color: "#159df8",
    fontWeight: "700",
  },
});
