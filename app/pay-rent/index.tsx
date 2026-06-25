import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const tagFor = (item: any): { label: string; bg: string; color: string } | null => {
  const t = String(item.type ?? item.tag ?? "").toLowerCase();
  if (t.includes("late") || t.includes("lfee") || t.includes("fee"))
    return { label: "Late Fee", bg: "#fee2e2", color: "#dc2626" };
  if (t.includes("water")) return { label: "Water", bg: "#dbeafe", color: "#1d4ed8" };
  if (t.includes("electric")) return { label: "Electricity", bg: "#fef3c7", color: "#b45309" };
  if (t.includes("service")) return { label: "Service", bg: "#ccfbf1", color: "#0d9488" };
  if (t && t !== "rent" && item.type_label)
    return { label: item.type_label, bg: "#e2e8f0", color: "#475569" };
  return null;
};

const isLateItem = (item: any) => {
  const t = String(item.type ?? "").toLowerCase();
  return t.includes("late") || t.includes("lfee") || t.includes("fee");
};

export default function PayRentScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currency, setCurrency] = useState("KES");
  const [tenant, setTenant] = useState<{ name?: string; unit?: string }>({});
  const [total, setTotal] = useState<number | null>(null);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [invoices, setInvoices] = useState<any[]>([]);

  // Payment form
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [reference, setReference] = useState("");
  const [remarks, setRemarks] = useState("");
  const [methodModal, setMethodModal] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string; method?: string; reference?: string }>({});

  const METHODS = ["Bank", "M-Pesa"];

  const money = (v: any) =>
    v === undefined || v === null
      ? "—"
      : `${currency} ${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const fetchPreview = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/due-invoices`);
      const list = res?.due_invoices ?? res?.data?.due_invoices ?? [];

      setCurrency(res?.currency ?? "KES");
      setTenant({
        name: user?.name,
        unit: res?.current_invoice?.unit ?? (Array.isArray(list) ? list[0]?.unit : undefined),
      });
      const totalVal = res?.summary?.total_owed ?? res?.summary?.account_due ?? null;
      setTotal(totalVal);
      if (totalVal != null) setAmount(String(totalVal));
      setUnpaidCount(res?.summary?.invoice_count ?? (Array.isArray(list) ? list.length : 0));
      setInvoices(Array.isArray(list) ? list : []);
    } catch (err) {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, []);

  const handleSubmit = async () => {
    const e: typeof errors = {};
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt <= 0) e.amount = "Enter a valid amount";
    if (!method) e.method = "Select a payment method";
    if (!reference.trim()) e.reference = "Reference is required";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    try {
      const res = await api.post("/payment-acknowledgements", {
        payment_method: method,
        amount: amt,
        reference: reference.trim(),
        remarks: remarks.trim() || undefined,
      });

      if (res?.success || res?.acknowledgement) {
        Alert.alert("Submitted", res?.message || "Payment acknowledgement submitted successfully.");
        router.back();
      } else {
        Alert.alert("Error", "Could not submit. Please try again.");
      }
    } catch (err) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
        <Text style={[styles.navTitle, { color: colors.text }]}>Pay Rent</Text>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
      <ScrollView
        contentContainerStyle={{ padding: 18, paddingBottom: 30 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {/* Head */}
          <View style={styles.head}>
            <View style={styles.headTitleRow}>
              <Ionicons name="layers" size={18} color="#10b981" />
              <Text style={[styles.headTitle, { color: colors.text }]}>Payable Items</Text>
            </View>
            <Text style={styles.headSub}>Oldest unpaid invoice clears first</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#159df8" style={{ marginVertical: 40 }} />
          ) : (
            <>
              {/* Balance hero */}
              <View style={styles.hero}>
                <View style={styles.heroLabelRow}>
                  <Ionicons name="person-circle" size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.heroLabel}>
                    {tenant.name ?? "Tenant"}
                    {tenant.unit ? `  —  Unit ${tenant.unit}` : ""}
                  </Text>
                </View>
                <Text style={styles.heroAmount}>{money(total)}</Text>
                <Text style={styles.heroMeta}>
                  {unpaidCount} unpaid invoice{unpaidCount === 1 ? "" : "s"} pending
                </Text>
              </View>

              {/* FIFO list */}
              {invoices.map((item, index) => {
                const first = index === 0;
                const late = isLateItem(item);
                const tag = tagFor(item);
                return (
                  <View
                    key={item.id ?? item.invoice_id ?? index}
                    style={[
                      styles.fifoItem,
                      { borderColor: colors.border },
                      first && {
                        backgroundColor: isDark ? "rgba(16,185,129,0.12)" : "#f0fdf4",
                        borderColor: isDark ? "rgba(16,185,129,0.45)" : "#bbf7d0",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.fifoNum,
                        first && styles.fifoNumFirst,
                        late && styles.fifoNumLate,
                      ]}
                    >
                      <Text style={styles.fifoNumText}>{index + 1}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={styles.invIdRow}>
                        <Text style={[styles.invId, { color: colors.text }]} numberOfLines={1}>
                          {item.invoice_id ?? item.reference ?? `Invoice #${item.id}`}
                        </Text>
                        {tag ? (
                          <View style={[styles.tag, { backgroundColor: tag.bg }]}>
                            <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.invMeta}>
                        {item.period ?? ""}
                        {item.due_date ? `  ·  Due ${item.due_date}` : ""}
                      </Text>
                    </View>

                    <Text style={[styles.fifoAmt, { color: colors.text }]}>
                      {money(item.balance ?? item.amount ?? item.charge_amount)}
                    </Text>
                  </View>
                );
              })}

              {invoices.length === 0 && (
                <View style={styles.empty}>
                  <Ionicons name="checkmark-circle-outline" size={44} color="#16a34a" />
                  <Text style={styles.emptyText}>No unpaid invoices — you're all caught up!</Text>
                </View>
              )}

              {/* Note */}
              {invoices.length > 0 && (
                <View style={styles.note}>
                  <Ionicons name="information-circle" size={18} color="#0891b2" />
                  <Text style={styles.noteText}>
                    Payment is allocated to the oldest unpaid invoice first. Excess automatically
                    rolls over.
                  </Text>
                </View>
              )}

              {/* Payment form */}
              {invoices.length > 0 && (
                <View style={styles.form}>
                  <Text style={styles.formTitle}>Payment Details</Text>

                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Amount *</Text>
                  <View
                    style={[
                      styles.inputWrap,
                      { backgroundColor: colors.inputBg, borderColor: colors.border },
                      errors.amount && styles.inputErr,
                    ]}
                  >
                    <Text style={styles.curPrefix}>{currency}</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      keyboardType="numeric"
                      value={amount}
                      onChangeText={setAmount}
                      placeholder="0"
                      placeholderTextColor={colors.muted}
                    />
                  </View>
                  {errors.amount ? <Text style={styles.errText}>{errors.amount}</Text> : null}

                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Payment Method *</Text>
                  <Pressable
                    style={[
                      styles.selector,
                      { backgroundColor: colors.inputBg, borderColor: colors.border },
                      errors.method && styles.inputErr,
                    ]}
                    onPress={() => setMethodModal(true)}
                  >
                    <Ionicons
                      name={method === "M-Pesa" ? "phone-portrait-outline" : "business-outline"}
                      size={18}
                      color="#159df8"
                    />
                    <Text
                      style={[
                        styles.selectorText,
                        { color: colors.text },
                        !method && { color: colors.muted, fontWeight: "400" },
                      ]}
                    >
                      {method || "Select method"}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color={colors.muted} />
                  </Pressable>
                  {errors.method ? <Text style={styles.errText}>{errors.method}</Text> : null}

                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Reference Number *</Text>
                  <View
                    style={[
                      styles.inputWrap,
                      { backgroundColor: colors.inputBg, borderColor: colors.border },
                      errors.reference && styles.inputErr,
                    ]}
                  >
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={reference}
                      onChangeText={setReference}
                      placeholder="e.g. QWE123"
                      placeholderTextColor={colors.muted}
                      autoCapitalize="characters"
                    />
                  </View>
                  {errors.reference ? <Text style={styles.errText}>{errors.reference}</Text> : null}

                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Remarks</Text>
                  <View
                    style={[
                      styles.inputWrap,
                      { backgroundColor: colors.inputBg, borderColor: colors.border },
                    ]}
                  >
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={remarks}
                      onChangeText={setRemarks}
                      placeholder="Optional note"
                      placeholderTextColor={colors.muted}
                    />
                  </View>
                </View>
              )}

              {/* Submit */}
              {invoices.length > 0 && (
                <TouchableOpacity
                  style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                  onPress={handleSubmit}
                  disabled={submitting}
                  activeOpacity={0.85}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={18} color="#fff" />
                      <Text style={styles.submitText}>Confirm & Record Payment</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Method modal */}
      <Modal
        visible={methodModal}
        transparent
        animationType="fade"
        onRequestClose={() => setMethodModal(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMethodModal(false)}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Payment Method</Text>
            {METHODS.map((m) => {
              const active = m === method;
              return (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.modalItem,
                    active && { backgroundColor: isDark ? "rgba(58,169,240,0.15)" : "#f0f9ff" },
                  ]}
                  onPress={() => {
                    setMethod(m);
                    setErrors((e) => ({ ...e, method: undefined }));
                    setMethodModal(false);
                  }}
                >
                  <Ionicons
                    name={m === "M-Pesa" ? "phone-portrait" : "business"}
                    size={18}
                    color="#159df8"
                  />
                  <Text style={[styles.modalItemText, { color: colors.text }]}>{m}</Text>
                  {active && <Ionicons name="checkmark-circle" size={20} color="#159df8" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f1f5f9" },
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
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { fontSize: 17, fontWeight: "800", color: "#0f172a" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
  },
  head: { marginBottom: 16 },
  headTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headTitle: { fontSize: 16.5, fontWeight: "800", color: "#0f172a" },
  headSub: { fontSize: 12.5, color: "#94a3b8", marginTop: 3, marginLeft: 26 },

  hero: {
    backgroundColor: "#0f766e",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },
  heroLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroLabel: { color: "rgba(255,255,255,0.92)", fontSize: 13, fontWeight: "600", flex: 1 },
  heroAmount: { color: "#fff", fontSize: 32, fontWeight: "800", marginTop: 8 },
  heroMeta: { color: "rgba(255,255,255,0.85)", fontSize: 12.5, marginTop: 4, fontWeight: "600" },

  fifoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginBottom: 10,
  },
  fifoFirst: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  fifoNum: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#94a3b8",
    alignItems: "center",
    justifyContent: "center",
  },
  fifoNumFirst: { backgroundColor: "#10b981" },
  fifoNumLate: { backgroundColor: "#ef4444" },
  fifoNumText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  invIdRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  invId: { fontSize: 13.5, fontWeight: "800", color: "#0f172a" },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 10.5, fontWeight: "800" },
  invMeta: { fontSize: 12, color: "#94a3b8", marginTop: 3, fontWeight: "600" },
  fifoAmt: { fontSize: 14.5, fontWeight: "800", color: "#0f172a" },

  empty: { alignItems: "center", paddingVertical: 30, gap: 10 },
  emptyText: { color: "#64748b", fontSize: 14, fontWeight: "600", textAlign: "center" },

  note: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#ecfeff",
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
  },
  noteText: { flex: 1, fontSize: 12.5, color: "#155e75", lineHeight: 18 },

  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#10b981",
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 16,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  submitText: { color: "#fff", fontWeight: "800", fontSize: 15.5 },

  /* Form */
  form: { marginTop: 18 },
  formTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 6,
    marginTop: 12,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    height: 52,
  },
  inputErr: { borderColor: "#f43f5e" },
  curPrefix: { fontSize: 14, fontWeight: "800", color: "#64748b" },
  input: { flex: 1, fontSize: 15.5, color: "#0f172a", height: "100%" },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    height: 52,
  },
  selectorText: { flex: 1, fontSize: 15, fontWeight: "600", color: "#0f172a" },
  placeholder: { color: "#94a3b8", fontWeight: "400" },
  errText: { color: "#e11d48", fontSize: 12.5, marginTop: 5, marginLeft: 2 },

  /* Modal */
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  modal: { backgroundColor: "#fff", borderRadius: 20, padding: 16 },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
    marginLeft: 4,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  modalItemActive: { backgroundColor: "#f0f9ff" },
  modalItemText: { flex: 1, fontSize: 15, fontWeight: "600", color: "#0f172a" },
});
