import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HomePageIcons() {
  const items = [
    { title: "Tickets", icon: "ticket", color: "#4facfe", count: 3 },
    { title: "Notices", icon: "notifications", color: "#43e97b",count: 3 },
    { title: "Message", icon: "chatbubble", color: "#fa709a", count: 0 },
    { title: "Alert", icon: "alert-circle", color: "#f7971e", count: 2 },
  ];

  return (
    <View style={styles.row}>
      {items.map((item, index) => (
        <TouchableOpacity key={index} style={styles.item}>
          <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
            <Ionicons name={item.icon} size={28} color="#fff" />
          </View>
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
