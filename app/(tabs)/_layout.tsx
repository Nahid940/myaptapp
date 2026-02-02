import { Ionicons } from "@expo/vector-icons"; // icons package
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
        headerShown: false,
        headerTitleAlign: "center",
      }}>
      <Tabs.Screen name="home" options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={"#40dbf7"} />,
        }} />

      <Tabs.Screen name="tickets" options={{
          title: "New Ticket",
          tabBarLabel: "New Ticket",
          tabBarIcon: ({ color, size }) => <Ionicons name="ticket" size={size}  color={"#ff0055"}  />,
        }} />
      <Tabs.Screen name="guestRegister" options={{
          title: "Guest Register",
          tabBarLabel: "Guest Register",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-add" size={size} color={"#ff8800"} />,
        }} />

      <Tabs.Screen name="account" options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={"#0bdd0b"} />,
        }} />

      <Tabs.Screen name="help" options={{
          title: "Help Center",
          tabBarLabel: "Help Center",
          tabBarIcon: ({ color, size }) => <Ionicons name="alert-circle" size={size} color={"#f31f31"} />,
        }} />
    </Tabs>
  );
}
