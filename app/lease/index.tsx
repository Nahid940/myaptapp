import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
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

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const CHARGE_META: { key: string; label: string; icon: IconName; color: string; bg: string }[] = [
  { key: "rent", label: "Rent", icon: "home", color: "#2563eb", bg: "#dbeafe" },
  { key: "service_charge", label: "Service Charge", icon: "construct", color: "#0d9488", bg: "#ccfbf1" },
  { key: "deposit", label: "Deposit", icon: "lock-closed", color: "#7c3aed", bg: "#ede9fe" },
  { key: "discount", label: "Discount", icon: "pricetag", color: "#16a34a", bg: "#dcfce7" },
  { key: "gas_bill", label: "Gas", icon: "flame", color: "#ea580c", bg: "#ffedd5" },
  { key: "water_bill", label: "Water", icon: "water", color: "#0ea5e9", bg: "#e0f2fe" },
  { key: "garbage_bill", label: "Garbage", icon: "trash", color: "#65a30d", bg: "#ecfccb" },
  { key: "society_bill", label: "Society", icon: "people", color: "#db2777", bg: "#fce7f3" },
  { key: "internet_bill", label: "Internet", icon: "wifi", color: "#4f46e5", bg: "#e0e7ff" },
  { key: "dish_bill", label: "Dish TV", icon: "tv", color: "#d97706", bg: "#fef3c7" },
];

const MILESTONES: { key: string; label: string }[] = [
  { key: "agreement_signed", label: "Agreement Signed" },
  { key: "screening_done", label: "Screening Done" },
  { key: "moved_in", label: "Moved In" },
  { key: "moved_out", label: "Moved Out" },
];

