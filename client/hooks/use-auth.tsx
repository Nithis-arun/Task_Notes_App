import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api-client";

type User = { id: string; email: string; name: string } | null;

interface AuthContextValue {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) return setLoading(false);
    api
      .auth
      .me()
      .then((u) => setUser(u))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { token, user } = await api.auth.login({ email, password });
    localStorage.setItem("auth_token", token);
    setUser(user);
  }
  async function register(name: string, email: string, password: string) {
    const { token, user } = await api.auth.register({ name, email, password });
    localStorage.setItem("auth_token", token);
    setUser(user);
  }
  async function logout() {
    await api.auth.logout();
    localStorage.removeItem("auth_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
