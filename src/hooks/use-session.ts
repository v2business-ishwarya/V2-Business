import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useQuery } from "@tanstack/react-query";
type SessionUser = { id: string; email: string; name?: string | null; role: string };

function readStoredUser(): SessionUser | null {
  try {
    const value = localStorage.getItem("user");
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function notifySessionChange() {
  window.dispatchEvent(new Event("auth-change"));
}

export function useSession() {
  const [session, setSession] = useState<{ user: SessionUser | null } | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync with localStorage changes (e.g., from other tabs)
  useEffect(() => {
    const handler = (e: Event) => {
      if (!(e instanceof StorageEvent) || e.key === "user" || e.key === "accessToken") {
        const token = localStorage.getItem("accessToken");
        const user = readStoredUser();
        setSession(token ? { user } : null);
      }
    };
    window.addEventListener("storage", handler);
    window.addEventListener("auth-change", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("auth-change", handler);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadSession = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setSession(null);
          return;
        }
        // Try to get user from localStorage
        let user = readStoredUser();
        if (user) {
          setSession({ user });
        } else {
          // No cached user, fetch from backend
          const userData = await api.getMe();
          if (userData) {
            user = userData;
            // Cache it
            localStorage.setItem("user", JSON.stringify(user));
          }
          setSession({ user });
        }
      } catch (err) {
        console.error("Session load error", err);
        setSession(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadSession();
    return () => {
      mounted = false;
    };
  }, []);

  return { session, loading, user: session?.user ?? null };
}

// Wrapper for login/logout functions to be used elsewhere
export async function login(email: string, password: string) {
  const res = await api.login({ email, password });
  storeSession(res);
  return res;
}

export async function logout() {
  try {
    await api.logout();
  } finally {
    clearSession();
  }
}

export function storeSession(res: { accessToken: string; user: SessionUser }) {
  localStorage.setItem("accessToken", res.accessToken);
  localStorage.setItem("user", JSON.stringify(res.user));
  notifySessionChange();
}

export function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  notifySessionChange();
}

export async function refreshToken() {
  const res = await api.refresh();
  localStorage.setItem("accessToken", res.accessToken);
  return res;
}

// For protected routes: check if user is logged in
export function useAuth() {
  const { session, loading } = useSession();
  return {
    isAuthenticated: !!session?.user,
    user: session?.user ?? null,
    loading,
  };
}

// The marketplace uses the backend JWT session. Keep these helpers synchronous with it.
export function useUserRoles() {
  // Return empty array; roles are now part of user.role
  return [];
}

export function useMyVendor() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-vendor", user?.id],
    enabled: !!user,
    queryFn: async () =>
      user?.role === "VENDOR" || user?.role === "ADMIN"
        ? {
            id: user.id,
            name: user.name ?? user.email,
            slug: user.id,
            status: "approved",
            tagline: "",
            description: "",
            email: user.email,
            phone: "",
            address: "",
            logo_url: "",
            banner_url: "",
          }
        : null,
  });
}
