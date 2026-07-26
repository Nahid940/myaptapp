import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { api } from "../lib/api";
import { syncPushToken } from "../lib/notifications";

interface User {
  id?: number;
  name?: string;
  email?: string;
  is_owner?: boolean;
  has_active_lease?: boolean;
  token: string;
}

type LoginMeta = { is_owner?: boolean; has_active_lease?: boolean };

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authToken : string;
  login: (token: string, meta?: LoginMeta) => Promise<void>;
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
        const storedLease = await SecureStore.getItemAsync("has_active_lease");
        setUser({
          ...res,
          token,
          is_owner: res?.is_owner ?? storedOwner === "1",
          has_active_lease: res?.has_active_lease ?? storedLease === "1",
        });
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

  const login = async (token: string, meta?: LoginMeta) => {
    try {
      await SecureStore.setItemAsync("token", token);
      if (meta?.is_owner !== undefined) {
        await SecureStore.setItemAsync("is_owner", meta.is_owner ? "1" : "0");
      }
      if (meta?.has_active_lease !== undefined) {
        await SecureStore.setItemAsync("has_active_lease", meta.has_active_lease ? "1" : "0");
      }
      const res = await api.get("/me");
      const storedOwner = await SecureStore.getItemAsync("is_owner");
      const storedLease = await SecureStore.getItemAsync("has_active_lease");
      setUser({
        ...res,
        token,
        is_owner: res?.is_owner ?? meta?.is_owner ?? storedOwner === "1",
        has_active_lease: res?.has_active_lease ?? meta?.has_active_lease ?? storedLease === "1",
      });
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
    await SecureStore.deleteItemAsync("has_active_lease");
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
