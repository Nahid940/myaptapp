import { Ionicons } from "@expo/vector-icons"; // icons package
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
        headerShown: false,
        headerTitleAlign: "center",
      }}>
      <Tabs.Screen name="index" options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={"#0ba2dd"}  />,
        }} />

      <Tabs.Screen name="tickets" options={{
          title: "New Ticket",
          tabBarLabel: "New Ticket",
          tabBarIcon: ({ color, size }) => <Ionicons name="ticket" size={size}  color={"#0ba2dd"}   />,
        }} />
      <Tabs.Screen name="guestRegister" options={{
          title: "Guest Register",
          tabBarLabel: "Guest Register",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-add" size={size} color={"#0ba2dd"}  />,
        }} />

      <Tabs.Screen name="account" options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={"#0ba2dd"} />,
        }} />
    </Tabs>
  );
}
