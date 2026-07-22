import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { api } from "../lib/api";
import { syncPushToken } from "../lib/notifications";

interface User {
  id?: number;
  name?: string;
  email?: string;
  is_owner?: boolean;
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authToken : string;
  login: (token: string, isOwner?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string>("");
  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return setLoading(false);

      try {
        const res = await api.get("/me");
        const storedOwner = await SecureStore.getItemAsync("is_owner");
        setUser({ ...res, token, is_owner: res?.is_owner ?? storedOwner === "1" });
        setAuthToken(token);
        syncPushToken();
      } catch (err) {
        // console.log("Failed to fetch /me:", err);
        await SecureStore.deleteItemAsync("token");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (token: string, isOwner?: boolean) => {
    try {
      await SecureStore.setItemAsync("token", token);
      if (isOwner !== undefined) {
        await SecureStore.setItemAsync("is_owner", isOwner ? "1" : "0");
      }
      const res = await api.get("/me");
      const storedOwner = await SecureStore.getItemAsync("is_owner");
      setUser({ ...res, token, is_owner: res?.is_owner ?? isOwner ?? storedOwner === "1" });
      setAuthToken(token);
      syncPushToken();
    } catch (err) {
      // console.log("Login failed:", err);
      await SecureStore.deleteItemAsync("token");
      setUser(null);
      throw err;
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("is_owner");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, authToken, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
