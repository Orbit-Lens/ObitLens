export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  loginCount?: number;
}

const TOKEN_COOKIE = "orbitlens_token";
const USER_KEY = "orbitlens_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + TOKEN_COOKIE + "=([^;]+)"));
  if (match) return decodeURIComponent(match[2]);
  return localStorage.getItem(TOKEN_COOKIE);
}

export function getUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setSession(token: string, user: UserProfile): void {
  if (typeof window === "undefined") return;
  // Set cookie for Next.js middleware access (max-age 7 days, path /)
  const isSecure = window.location.protocol === "https:";
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
  localStorage.setItem(TOKEN_COOKIE, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  localStorage.removeItem(TOKEN_COOKIE);
  localStorage.removeItem(USER_KEY);
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; token?: string; error?: string }> {
  try {
    const res = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      const msg = json.error?.message || (json.error?.details ? json.error.details.map((d: any) => d.message).join(", ") : "Authentication failed");
      return { success: false, error: msg };
    }

    const { user, accessToken } = json.data;
    const profile: UserProfile = {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    setSession(accessToken, profile);
    return { success: true, user: profile, token: accessToken };
  } catch (err: any) {
    return { success: false, error: err.message || "Network connection error" };
  }
}

export async function logoutUser(): Promise<void> {
  const token = getToken();
  try {
    if (token) {
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    }
  } catch {
    // Ignore network error on logout
  } finally {
    clearSession();
    window.location.href = "/login";
  }
}

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch("/api/v1/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      clearSession();
      return null;
    }
    const json = await res.json();
    if (json.success && json.data) {
      const u = json.data;
      const profile: UserProfile = {
        id: u._id || u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        loginCount: u.loginCount,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
      return profile;
    }
    return null;
  } catch {
    return getUser();
  }
}
