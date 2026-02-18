import { View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function HomePageIcons() {
  const items1 = [
    { title: "My Payments", icon: "wallet", color: "#4facfe", route:"/payments" },
    { title: "Tickets", icon: "ticket", color: "#f02005", count: 0, route:"/ticketsList" },
    { title: "Guests Book", icon: "person", color: "#fc640d", route:"/guests"  },
    { title: "Notices", icon: "list", color: "#43e97b",count: 0, route:"/notices"  },
  ];
  const items = [
    { title: "Message", icon: "chatbubble", color: "#6e36f1", count: 0, route:"/messages"  },
    { title: "Help Center", icon: "alert-circle", color: "#366bfc", count: 0, route:"/help"  },
    { title: "Alert", icon: "warning-outline", color: "#f3d007", count: 0, route:"/alerts"  },
  ];


  const router = useRouter();
  return (
    <>
      <View style={styles.row}>
        {items1.map((item, index) => (
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
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "flex-start", 
    marginVertical: 10,
    paddingHorizontal: 0,
  },
  item: {
    alignItems: "center",
    marginRight: 15,

  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
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
