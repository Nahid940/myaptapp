import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { api } from "../lib/api";

interface User {
  id?: number;
  name?: string;
  email?: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return setLoading(false);

      try {
        const res = await api.get("/me", token);
        setUser({ ...res, token });
      } catch (err) {
        console.log("Failed to fetch /me:", err);
        await SecureStore.deleteItemAsync("token");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (token: string) => {
    try {
      await SecureStore.setItemAsync("token", token);
      const res = await api.get("/me", token);
      setUser({ ...res, token });
    } catch (err) {
      console.log("Login failed:", err);
      await SecureStore.deleteItemAsync("token");
      setUser(null);
      throw err;
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
