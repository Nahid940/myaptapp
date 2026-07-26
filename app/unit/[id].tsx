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
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";

const CURRENCY = "KES";
const money = (v: any) =>
  v === undefined || v === null ? "—" : `${CURRENCY} ${Number(v).toLocaleString()}`;

const occupancyMeta = (d: any) => {
  if (d?.owner_occupied) return { label: "Owner Occupied", color: "#7c3aed", bg: "rgba(255,255,255,0.2)" };
  if (d?.occupied) return { label: "Rented", color: "#16a34a", bg: "rgba(255,255,255,0.2)" };
  return { label: "Vacant", color: "#d97706", bg: "rgba(255,255,255,0.2)" };
};

const statusStyle = (status?: string) => {
  switch ((status || "").toLowerCase()) {
    case "paid":
      return { color: "#16a34a", bg: "#dcfce7" };
    case "partial":
      return { color: "#d97706", bg: "#fef3c7" };
    case "pending":
    case "unpaid":
    case "due":
      return { color: "#dc2626", bg: "#fee2e2" };
    default:
      return { color: "#64748b", bg: "#f1f5f9" };
  }
};

export default function UnitDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchUnit = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/unit/${params.id}`);
      setData(res?.data ?? null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const apt = data?.apartment ?? {};
  const tenant = data?.tenant ?? null;
  const lease = data?.lease ?? null;
  const summary = data?.summary ?? {};
  const payments: any[] = data?.payments ?? [];
  const maintenance = data?.maintenance ?? {};
  const occ = occupancyMeta(data);

  const InfoRow = ({ label, value }: { label: string; value?: any }) =>
    value === undefined || value === null || value === "" ? null : (
      <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
        <Text style={[styles.infoLabel, { color: colors.muted }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{String(value)}</Text>
      </View>
    );

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      {/* Gradient header */}
      <LinearGradient
        colors={["#159df8", "#0b7dd0", "#0a64b8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerCircle} />
        <SafeAreaView edges={["top"]}>
          <View style={styles.navbar}>
            <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
            <Text style={styles.navTitle}>Unit Details</Text>
            <View style={{ width: 38 }} />
          </View>

          {!loading && (
            <View style={styles.headerContent}>
              <Text style={styles.aptCode}>{apt?.apartment_code ?? "—"}</Text>
              <Text style={styles.buildingName} numberOfLines={1}>
                {apt?.building?.name ?? ""}
              </Text>
              <View style={styles.occPill}>
                <View style={[styles.occDot, { backgroundColor: "#fff" }]} />
                <Text style={styles.occText}>{occ.label}</Text>
              </View>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#159df8" style={{ marginTop: 40 }} />
      ) : !data ? (
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={46} color="#cbd5e1" />
          <Text style={styles.emptyText}>Unit details unavailable</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Unit details */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Unit Details</Text>
            <InfoRow label="Unit Number" value={apt?.unit_number} />
            <InfoRow label="Floor" value={apt?.floor} />
            <InfoRow label="Size" value={apt?.size} />
            <InfoRow label="Furnished" value={apt?.furnished} />
            <InfoRow label="Property Type" value={apt?.property_type} />
            <InfoRow label="Rental Status" value={apt?.rental_status} />
            <InfoRow label="Washrooms" value={apt?.total_washroom} />
            <InfoRow label="Balcony" value={apt?.total_balcony} />
            <InfoRow label="Parking" value={apt?.parking} />
            <InfoRow label="Basic Rent" value={money(apt?.basic_rent)} />
            <InfoRow label="Service Charge" value={money(apt?.service_charge)} />
          </View>

          {/* Tenant */}
          {tenant ? (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Tenant</Text>
              <View style={styles.tenantHead}>
                {tenant?.photo_url ? (
                  <Image source={{ uri: tenant.photo_url }} style={styles.tenantPhoto} />
                ) : (
                  <View style={[styles.tenantPhoto, styles.tenantPhotoFallback]}>
                    <Ionicons name="person" size={26} color="#94a3b8" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tenantName, { color: colors.text }]} numberOfLines={1}>
                    {tenant?.name ?? "—"}
                  </Text>
                  {tenant?.nationality ? (
                    <Text style={styles.tenantSub}>{tenant.nationality}</Text>
                  ) : null}
                </View>
                {tenant?.phone ? (
                  <Pressable
                    onPress={() => Linking.openURL(`tel:${tenant.phone}`)}
                    style={styles.callBtn}
                  >
                    <Ionicons name="call" size={18} color="#fff" />
                  </Pressable>
                ) : null}
              </View>

              <InfoRow label="Phone" value={tenant?.phone} />
              <InfoRow label="Email" value={tenant?.email} />
              <InfoRow label="Nationality" value={tenant?.nationality} />
              <InfoRow label="ID Number" value={tenant?.id_number} />
              <InfoRow label="Emergency Contact" value={tenant?.emergency_contact} />
            </View>
          ) : null}

          {/* Lease */}
          {lease ? (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Lease Details</Text>
              <InfoRow label="Booking Code" value={lease?.booking_code} />
              <InfoRow label="Start Date" value={lease?.checkin_at} />
              <InfoRow label="End Date" value={lease?.end_date} />
              <InfoRow label="Rent" value={money(lease?.rent)} />
              <InfoRow label="Service Charge" value={money(lease?.service_charge)} />
              <InfoRow label="Deposit" value={money(lease?.deposit)} />
              {lease?.management_fee_percentage != null ? (
                <InfoRow label="Management Fee" value={`${lease.management_fee_percentage}%`} />
              ) : null}
            </View>
          ) : null}

          {/* Payments */}
          {payments.length > 0 ? (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Payments</Text>
              {payments.map((p: any, i: number) => {
                const ss = statusStyle(p.status);
                const due = Number(p.amount ?? 0) - Number(p.total_paid ?? 0);
                return (
                  <View
                    key={p.id ?? i}
                    style={[
                      styles.payRow,
                      { borderBottomColor: colors.border },
                      i === payments.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.payPeriod, { color: colors.text }]}>
                        {p.period ?? p.paid_date ?? `Payment #${p.id}`}
                      </Text>
                      <Text style={styles.payMeta}>
                        Paid {money(p.total_paid)} · Due {money(due)}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={[styles.payAmount, { color: colors.text }]}>
                        {money(p.amount)}
                      </Text>
                      <View style={[styles.badge, { backgroundColor: ss.bg }]}>
                        <Text style={[styles.badgeText, { color: ss.color }]}>
                          {String(p.status || "—").toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}

          {/* Maintenance summary */}
          {tenant ? (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Maintenance</Text>
              <View style={styles.mRow}>
                <View style={styles.mCol}>
                  <Text style={styles.mLabel}>Total Jobs</Text>
                  <Text style={[styles.mValue, { color: colors.text }]}>
                    {maintenance?.total_jobs ?? 0}
                  </Text>
                </View>
                <View style={styles.mVLine} />
                <View style={styles.mCol}>
                  <Text style={styles.mLabel}>Pending</Text>
                  <Text style={[styles.mValue, { color: "#d97706" }]}>
                    {maintenance?.pending_jobs ?? 0}
                  </Text>
                </View>
                <View style={styles.mVLine} />
                <View style={styles.mCol}>
                  <Text style={styles.mLabel}>Cost</Text>
                  <Text style={[styles.mValue, { color: colors.text }]}>
                    {money(maintenance?.total_cost)}
                  </Text>
                </View>
                <View style={styles.mVLine} />
                <View style={styles.mCol}>
                  <Text style={styles.mLabel}>Due</Text>
                  <Text style={[styles.mValue, { color: "#dc2626" }]}>
                    {money(maintenance?.total_due)}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* Vacant / owner-occupied note */}
          {!data?.occupied && !data?.owner_occupied ? (
            <View style={[styles.noticeCard, { backgroundColor: colors.card }]}>
              <Ionicons name="home-outline" size={20} color="#d97706" />
              <Text style={[styles.noticeText, { color: colors.muted }]}>
                This unit is currently vacant.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingBottom: 46,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  headerCircle: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.10)",
    top: -90,
    right: -40,
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { fontSize: 17, fontWeight: "800", color: "#fff" },
  headerContent: { alignItems: "center", marginTop: 6 },
  aptCode: { color: "#fff", fontSize: 30, fontWeight: "800" },
  buildingName: { color: "rgba(255,255,255,0.9)", fontSize: 14, marginTop: 2 },
  occPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  occDot: { width: 8, height: 8, borderRadius: 4 },
  occText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  scroll: { flex: 1, paddingHorizontal: 18, marginTop: -26 },
  card: {
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
    color: "#94a3b8",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    gap: 12,
  },
  infoLabel: { fontSize: 14, flex: 1 },
  infoValue: { fontSize: 14.5, fontWeight: "700", flex: 1, textAlign: "right" },

  tenantHead: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  tenantPhoto: { width: 54, height: 54, borderRadius: 16, backgroundColor: "#e2e8f0" },
  tenantPhotoFallback: { alignItems: "center", justifyContent: "center" },
  tenantName: { fontSize: 16.5, fontWeight: "800" },
  tenantSub: { fontSize: 12.5, color: "#94a3b8", fontWeight: "600", marginTop: 2 },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#159df8",
    alignItems: "center",
    justifyContent: "center",
  },

  payRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  payPeriod: { fontSize: 14.5, fontWeight: "800" },
  payMeta: { fontSize: 12, color: "#94a3b8", fontWeight: "600", marginTop: 3 },
  payAmount: { fontSize: 15.5, fontWeight: "800" },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20, marginTop: 4 },
  badgeText: { fontSize: 10, fontWeight: "800" },

  mRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  mCol: { flex: 1, alignItems: "center" },
  mVLine: { width: 1, height: 34, backgroundColor: "#e2e8f0" },
  mLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  mValue: { fontSize: 14, fontWeight: "800", marginTop: 4 },

  noticeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  noticeText: { fontSize: 13.5, fontWeight: "600" },

  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { color: "#94a3b8", fontSize: 15, fontWeight: "600" },
});
