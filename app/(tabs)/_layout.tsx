import { Ionicons } from "@expo/vector-icons";
import { Tabs, Redirect } from "expo-router";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

type Meta = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  activeIcon: React.ComponentProps<typeof Ionicons>["name"];
};

const TAB_META: Record<string, Meta> = {
  index: { label: "Home", icon: "home-outline", activeIcon: "home" },
  tickets: { label: "Ticket", icon: "ticket-outline", activeIcon: "ticket" },
  guestRegister: { label: "Guest", icon: "person-add-outline", activeIcon: "person-add" },
  account: { label: "Profile", icon: "person-outline", activeIcon: "person" },
};

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom ? insets.bottom : 12 }]}>
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
              <View style={[styles.item, focused && styles.itemActive]}>
                <Ionicons
                  name={focused ? meta.activeIcon : meta.icon}
                  size={23}
                  color={focused ? "#159df8" : "#94a3b8"}
                />
                <Text style={[styles.label, focused && styles.labelActive]}>
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
