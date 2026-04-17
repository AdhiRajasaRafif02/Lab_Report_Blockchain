import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/auth.service";
import type { AuthUser, UserRole } from "../types/api";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("accessToken"));
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setIsReady(true);
        return;
      }
      try {
        const me = await authService.me();
        setUser(me);
      } catch {
        localStorage.removeItem("accessToken");
        setToken(null);
        setUser(null);
      } finally {
        setIsReady(true);
      }
    };
    void bootstrap();
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isReady,
      isAuthenticated: !!user && !!token,
      login: async (email: string, password: string) => {
        const result = await authService.login({ email, password });
        localStorage.setItem("accessToken", result.token);
        setToken(result.token);
        setUser(result.user);
      },
      logout: () => {
        localStorage.removeItem("accessToken");
        setToken(null);
        setUser(null);
      },
      hasRole: (roles: UserRole[]) => (!!user ? roles.includes(user.role) : false)
    }),
    [isReady, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
