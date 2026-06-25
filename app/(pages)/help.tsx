import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";
import { useTheme } from "@/context/ThemeContext";

type Contact = {
  id: number;
  title: string;
  contact_number: string;
};

type Building = {
  id: number;
  name: string;
  address: string;
};

const ICONS: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  manager: "person",
  security: "shield-checkmark",
  "security desk": "shield-checkmark",
  caretaker: "construct",
  "care taker": "construct",
  fire: "flame",
  "fire service": "flame",
  electric: "flash",
  electricity: "flash",
  accounts: "calculator",
  it: "laptop",
  reception: "call",
};

const iconFor = (title: string): React.ComponentProps<typeof Ionicons>["name"] => {
  const key = (title || "").toLowerCase().trim();
  return ICONS[key] ?? "call";
};

export default function HelpPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState<Building | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/building/contacts");
      setBuilding(res?.building ?? null);
      setContacts(Array.isArray(res?.contacts) ? res.contacts : []);
    } catch {
      setBuilding(null);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const call = (number?: string) => {
    if (number) Linking.openURL(`tel:${number}`);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["top"]}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Pressable
          hitSlop={10}
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.card }]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.text }]}>Help & Contacts</Text>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Building card */}
          {building && (
            <View style={[styles.buildingCard, { backgroundColor: colors.primary }]}>
              <View style={styles.buildingIcon}>
                <Ionicons name="business" size={24} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.buildingName} numberOfLines={1}>
                  {building.name}
                </Text>
                {building.address ? (
                  <Text style={styles.buildingAddress} numberOfLines={1}>
                    {building.address}
                  </Text>
                ) : null}
              </View>
            </View>
          )}

          <Text style={[styles.sectionLabel, { color: colors.muted }]}>
            Emergency & Support Contacts
          </Text>

          {contacts.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="call-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No contacts available</Text>
            </View>
          ) : (
            contacts.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => call(c.contact_number)}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: colors.card },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={[styles.avatar, { backgroundColor: colors.cardAlt }]}>
                  <Ionicons name={iconFor(c.title)} size={20} color={colors.primary} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                    {c.title}
                  </Text>
                  <Text style={[styles.phone, { color: colors.muted }]}>
                    {c.contact_number}
                  </Text>
                </View>

                <View style={[styles.callBtn, { backgroundColor: colors.primary }]}>
                  <Ionicons name="call" size={18} color="#fff" />
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { fontSize: 17, fontWeight: "800" },

  buildingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    padding: 16,
    marginTop: 6,
    marginBottom: 8,
    shadowColor: "#159df8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  buildingIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  buildingName: { color: "#fff", fontSize: 17, fontWeight: "800" },
  buildingAddress: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 2 },

  sectionLabel: {
    fontSize: 12.5,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 12,
    marginLeft: 4,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 15.5, fontWeight: "700" },
  phone: { fontSize: 13.5, marginTop: 2, letterSpacing: 0.3 },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { color: "#94a3b8", fontSize: 15, fontWeight: "600" },
});
