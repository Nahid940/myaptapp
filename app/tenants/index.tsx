import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";
import { useTheme } from "@/context/ThemeContext";

const CURRENCY = "KES";
const money = (v: any) =>
  v === undefined || v === null ? "—" : `${CURRENCY} ${Number(v).toLocaleString()}`;

const initialsOf = (name?: string) =>
  (name ?? "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function TenantsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/owner/tenants`);
      const d = res?.data ?? {};
      setSummary(d?.summary ?? null);
      setTenants(Array.isArray(d?.tenants) ? d.tenants : []);
    } catch {
      setSummary(null);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const DetailRow = ({
    label,
    value,
    onPress,
  }: {
    label: string;
    value?: string | null;
    onPress?: () => void;
  }) => (
    <View style={[styles.detailRow, { borderTopColor: colors.border }]}>
      <Text style={[styles.detailLabel, { color: colors.muted }]}>{label}</Text>
      <Text
        style={[styles.detailValue, { color: value && onPress ? "#159df8" : colors.text }]}
        numberOfLines={1}
        onPress={value && onPress ? onPress : undefined}
      >
        {value || "—"}
      </Text>
    </View>
  );

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
        <Text style={[styles.navTitle, { color: colors.text }]}>Tenants</Text>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#159df8" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary hero */}
          <LinearGradient
            colors={["#7c3aed", "#6d28d9", "#5b21b6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroCircle} />
            <View style={styles.heroTop}>
              <View style={styles.heroIcon}>
                <Ionicons name="people" size={24} color="#fff" />
              </View>
              <View style={styles.countPill}>
                <Text style={styles.countText}>{summary?.total_tenants ?? 0} tenants</Text>
              </View>
            </View>
            <Text style={styles.heroLabel}>Total Due</Text>
            <Text style={styles.heroAmount}>{money(summary?.total_due)}</Text>
            <View style={styles.heroRow}>
              <View>
                <Text style={styles.heroSmall}>Collected</Text>
                <Text style={styles.heroValue}>{money(summary?.total_paid)}</Text>
              </View>
              <View style={styles.heroVLine} />
              <View>
                <Text style={styles.heroSmall}>Tenants</Text>
                <Text style={styles.heroValue}>{summary?.total_tenants ?? 0}</Text>
              </View>
            </View>
          </LinearGradient>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Tenants</Text>

          {tenants.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No tenants found</Text>
            </View>
          ) : (
            tenants.map((t: any, i: number) => (
              <View key={t.booking_id ?? i} style={[styles.card, { backgroundColor: colors.card }]}>
                {/* Header */}
                <View style={styles.cardTop}>
                  {t.photo_url ? (
                    <Image source={{ uri: t.photo_url }} style={styles.avatarImg} />
                  ) : (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{initialsOf(t.name) || "👤"}</Text>
                    </View>
                  )}

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                      {t.name ?? "—"}
                    </Text>
                    <View style={styles.aptRow}>
                      <Ionicons name="home" size={12} color="#159df8" />
                      <Text style={styles.aptText}>{t.apartment_code ?? "—"}</Text>
                      {t.gender ? <Text style={styles.genderText}>· {t.gender}</Text> : null}
                    </View>
                  </View>

                  {t.phone ? (
                    <Pressable
                      onPress={() => Linking.openURL(`tel:${t.phone}`)}
                      style={styles.callBtn}
                    >
                      <Ionicons name="call" size={18} color="#fff" />
                    </Pressable>
                  ) : null}
                </View>

                {/* Labeled details */}
                <View style={styles.details}>
                  <DetailRow
                    label="Phone"
                    value={t.phone}
                    onPress={t.phone ? () => Linking.openURL(`tel:${t.phone}`) : undefined}
                  />
                  <DetailRow label="Gender" value={t.gender} />
                  <DetailRow
                    label="Email"
                    value={t.email}
                    onPress={t.email ? () => Linking.openURL(`mailto:${t.email}`) : undefined}
                  />
                  <DetailRow label="Lease Start Date" value={t.lease_start} />
                  <DetailRow label="Lease End Date" value={t.lease_end} />
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Financials */}
                <View style={styles.financeRow}>
                  <View style={styles.financeCol}>
                    <Text style={styles.financeLabel}>Paid</Text>
                    <Text style={[styles.financeValue, { color: "#16a34a" }]}>
                      {money(t.total_paid)}
                    </Text>
                  </View>
                  <View style={styles.financeVLine} />
                  <View style={styles.financeCol}>
                    <Text style={styles.financeLabel}>Due</Text>
                    <Text style={[styles.financeValue, { color: "#dc2626" }]}>{money(t.due)}</Text>
                  </View>
                </View>
              </View>
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

  hero: { marginTop: 6, padding: 20, borderRadius: 22, overflow: "hidden" },
  heroCircle: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.12)",
    top: -60,
    right: -30,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  countPill: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  heroLabel: { color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: "600" },
  heroAmount: { color: "#fff", fontSize: 32, fontWeight: "800", marginTop: 4 },
  heroRow: { flexDirection: "row", alignItems: "center", marginTop: 18 },
  heroVLine: {
    width: 1,
    height: 34,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginHorizontal: 24,
  },
  heroSmall: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "600" },
  heroValue: { color: "#fff", fontSize: 18, fontWeight: "800", marginTop: 2 },

  sectionTitle: { fontSize: 16, fontWeight: "800", marginTop: 24, marginBottom: 14 },

  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#7c3aed",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: { width: 50, height: 50, borderRadius: 16, backgroundColor: "#e2e8f0" },
  avatarText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  name: { fontSize: 16.5, fontWeight: "800" },
  aptRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  aptText: { color: "#159df8", fontSize: 13, fontWeight: "800" },
  genderText: { color: "#94a3b8", fontSize: 12.5, fontWeight: "600" },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#159df8",
    alignItems: "center",
    justifyContent: "center",
  },

  details: { marginTop: 12 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  detailLabel: { fontSize: 13.5, fontWeight: "600" },
  detailValue: { flex: 1, fontSize: 13.5, fontWeight: "700", textAlign: "right" },

  divider: { height: 1, marginVertical: 14 },

  financeRow: { flexDirection: "row", alignItems: "center" },
  financeCol: { flex: 1, alignItems: "center" },
  financeVLine: { width: 1, height: 34, backgroundColor: "#e2e8f0" },
  financeLabel: {
    fontSize: 11.5,
    color: "#94a3b8",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  financeValue: { fontSize: 16, fontWeight: "800", marginTop: 4 },

  empty: { alignItems: "center", paddingVertical: 50, gap: 12 },
  emptyText: { color: "#94a3b8", fontSize: 15, fontWeight: "600" },
});
