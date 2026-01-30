import { View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function HomePageIcons() {
  const items = [
    { title: "Tickets", icon: "ticket", color: "#4facfe", count: 3, route:"/ticketsList" },
    { title: "Notices", icon: "notifications", color: "#43e97b",count: 3, route:"/notices"  },
    { title: "Message", icon: "chatbubble", color: "#fa709a", count: 0, route:"/messages"  },
    { title: "Alert", icon: "alert-circle", color: "#f7971e", count: 2, route:"/alerts"  },
  ];
  const router = useRouter();
  return (
    <View style={styles.row}>
      {items.map((item, index) => (
        <TouchableOpacity key={index} style={styles.item}>
          <Pressable onPress={() => router.push(item.route)}>
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon} size={28} color="#fff" />
            </View>
          </Pressable>
            {item.count > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.count}</Text>
              </View>
            )}
          <Text style={styles.title}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  item: {
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ff3b30",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});
