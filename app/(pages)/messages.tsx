import { api } from "@/lib/api";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

export default function ChatScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get("/messages");
      setMessages(res.data);
    } catch (err) {
      // console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshMessages = async () => {
    setRefreshing(true);
    try {
      const res = await api.get("/messages");
      setMessages(res.data);
    } catch (err) {
      // console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage) return;
    try {
      const res = await api.post("/messages", { body: newMessage });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      // console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    const isTenant = item.sender_type === "tenant";
    return (
      <View
        style={[
          styles.bubble,
          {
            alignSelf: isTenant ? "flex-end" : "flex-start",
            backgroundColor: isTenant ? "#159df8" : "#6366f1",
          },
        ]}
      >
        <Text style={styles.bubbleText}>{item.body}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.created_at).toLocaleTimeString()}
        </Text>
      </View>
    );
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
        <Text style={[styles.navTitle, { color: colors.text }]}>Message Box</Text>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#159df8" style={{ marginTop: 30 }} />
        ) : (
          <FlatList
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 14, paddingBottom: 20 }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="chatbubbles-outline" size={46} color="#cbd5e1" />
                <Text style={styles.emptyText}>No messages yet</Text>
              </View>
            }
          />
        )}

        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text },
            ]}
            placeholder="Type a message"
            placeholderTextColor={colors.muted}
            value={newMessage}
            onChangeText={setNewMessage}
            onSubmitEditing={sendMessage}
          />
          <Pressable
            onPress={refreshMessages}
            disabled={refreshing}
            style={({ pressed }) => [styles.refreshBtn, pressed && { opacity: 0.8 }]}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#159df8" />
            ) : (
              <Ionicons name="refresh" size={20} color="#159df8" />
            )}
          </Pressable>
          <Pressable
            onPress={sendMessage}
            style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.8 }]}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
    marginVertical: 5,
  },
  bubbleText: { color: "#fff", fontSize: 14.5, lineHeight: 20 },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    textAlign: "right",
    color: "rgba(255,255,255,0.75)",
  },
  empty: { alignItems: "center", paddingVertical: 70, gap: 12 },
  emptyText: { color: "#94a3b8", fontSize: 15, fontWeight: "600" },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 46,
    fontSize: 15,
  },
  refreshBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#159df8",
    alignItems: "center",
    justifyContent: "center",
  },
});
