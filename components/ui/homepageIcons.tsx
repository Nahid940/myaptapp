import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

type IconItem = {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  bg: string;
  count?: number;
  route: string;
};

export default function HomePageIcons() {
  const items: IconItem[] = [
    { title: "Payments", icon: "wallet", color: "#2563eb", bg: "#dbeafe", route: "/payments" },
    { title: "My Invoices", icon: "document-text", color: "#4f46e5", bg: "#e0e7ff", route: "/invoices" },
    { title: "My Ledger", icon: "book", color: "#b45309", bg: "#fef3c7", route: "/ledger" },
    { title: "Tickets", icon: "ticket", color: "#dc2626", bg: "#fee2e2", count: 0, route: "/ticketsList" },
    { title: "Guests", icon: "people", color: "#ea580c", bg: "#ffedd5", route: "/guests" },
    { title: "Notices", icon: "list", color: "#16a34a", bg: "#dcfce7", count: 0, route: "/notices" },
    { title: "Maintenance", icon: "hammer", color: "#0d9488", bg: "#ccfbf1", route: "/maintenance" },
    { title: "Utilities", icon: "flash", color: "#0ea5e9", bg: "#e0f2fe", route: "/utilities" },
    { title: "Message", icon: "chatbubble", color: "#7c3aed", bg: "#ede9fe", count: 0, route: "/messages" },
    { title: "Help", icon: "help-buoy", color: "#0891b2", bg: "#cffafe", count: 0, route: "/help" },
    { title: "Alert", icon: "warning", color: "#d97706", bg: "#fef3c7", count: 0, route: "/alerts" },
    { title: "Profile", icon: "person", color: "#475569", bg: "#e2e8f0", route: "/account" },
  ];

  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={styles.grid}>
      {items.map((item, index) => (
        <Pressable
          key={index}
          onPress={() => router.push(item.route as any)}
          style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
        >
          <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
            <Ionicons name={item.icon} size={26} color="#fff" />
            {(item.count ?? 0) > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.count}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  item: {
    width: "25%",
    alignItems: "center",
    marginVertical: 10,
  },
  itemPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.96 }],
  },
  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});
