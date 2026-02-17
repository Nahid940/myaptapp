import { api } from "@/lib/api";
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Button, StyleSheet, TouchableOpacity, ActivityIndicator} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";

export default function ChatScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/messages');
      const data = res.data;
      // console.log(res)
      setMessages(data);
    } catch (err) {
      // console.error(err);
    }finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage) return;
    try {
      const res = await api.post("/messages", {'body':newMessage});
      const msg =  res.data;
      setMessages((prev) => [...prev, msg]);
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
          { alignSelf: isTenant ? "flex-end" : "flex-start", backgroundColor: isTenant ? "#4A90E2" : "#E5E5EA" },
        ]}
      >
        <Text style={{ color: isTenant ? "#fff" : "#000" }}>{item.body}</Text>
        <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleTimeString()}</Text>
      </View>
    );
  };

  return (
    
    <SafeAreaView style={{ flex: 1 }}>
    {loading && <ActivityIndicator size="large" color="#df1447" />}
    <View style={styles.navbar}>
      <TouchableOpacity>
        <Ionicons name="arrow-back" size={24} color="#1e293b" onPress = {() => router.push('/(tabs)')} />
      </TouchableOpacity>
      <Text style={styles.navTitle}>Message Box</Text>
    </View>

      <View style={styles.container}>
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 10 }}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            value={newMessage}
            onChangeText={setNewMessage}
          />
          <Button title="Send" onPress={sendMessage} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
   navbar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  bubble: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  timestamp: { fontSize: 10, marginTop: 3, textAlign: "right", color: "#666" },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    height: 40,
  },
});
