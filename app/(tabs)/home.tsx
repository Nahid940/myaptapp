import { View, Text, ScrollView, useColorScheme, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import LinearGradient from "react-native-linear-gradient";
import HomePageIcons from "@/components/ui/homepageIcons";
export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
        {/* Top Card */}
        
          <View
            style={[
              styles.card,
              styles.topCard,
              {
                backgroundColor: isDark ? "#292b3e" : "#159df8",
                borderBottomLeftRadius: 30,
                borderBottomRightRadius: 30,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 10,
              },
            ]}
      >
        <View style={styles.topCardLeft}>
          <Text style={[styles.boldText, { color: "#fff", fontSize: 20 }]}>
            Hello John
          </Text>
          <View style={styles.line} />
          <Text style={[styles.boldText, { color: "#fff", fontSize: 20 }]}>
            Building: Tower A
          </Text>
          <Text style={{ color: "#fff" }}>Apartment Code: A-101</Text>
          <Text style={{ color: "#fff" }}>Booking ID: 12345</Text>
          <View style={styles.line} />
          <Text style={[styles.boldText, { color: "#fff" }]}>Monthly Rent: $500</Text>
          <Text style={{ color: "#fff",  }}>Service Charge: $50</Text>
        </View>
        <View style={styles.topCardRight}>
            <Text style={{ color: "#fff" }}>End Date: January 20, 2027</Text>
            <TouchableOpacity style={styles.paymentButtonCircle}>
              <Text style={styles.paymentButtonCircleText}>Payments</Text>
            </TouchableOpacity>
        </View>
      </View>
        <HomePageIcons/>
        {/* Bottom Cards */}
        <View style={styles.bottomCardsContainer}>
          {/* Row 1 */}
          <View style={[styles.bottomCard, isDark ? styles.cardDark : styles.cardLight]}>
            <Text style={[styles.boldText, isDark ? styles.textLight : styles.textDark]}>Total Paid</Text>
            <Text style={[styles.cardValue, isDark ? styles.textLight : styles.textDark]}>$300</Text>
          </View>
          <View style={[styles.bottomCard, isDark ? styles.cardDark : styles.cardLight]}>
            <Text style={[styles.boldText, isDark ? styles.textLight : styles.textDark]}>Due</Text>
            <Text style={[styles.cardValue, isDark ? styles.textLight : styles.textDark]}>$270</Text>
          </View>

          {/* Row 2 */}
          <View style={[styles.bottomCard, isDark ? styles.cardDark : styles.cardLight]}>
            <Text style={[styles.boldText, isDark ? styles.textLight : styles.textDark]}>Booking Date</Text>
            <Text style={[styles.cardValue, isDark ? styles.textLight : styles.textDark]}>01 Jan 2026</Text>
          </View>
          <View style={[styles.bottomCard, isDark ? styles.cardDark : styles.cardLight]}>
            <Text style={[styles.boldText, isDark ? styles.textLight : styles.textDark]}>End Date</Text>
            <Text style={[styles.cardValue, isDark ? styles.textLight : styles.textDark]}>31 Dec 2026</Text>
          </View>

          {/* Row 3 */}
          <View style={[styles.bottomCard, isDark ? styles.cardDark : styles.cardLight]}>
            <Text style={[styles.boldText, isDark ? styles.textLight : styles.textDark]}>Extra 1</Text>
            <Text style={[styles.cardValue, isDark ? styles.textLight : styles.textDark]}>Value 1</Text>
          </View>
          <View style={[styles.bottomCard, isDark ? styles.cardDark : styles.cardLight]}>
            <Text style={[styles.boldText, isDark ? styles.textLight : styles.textDark]}>Extra 2</Text>
            <Text style={[styles.cardValue, isDark ? styles.textLight : styles.textDark]}>Value 2</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  bgLight: {
    backgroundColor: "#f5f5f5",
  },
  bgDark: {
    backgroundColor: "#121212",
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardLight: {
    backgroundColor: "#fff",
  },
  cardDark: {
    backgroundColor: "#1e1e1e",
  },
  topCard: {
    // specific styles if needed
  },
  topCardLeft: {
    flex: 1,
  },
  topCardRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  boldText: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  textLight: {
    color: "#fff",
  },
  textDark: {
    color: "#000",
  },
  bottomCardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  bottomCard: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardValue: {
    marginTop: 8,
    fontSize: 16,
  },
  line: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.4)", // semi-transparent white
    marginVertical: 4,
  },
  space: {
    marginTop: 29,
  },
  paymentButtonCircle: {
  width: 100,                 // circle width
  height: 100,                // circle height
  borderRadius: 50,          // half of width/height makes it a circle
  backgroundColor: "#e61553",// bright yellow
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5,
  marginTop:12
},
paymentButtonCircleText: {
  fontSize: 22,
  color: "#f0f1eb",
  fontWeight:900
},
});
