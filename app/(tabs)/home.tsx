import { View, Text, ScrollView, useColorScheme, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import LinearGradient from "react-native-linear-gradient";
import HomePageIcons from "@/components/ui/homepageIcons";
export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={[styles.container, isDark ? styles.bgLight : styles.bgLight]}>
        {/* Top Card */}
        
          <View
            style={[
              styles.card,
              styles.topCard,
              {
                backgroundColor: "#159df8",
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
            Hello, John
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
            <Text style={{ color: "#fff" }}>Start Date: January 20, 2027</Text>
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
          <View style={[styles.bottomCard, styles.paidCard]}>
            <Text style={styles.cardTitle}>Total Paid</Text>
            <Text style={styles.cardValue}>300</Text>
          </View>
          <View style={[styles.bottomCard, styles.dueCard]}>
            <Text style={styles.cardTitle}>Remaining Due</Text>
            <Text style={styles.cardValue}>400</Text>
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
    backgroundColor: "#f5f5f5",
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
    backgroundColor: "#fff",
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
    color: "#000",
  },
  textDark: {
    color: "#000",
  },
  bottomCardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
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

 bottomCard: {
    width: 180,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    marginVertical: 8,
  },

  paidCard: {
    backgroundColor: "#67d67f",
  },
  dueCard: {
    backgroundColor: "#f33a68",
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E8F5E9",
    marginBottom: 6,
    letterSpacing: 0.5,
  },

  cardValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },


});