export default function LeaseDetails() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lease, setLease] = useState<any>(null);

  const fetchLease = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/lease`);
      setLease(res?.lease ?? res?.data?.lease ?? res?.data ?? res);
    } catch (err) {
      setLease(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLease();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderWrap}>
        <ActivityIndicator size="large" color="#159df8" />
      </SafeAreaView>
    );
  }

  if (!lease) {
    return (
      <SafeAreaView style={styles.loaderWrap}>
        <Ionicons name="document-outline" size={48} color="#cbd5e1" />
        <Text style={styles.emptyText}>Lease details not available</Text>
        <Pressable onPress={fetchLease} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const currency = lease.currency ?? "";
  const money = (v: any) =>
    v === undefined || v === null ? "—" : `${currency ? currency + " " : ""}${Number(v).toLocaleString()}`;

  const tenant = lease.tenant ?? {};
  const unit = lease.unit ?? {};
  const term = lease.term ?? {};
  const occ = lease.occupants ?? {};
  const charges = lease.charges ?? {};
  const milestones = lease.milestones ?? {};

  const initials = (tenant.name ?? "")
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const chargeRows = CHARGE_META.map((c) => ({ ...c, value: charges?.[c.key] ?? 0 })).filter(
    (c) => Number(c.value) > 0
  );

  // lease progress (guarded date parsing)
  const sd = term.start_date ? new Date(term.start_date) : null;
  const ed = term.end_date ? new Date(term.end_date) : null;
  let progress: number | null = null;
  if (sd && ed && !isNaN(sd.getTime()) && !isNaN(ed.getTime()) && ed > sd) {
    progress = Math.min(1, Math.max(0, (Date.now() - sd.getTime()) / (ed.getTime() - sd.getTime())));
  }

  const occItems = [
    { label: "Adult Male", value: occ.adult_male ?? 0, icon: "man" as IconName, color: "#2563eb" },
    { label: "Adult Female", value: occ.adult_female ?? 0, icon: "woman" as IconName, color: "#db2777" },
    { label: "Kids Male", value: occ.kids_male ?? 0, icon: "happy" as IconName, color: "#0891b2" },
    { label: "Kids Female", value: occ.kids_female ?? 0, icon: "happy-outline" as IconName, color: "#d97706" },
  ];

  return (
    <View style={styles.root}>
      {/* Gradient header */}
      <LinearGradient colors={["#159df8", "#0b7dd0", "#0a64b8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerCircle} />
        <SafeAreaView edges={["top"]}>
          <View style={styles.navbar}>
            <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
            <Text style={styles.navTitle}>Lease Details</Text>
            <View style={{ width: 38 }} />
          </View>

          <View style={styles.headerBody}>
            {tenant.photo_url ? (
              <Image source={{ uri: tenant.photo_url }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials || "👤"}</Text>
              </View>
            )}
            <Text style={styles.tenantName}>{tenant.name}</Text>
            <Text style={styles.property}>{unit.property}</Text>

            <View style={styles.headerBadges}>
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{String(lease.status || "—").toUpperCase()}</Text>
              </View>
              {unit.apartment_code ? (
                <View style={styles.unitPill}>
                  <Ionicons name="home" size={13} color="#fff" />
                  <Text style={styles.statusText}>{unit.apartment_code}</Text>
                </View>
              ) : null}
              {lease.is_expired ? (
                <View style={[styles.unitPill, { backgroundColor: "rgba(239,68,68,0.85)" }]}>
                  <Ionicons name="alert-circle" size={13} color="#fff" />
                  <Text style={styles.statusText}>EXPIRED</Text>
                </View>
              ) : null}
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Monthly payable */}
        <View style={styles.payableCard}>
          <View style={styles.payableIcon}>
            <Ionicons name="cash" size={22} color="#16a34a" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.payableLabel}>Monthly Payable</Text>
            <Text style={styles.payableValue}>{money(lease.monthly_payable)}</Text>
          </View>
        </View>

        {/* Lease term */}
        <Text style={styles.sectionTitle}>Lease Term</Text>
        <View style={styles.card}>
          <View style={styles.termRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.termLabel}>Start Date</Text>
              <Text style={styles.termValue}>{term.start_date ?? "—"}</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color="#cbd5e1" />
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={styles.termLabel}>End Date</Text>
              <Text style={styles.termValue}>{term.end_date ?? "—"}</Text>
            </View>
          </View>

          {progress !== null && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
          )}

          <View style={styles.termFooter}>
            <View style={styles.termChip}>
              <Ionicons
                name={lease.is_expired ? "time" : "hourglass-outline"}
                size={14}
                color={lease.is_expired ? "#dc2626" : "#159df8"}
              />
              <Text style={[styles.termChipText, lease.is_expired && { color: "#dc2626" }]}>
                {lease.is_expired ? "Lease expired" : `${term.days_remaining ?? 0} days remaining`}
              </Text>
            </View>
            {term.notice_period ? (
              <Text style={styles.noticeText}>Notice: {term.notice_period}</Text>
            ) : null}
          </View>
        </View>

        {/* Charges */}
        {chargeRows.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Charges Breakdown</Text>
            <View style={styles.card}>
              {chargeRows.map((c, i) => (
                <View
                  key={c.key}
                  style={[styles.chargeRow, i === chargeRows.length - 1 && { borderBottomWidth: 0 }]}
                >
                  <View style={[styles.chargeIcon, { backgroundColor: c.bg }]}>
                    <Ionicons name={c.icon} size={17} color={c.color} />
                  </View>
                  <Text style={styles.chargeLabel}>{c.label}</Text>
                  <Text style={styles.chargeValue}>{money(c.value)}</Text>
                </View>
              ))}
              <View style={styles.totalDivider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Monthly Payable</Text>
                <Text style={styles.totalValue}>{money(lease.monthly_payable)}</Text>
              </View>
            </View>
          </>
        )}

        {/* Occupants */}
        <Text style={styles.sectionTitle}>Occupants ({occ.total ?? 0})</Text>
        <View style={styles.occGrid}>
          {occItems.map((o) => (
            <View key={o.label} style={styles.occCard}>
              <Ionicons name={o.icon} size={22} color={o.color} />
              <Text style={styles.occValue}>{o.value}</Text>
              <Text style={styles.occLabel}>{o.label}</Text>
            </View>
          ))}
        </View>

        {/* Milestones */}
        <Text style={styles.sectionTitle}>Milestones</Text>
        <View style={styles.card}>
          {MILESTONES.map((m, i) => {
            const done = !!milestones[m.key];
            return (
              <View
                key={m.key}
                style={[styles.mileRow, i === MILESTONES.length - 1 && { borderBottomWidth: 0 }]}
              >
                <Ionicons
                  name={done ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                  color={done ? "#16a34a" : "#cbd5e1"}
                />
                <Text style={[styles.mileLabel, !done && { color: "#94a3b8" }]}>{m.label}</Text>
                {done && <Text style={styles.mileDone}>Done</Text>}
              </View>
            );
          })}
        </View>

        {/* Contact */}
        <Text style={styles.sectionTitle}>Tenant Contact</Text>
        <View style={styles.card}>
          {tenant.phone ? (
            <View style={styles.contactRow}>
              <View style={[styles.chargeIcon, { backgroundColor: "#dcfce7" }]}>
                <Ionicons name="call" size={16} color="#16a34a" />
              </View>
              <Text style={styles.contactText}>{tenant.phone}</Text>
            </View>
          ) : null}
          {tenant.email ? (
            <View style={[styles.contactRow, { borderBottomWidth: 0 }]}>
              <View style={[styles.chargeIcon, { backgroundColor: "#ede9fe" }]}>
                <Ionicons name="mail" size={16} color="#7c3aed" />
              </View>
              <Text style={styles.contactText}>{tenant.email}</Text>
            </View>
          ) : null}
        </View>

        {/* Note */}
        {lease.note ? (
          <View style={[styles.card, { marginTop: 16, flexDirection: "row", gap: 12 }]}>
            <Ionicons name="information-circle" size={20} color="#159df8" />
            <Text style={styles.noteText}>{lease.note}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f1f5f9" },
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    gap: 12,
  },
  emptyText: { color: "#94a3b8", fontSize: 15, fontWeight: "600" },
  retryBtn: {
    backgroundColor: "#159df8",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  retryText: { color: "#fff", fontWeight: "700" },

  header: {
    paddingBottom: 46,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  headerCircle: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "rgba(255,255,255,0.10)",
    top: -90,
    right: -50,
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
  headerBody: { alignItems: "center", marginTop: 6 },
  avatarImg: {
    width: 84,
    height: 84,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.6)",
    marginBottom: 12,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    marginBottom: 12,
  },
  avatarText: { color: "#fff", fontSize: 30, fontWeight: "800" },
  tenantName: { color: "#fff", fontSize: 21, fontWeight: "800" },
  property: { color: "rgba(255,255,255,0.9)", fontSize: 14, marginTop: 3 },
  headerBadges: { flexDirection: "row", gap: 8, marginTop: 14, flexWrap: "wrap", justifyContent: "center" },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#fff" },
  unitPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  scroll: { flex: 1, paddingHorizontal: 18, marginTop: -26 },

  payableCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  payableIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  payableLabel: { fontSize: 13, color: "#64748b", fontWeight: "600" },
  payableValue: { fontSize: 24, fontWeight: "800", color: "#0f172a", marginTop: 2 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 24,
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  termRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  termLabel: { fontSize: 12.5, color: "#94a3b8", fontWeight: "600" },
  termValue: { fontSize: 15.5, color: "#0f172a", fontWeight: "800", marginTop: 3 },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
    marginTop: 16,
    overflow: "hidden",
  },
  progressFill: { height: 7, borderRadius: 4, backgroundColor: "#159df8" },
  termFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  termChip: { flexDirection: "row", alignItems: "center", gap: 6 },
  termChipText: { fontSize: 13.5, fontWeight: "700", color: "#159df8" },
  noticeText: { fontSize: 12.5, color: "#94a3b8", fontWeight: "600" },

  chargeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  chargeIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chargeLabel: { flex: 1, fontSize: 14.5, color: "#334155", fontWeight: "600" },
  chargeValue: { fontSize: 14.5, color: "#0f172a", fontWeight: "800" },
  totalDivider: { height: 1, backgroundColor: "#e2e8f0", marginVertical: 6 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
  totalLabel: { fontSize: 15, fontWeight: "800", color: "#0f172a" },
  totalValue: { fontSize: 19, fontWeight: "800", color: "#159df8" },

  occGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  occCard: {
    width: "47%",
    flexGrow: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    gap: 4,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  occValue: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  occLabel: { fontSize: 12.5, color: "#94a3b8", fontWeight: "600" },

  mileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  mileLabel: { flex: 1, fontSize: 15, color: "#0f172a", fontWeight: "600" },
  mileDone: { fontSize: 12.5, color: "#16a34a", fontWeight: "700" },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  contactText: { fontSize: 15, color: "#334155", fontWeight: "600" },

  noteText: { flex: 1, fontSize: 14, color: "#475569", lineHeight: 21 },
});
