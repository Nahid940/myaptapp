import { View, Text, useColorScheme } from "react-native";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#fff" : "#000";
  const bgColor = colorScheme === "dark" ? "#000" : "#fff";

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: bgColor,
      }}
    >
      <Text style={{ color: textColor, fontSize: 20 }}>Welcome to Home</Text>
    </View>
  );
}
