import { ActivityIndicator, ScrollView, StyleSheet, Text, useColorScheme, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import LinearGradient from "react-native-linear-gradient";
import HomePageIcons from "@/components/ui/homepageIcons";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";

import { useEffect, useState } from 'react';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/home`);
      setData(response.data);
      // console.log(response.data)
    } catch (err) {
      // console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);


  if (!data) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={[styles.container, isDark ? styles.bgLight : styles.bgLight]}>
        {/* Top Card */}

        <View style={styles.row}>
          <Image
            source={require("../../assets/images/company_banner.png")}
            style={styles.banner}
          />
        </View>
        
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
            Hello, {data.tenant.first_name} {data.tenant.last_name}
          </Text>
          <View style={styles.line} />
          <Text style={[styles.boldText, { color: "#fff", fontSize: 20 }]}>
            Building: {data.booking.building.building_name}
          </Text>
          <Text style={{ color: "#fff" }}>Apartment Code: {data.booking.apartment.apartment_code}</Text>
          <Text style={{ color: "#fff" }}>Lease #: {data.booking.booking_code}</Text>
          <View style={styles.line} />
          <Text style={[styles.boldText, { color: "#fff" }]}>Monthly Rent: {data.booking.rent}</Text>
          <Text style={{ color: "#fff",  }}>Service Charge: {data.booking.service_charge}</Text>
        </View>
        <View style={styles.topCardRight}>
            <Text style={{ color: "#fff" }}>Start Date: {data.booking.checkin_at}</Text>
            <Text style={{ color: "#fff" }}>End Date: {data.booking.end_date}</Text>
        </View>
      </View>
      
      <HomePageIcons/>

        <View style={styles.summaryCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Total Paid</Text>
            <Text style={styles.paidValue}>{data.total_paid}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Due</Text>
            <Text style={styles.dueValue}>{data.due}</Text>
          </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Image
              source={require("../../assets/images/banner1.jpg")}
              style={styles.banner}
            />
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
    width: 380,
    borderRadius: 16,
    paddingVertical: 5,
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
    backgroundColor: "#159df8",
  },
  dueCard: {
    backgroundColor: "#159df8",
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

summaryCard: {
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 16,
  marginTop: 16,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 4,
},

row: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

label: {
  fontSize: 15,
  color: "#666",
  fontWeight: "600",
},

paidValue: {
  fontSize: 18,
  fontWeight: "700",
  color: "#28a745",
},

dueValue: {
  fontSize: 18,
  fontWeight: "700",
  color: "#e74c3c",
},

divider: {
  height: 1,
  backgroundColor: "#eee",
  marginVertical: 12,
},
banner: {
    width: "100%",
    height: 50,
    borderRadius: 5,
    marginBottom: 16,
  },


});
