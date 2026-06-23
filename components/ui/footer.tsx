import { View, Text, StyleSheet } from "react-native";

export default function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.text}>
            ACL - Developed By MNP Techs.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    bottom: 10,
  },
  text: {
    color: "#1b1a1a",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
});
