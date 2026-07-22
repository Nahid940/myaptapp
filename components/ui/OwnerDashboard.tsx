import React, { useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

const DEFAULT_BUILDING_IMAGE = require("../../assets/images/header_image.jpg");

type Props = {
  data: any;
  notifCount?: number;
  onBellPress?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
};

const statusStyle = (status?: string) => {
  switch ((status || "").toLowerCase()) {
    case "rented":
      return { color: "#16a34a", bg: "#dcfce7", label: "Rented" };
    case "vacant":
      return { color: "#d97706", bg: "#fef3c7", label: "Vacant" };
    case "owner_occupied":
    case "owner occupied":
      return { color: "#2563eb", bg: "#dbeafe", label: "Owner Occupied" };
    default:
      return { color: "#64748b", bg: "#f1f5f9", label: status || "—" };
  }
};

const requestStatusStyle = (status?: string) => {
  switch ((status || "").toLowerCase()) {
    case "open":
      return { color: "#0284c7", bg: "#e0f2fe", label: "Open" };
    case "in_progress":
    case "in progress":
      return { color: "#7c3aed", bg: "#ede9fe", label: "In Progress" };
    case "resolved":
    case "closed":
      return { color: "#16a34a", bg: "#dcfce7", label: "Resolved" };
    default:
      return { color: "#64748b", bg: "#f1f5f9", label: status || "—" };
  }
};

const priorityStyle = (priority?: string) => {
  switch ((priority || "").toLowerCase()) {
    case "high":
    case "urgent":
      return { color: "#dc2626", bg: "#fee2e2" };
    case "medium":
      return { color: "#d97706", bg: "#fef3c7" };
    case "low":
      return { color: "#16a34a", bg: "#dcfce7" };
    default:
      return { color: "#64748b", bg: "#f1f5f9" };
  }
};

export default function OwnerDashboard({
  data,
  notifCount = 0,
  onBellPress,
  refreshing = false,
  onRefresh,
}: Props) {
  const router = useRouter();
  const { colors } = useTheme();
  const [imgError, setImgError] = useState(false);

  const owner = data?.owner ?? {};
  const building = data?.building ?? {};
  const units = data?.units ?? {};
  const occupancy = data?.owner_occupancy ?? {};
  const payments = data?.payments ?? {};
  const maintenance = data?.maintenance ?? {};
  const serviceRequests: any[] = data?.service_requests ?? [];
  const activity: any[] = data?.recent_activity ?? [];

  const currency = data?.currency ?? "KES";
  const fmt = (v: any) =>
    v === undefined || v === null ? "—" : `${currency} ${Number(v).toLocaleString()}`;

  const initials = (owner?.name ?? "")
    .split(" ")
    .map((p: string) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Use the API photo only when it's a valid, loadable http(s) URL.
  // Otherwise (null, empty, relative path, or a load error) fall back to the default.
  const photoUrl = typeof building?.photo_url === "string" ? building.photo_url.trim() : "";
  const hasValidPhoto = /^https?:\/\//i.test(photoUrl) && !imgError;
  const buildingImage = hasValidPhoto ? { uri: photoUrl } : DEFAULT_BUILDING_IMAGE;

  const unitList: any[] = units?.list ?? [];
  const occupiedUnits: any[] = occupancy?.units ?? [];

  // The owner's apartment code (their occupied unit first, else the first unit).
  const apartmentCode =
    occupiedUnits?.[0]?.apartment_code ?? unitList?.[0]?.apartment_code ?? null;

  // Monthly service charge the owner owes, per unit.
  const serviceChargeUnits = (occupiedUnits.length ? occupiedUnits : unitList).filter(
    (u: any) => u?.service_charge != null
  );

  // Due date = the 5th of next month.
  const MONTH_ABBR = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const dueDateObj = new Date();
  const nextDue = new Date(dueDateObj.getFullYear(), dueDateObj.getMonth() + 1, 5);
  const dueDate = `${nextDue.getDate()} ${MONTH_ABBR[nextDue.getMonth()]} ${nextDue.getFullYear()}`;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#159df8"
              colors={["#159df8"]}
            />
          ) : undefined
        }
      >
        {/* Greeting */}
        <View style={styles.greetingRow}>
          <Pressable
            onPress={() => router.push("/account")}
            style={({ pressed }) => [styles.greetingTap, pressed && { opacity: 0.6 }]}
          >
            {owner?.photo_url ? (
              <Image source={{ uri: owner.photo_url }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials || "👤"}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.greetingHello}>Welcome back 👋</Text>
              <Text style={[styles.greetingName, { color: colors.text }]} numberOfLines={1}>
                {owner?.name ?? "Owner"}
              </Text>
            </View>
          </Pressable>
          <Pressable onPress={onBellPress} style={[styles.bellWrap, { backgroundColor: colors.card }]}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            {notifCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{notifCount > 9 ? "9+" : notifCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Building hero */}
        <View style={[styles.headerCard, { backgroundColor: colors.cardAlt }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerKicker}>YOUR PROPERTY</Text>

            <Text style={[styles.headerBuilding, { color: colors.text }]} numberOfLines={2}>
              {building?.name ?? "—"}
            </Text>

            <View style={styles.badgeRow}>
              {apartmentCode ? (
                <View style={styles.aptBadge}>
                  <Ionicons name="home" size={13} color="#159df8" />
                  <Text style={styles.aptBadgeText}>{apartmentCode}</Text>
                </View>
              ) : null}
              {building?.code ? (
                <View style={styles.aptBadge}>
                  <Ionicons name="business" size={13} color="#159df8" />
                  <Text style={styles.aptBadgeText}>{building.code}</Text>
                </View>
              ) : null}
            </View>

            {building?.address ? (
              <>
                <View style={styles.headerLine} />
                <View style={styles.addrRow}>
                  <Ionicons name="location" size={14} color="#64748b" />
                  <Text style={styles.addrText} numberOfLines={2}>
                    {building.address}
                  </Text>
                </View>
              </>
            ) : null}

            {building?.floors ? (
              <View style={styles.floorsRow}>
                <Ionicons name="layers" size={14} color="#16a34a" />
                <Text style={styles.floorsText}>{building.floors} Floors</Text>
              </View>
            ) : null}

            {serviceChargeUnits.length > 0 ? (
              <>
                <View style={styles.headerLine} />
                <Text style={styles.scHeading}>Monthly Service Charge</Text>
                {serviceChargeUnits.map((u: any, i: number) => (
                  <View key={u.booking_id ?? u.id ?? i} style={styles.scLine}>
                    <Ionicons name="home-outline" size={13} color="#64748b" />
                    <Text style={[styles.scLineCode, { color: colors.text }]} numberOfLines={1}>
                      {u.apartment_code}
                    </Text>
                    <Text style={styles.scLineAmt}>{fmt(u.service_charge)}</Text>
                  </View>
                ))}
                <View style={styles.dueRow}>
                  <Ionicons name="calendar" size={13} color="#dc2626" />
                  <Text style={styles.dueText}>Next Due Date {dueDate}</Text>
                </View>
              </>
            ) : null}
          </View>

          <Image
            source={buildingImage}
            style={styles.headerImg}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        </View>

        {/* Quick actions */}
        <View style={[styles.card, styles.quickCard, { backgroundColor: colors.card }]}>
          {[
            {
              title: "Visitor Pass",
              subtitle: "Manage visitors and passes",
              icon: "id-card" as const,
              color: "#4f46e5",
              route: "/guests",
            },
            {
              title: "Maintenance",
              subtitle: "Raise and track request",
              icon: "construct" as const,
              color: "#ea580c",
              route: "/maintenance",
            },
            {
              title: "Utility Bills",
              subtitle: "View bills",
              icon: "flash" as const,
              color: "#0284c7",
              route: "/utilities",
            },
            {
              title: "Community",
              subtitle: "Notices and announcements",
              icon: "megaphone" as const,
              color: "#16a34a",
              route: "/notices",
            },
          ].map((q) => (
            <Pressable
              key={q.title}
              onPress={() => router.push(q.route as any)}
              style={({ pressed }) => [styles.quickTile, pressed && { opacity: 0.65 }]}
            >
              <View style={[styles.quickIcon, { backgroundColor: q.color }]}>
                <Ionicons name={q.icon} size={26} color="#fff" />
              </View>
              <Text style={[styles.quickTitle, { color: colors.text }]} numberOfLines={1}>
                {q.title}
              </Text>
              <Text style={styles.quickSub} numberOfLines={2}>
                {q.subtitle}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Payments */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Payments</Text>
            {Number(payments?.pending_count ?? 0) > 0 && (
              <View style={styles.pendingPill}>
                <Text style={styles.pendingPillText}>
                  {payments.pending_count} pending
                </Text>
              </View>
            )}
          </View>

          <View style={styles.tripleRow}>
            <View style={styles.tripleCol}>
              <Text style={styles.tripleLabel}>Billed</Text>
              <Text style={[styles.tripleValue, { color: colors.text }]}>
                {fmt(payments?.total_billed)}
              </Text>
            </View>
            <View style={styles.vLine} />
            <View style={styles.tripleCol}>
              <Text style={styles.tripleLabel}>Paid</Text>
              <Text style={[styles.tripleValue, { color: "#16a34a" }]}>
                {fmt(payments?.total_paid)}
              </Text>
            </View>
            <View style={styles.vLine} />
            <View style={styles.tripleCol}>
              <Text style={styles.tripleLabel}>Due</Text>
              <Text style={[styles.tripleValue, { color: "#dc2626" }]}>
                {fmt(payments?.total_due)}
              </Text>
            </View>
          </View>
        </View>

        {/* Maintenance */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Maintenance</Text>
            <Pressable onPress={() => router.push("/maintenance" as any)} hitSlop={8}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          <View style={styles.jobRow}>
            <View style={[styles.jobPill, { backgroundColor: "#e0f2fe" }]}>
              <Ionicons name="hammer" size={15} color="#0284c7" />
              <Text style={[styles.jobPillText, { color: "#0284c7" }]}>
                {maintenance?.total_jobs ?? 0} Total Jobs
              </Text>
            </View>
            <View style={[styles.jobPill, { backgroundColor: "#fef3c7" }]}>
              <Ionicons name="time" size={15} color="#d97706" />
              <Text style={[styles.jobPillText, { color: "#d97706" }]}>
                {maintenance?.pending_jobs ?? 0} Pending
              </Text>
            </View>
          </View>

          <View style={styles.tripleRow}>
            <View style={styles.tripleCol}>
              <Text style={styles.tripleLabel}>Cost</Text>
              <Text style={[styles.tripleValue, { color: colors.text }]}>
                {fmt(maintenance?.total_cost)}
              </Text>
            </View>
            <View style={styles.vLine} />
            <View style={styles.tripleCol}>
              <Text style={styles.tripleLabel}>Paid</Text>
              <Text style={[styles.tripleValue, { color: "#16a34a" }]}>
                {fmt(maintenance?.total_paid)}
              </Text>
            </View>
            <View style={styles.vLine} />
            <View style={styles.tripleCol}>
              <Text style={styles.tripleLabel}>Due</Text>
              <Text style={[styles.tripleValue, { color: "#dc2626" }]}>
                {fmt(maintenance?.total_due)}
              </Text>
            </View>
          </View>
        </View>

        {/* Recent service requests */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Recent Service Requests</Text>
            <Pressable onPress={() => router.push("/ticketsList" as any)} hitSlop={8}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          {serviceRequests.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="construct-outline" size={34} color="#cbd5e1" />
              <Text style={styles.emptyText}>No service requests</Text>
            </View>
          ) : (
            serviceRequests.map((r: any, i: number) => {
              const ss = requestStatusStyle(r.status);
              const ps = priorityStyle(r.priority);
              return (
                <View
                  key={r.id ?? i}
                  style={[
                    styles.srRow,
                    { borderBottomColor: colors.border },
                    i === serviceRequests.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 },
                  ]}
                >
                  <View style={[styles.srIcon, { backgroundColor: ss.bg }]}>
                    <Ionicons name="construct" size={17} color={ss.color} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.srTitleRow}>
                      <Text style={[styles.srSubject, { color: colors.text }]} numberOfLines={1}>
                        {r.subject ?? "Request"}
                      </Text>
                      <View style={[styles.badge, { backgroundColor: ss.bg }]}>
                        <Text style={[styles.badgeText, { color: ss.color }]}>{ss.label}</Text>
                      </View>
                    </View>

                    <View style={styles.srMetaRow}>
                      {r.priority ? (
                        <View style={[styles.priorityPill, { backgroundColor: ps.bg }]}>
                          <View style={[styles.priorityDot, { backgroundColor: ps.color }]} />
                          <Text style={[styles.priorityText, { color: ps.color }]}>
                            {String(r.priority).charAt(0).toUpperCase() + String(r.priority).slice(1)}
                          </Text>
                        </View>
                      ) : null}
                      {r.raised_by ? (
                        <Text style={styles.srMeta} numberOfLines={1}>
                          {r.raised_by}
                        </Text>
                      ) : null}
                    </View>

                    {r.date ? <Text style={styles.srDate}>{r.date}</Text> : null}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Owner occupancy */}
        {occupancy?.has_owner_occupied && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 12 }]}>
              Owner Occupancy
            </Text>

            <View style={styles.scRow}>
              <View style={[styles.scIcon, { backgroundColor: "#ede9fe" }]}>
                <Ionicons name="receipt" size={18} color="#7c3aed" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tripleLabel}>Monthly Service Charge</Text>
                <Text style={[styles.scValue, { color: colors.text }]}>
                  {fmt(occupancy?.monthly_service_charge)}
                </Text>
              </View>
            </View>

            {occupiedUnits.map((u: any, i: number) => (
              <View
                key={u.booking_id ?? i}
                style={[
                  styles.occRow,
                  { borderTopColor: colors.border },
                  i === 0 && { borderTopWidth: 1 },
                ]}
              >
                <Ionicons name="home" size={15} color={colors.muted} />
                <Text style={[styles.occCode, { color: colors.text }]}>{u.apartment_code}</Text>
                <Text style={styles.occMeta}>SC {fmt(u.service_charge)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Units list */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 12 }]}>My Units</Text>

          {unitList.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="home-outline" size={34} color="#cbd5e1" />
              <Text style={styles.emptyText}>No units found</Text>
            </View>
          ) : (
            unitList.map((u: any, i: number) => {
              const ss = statusStyle(u.rental_status);
              return (
                <View
                  key={u.id ?? i}
                  style={[
                    styles.unitRow,
                    { borderBottomColor: colors.border },
                    i === unitList.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 },
                  ]}
                >
                  <View style={[styles.unitIcon, { backgroundColor: ss.bg }]}>
                    <Ionicons name="business" size={18} color={ss.color} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.unitTitleRow}>
                      <Text style={[styles.unitCode, { color: colors.text }]} numberOfLines={1}>
                        {u.apartment_code}
                      </Text>
                      <View style={[styles.badge, { backgroundColor: ss.bg }]}>
                        <Text style={[styles.badgeText, { color: ss.color }]}>{ss.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.unitMeta}>
                      Rent {fmt(u.basic_rent)} · SC {fmt(u.service_charge)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Recent activity */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Recent Activity</Text>
            <Pressable onPress={() => router.push("/activities" as any)} hitSlop={8}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          {activity.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="time-outline" size={34} color="#cbd5e1" />
              <Text style={styles.emptyText}>No recent activity yet</Text>
            </View>
          ) : (
            activity.map((a: any, i: number) => (
              <View
                key={a.id ?? i}
                style={[
                  styles.activityRow,
                  { borderBottomColor: colors.border },
                  i === activity.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 },
                ]}
              >
                <View style={[styles.activityIcon, { backgroundColor: "#e0f2fe" }]}>
                  <Ionicons name="pulse" size={17} color="#159df8" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.activityTitle, { color: colors.text }]} numberOfLines={1}>
                    {a.action ?? "Activity"}
                  </Text>
                  {a.description ? (
                    <Text style={styles.activityDesc} numberOfLines={2}>
                      {a.description}
                    </Text>
                  ) : null}
                  <Text style={styles.activityMeta}>
                    {a.by ? `${a.by} · ` : ""}
                    {a.date ?? ""}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 18 },

  /* Greeting */
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 8,
    paddingBottom: 14,
  },
  greetingTap: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#159df8",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: { width: 46, height: 46, borderRadius: 15, backgroundColor: "#e2e8f0" },
  avatarText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  greetingHello: { fontSize: 12.5, color: "#94a3b8", fontWeight: "600" },
  greetingName: { fontSize: 17, fontWeight: "800", marginTop: 1 },
  bellWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  bellBadge: {
    position: "absolute",
    top: 7,
    right: 7,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  bellBadgeText: { color: "#fff", fontSize: 9.5, fontWeight: "800" },

  /* Header card (matches tenant dashboard) */
  headerCard: {
    borderRadius: 24,
    marginBottom: 4,
    minHeight: 210,
  },
  headerLeft: { padding: 16, paddingRight: 150 },
  headerKicker: {
    fontSize: 13,
    fontWeight: "800",
    color: "#159df8",
    letterSpacing: 1.5,
    marginTop: 1,
  },
  headerBuilding: { fontSize: 22, fontWeight: "800", marginTop: 5 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  aptBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    backgroundColor: "#dbeafe",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  aptBadgeText: { color: "#159df8", fontWeight: "800", fontSize: 14.5 },
  headerLine: {
    height: 1,
    backgroundColor: "rgba(15,23,42,0.10)",
    marginVertical: 10,
  },
  addrRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  addrText: { flex: 1, fontSize: 13.5, color: "#64748b", fontWeight: "600" },
  floorsRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  floorsText: { color: "#16a34a", fontWeight: "800", fontSize: 14 },
  scHeading: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  scLine: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 },
  scLineCode: { flex: 1, fontSize: 13, fontWeight: "700", color: "#0f172a" },
  scLineAmt: { fontSize: 13.5, fontWeight: "800", color: "#159df8" },
  dueRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  dueText: { fontSize: 12.5, fontWeight: "700", color: "#dc2626" },
  headerImg: {
    position: "absolute",
    right: 12,
    top: 14,
    width: 120,
    height: 185,
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 9,
  },

  /* Cards */
  card: {
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  /* Quick actions */
  quickCard: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickTile: { flex: 1, alignItems: "center", paddingHorizontal: 2 },
  quickIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  quickTitle: { fontSize: 12.5, fontWeight: "800", textAlign: "center" },
  quickSub: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "800" },
  seeAll: { color: "#159df8", fontSize: 13, fontWeight: "700" },
  pendingPill: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pendingPillText: { color: "#d97706", fontSize: 11.5, fontWeight: "800" },

  tripleRow: { flexDirection: "row", alignItems: "center" },
  tripleCol: { flex: 1, alignItems: "center" },
  tripleLabel: {
    fontSize: 11.5,
    color: "#94a3b8",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tripleValue: { fontSize: 14.5, fontWeight: "800", marginTop: 4 },
  vLine: { width: 1, height: 34, backgroundColor: "#e2e8f0" },

  jobRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  jobPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  jobPillText: { fontSize: 12.5, fontWeight: "800" },

  /* Owner occupancy */
  scRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  scIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  scValue: { fontSize: 17, fontWeight: "800", marginTop: 2 },
  occRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
  occCode: { flex: 1, fontSize: 14, fontWeight: "700" },
  occMeta: { fontSize: 12.5, color: "#94a3b8", fontWeight: "600" },

  /* Units */
  unitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  unitIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  unitTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  unitCode: { flex: 1, fontSize: 15, fontWeight: "800" },
  unitMeta: { fontSize: 12.5, color: "#94a3b8", fontWeight: "600", marginTop: 3 },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: "800" },

  /* Service requests */
  srRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  srIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  srTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  srSubject: { flex: 1, fontSize: 15, fontWeight: "800" },
  srMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  priorityPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  priorityDot: { width: 6, height: 6, borderRadius: 3 },
  priorityText: { fontSize: 11, fontWeight: "800" },
  srMeta: { flex: 1, fontSize: 12.5, color: "#94a3b8", fontWeight: "600" },
  srDate: { fontSize: 11.5, color: "#cbd5e1", fontWeight: "600", marginTop: 5 },

  /* Activity */
  activityRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activityTitle: { fontSize: 14.5, fontWeight: "700" },
  activityDesc: { fontSize: 12.5, color: "#94a3b8", marginTop: 2, lineHeight: 17 },
  activityMeta: { fontSize: 11.5, color: "#cbd5e1", fontWeight: "600", marginTop: 4 },

  empty: { alignItems: "center", paddingVertical: 34, gap: 10 },
  emptyText: { color: "#94a3b8", fontSize: 14, fontWeight: "600" },
});
