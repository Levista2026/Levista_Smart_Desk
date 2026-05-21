export type UserRole = "admin" | "hr";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  empId: string;
  role: UserRole;
  designation: string;
  accessToken: string | null;
  refreshToken: string | null;
}

interface UserAccessRow {
  id: number;
  name: string;
  email: string;
  emp_id: string;
  role: UserRole;
  Deisgnation: string | null;
}

interface SupabaseAuthResponse {
  access_token: string;
  refresh_token: string;
  user?: {
    email?: string;
  };
}

const AUTH_USER_KEY = "levista-smartdesk-user";

function getApiKey() {
  return (
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
    ""
  );
}

function hasSupabaseConfig() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && getApiKey());
}

function getHeaders() {
  const apiKey = getApiKey();

  return {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

function mapAccessRow(row: UserAccessRow): AuthUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    empId: row.emp_id,
    role: row.role,
    designation: row.Deisgnation ?? row.role.toUpperCase(),
    accessToken: null,
    refreshToken: null,
  };
}

function getUserAccessUrl(email: string, role: UserRole) {
  const encodedEmail = encodeURIComponent(email.trim());
  const encodedRole = encodeURIComponent(role);
  return `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_access?select=id,name,email,emp_id,role,Deisgnation&email=eq.${encodedEmail}&role=eq.${encodedRole}&limit=1`;
}

function getAuthTokenUrl() {
  return `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=password`;
}

async function signInWithSupabaseAuth(email: string, password: string) {
  const response = await fetch(getAuthTokenUrl(), {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
  });

  if (!response.ok) {
    throw new Error("Invalid email or password.");
  }

  return (await response.json()) as SupabaseAuthResponse;
}

export async function loginWithUserAccess(email: string, password: string, role: UserRole) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase configuration is missing.");
  }

  const authSession = await signInWithSupabaseAuth(email, password);

  const response = await fetch(getUserAccessUrl(email, role), {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to validate user access from Supabase.");
  }

  const users = (await response.json()) as UserAccessRow[];
  const matchedUser = users[0];

  if (!matchedUser) {
    throw new Error(`No ${role.toUpperCase()} access found for this email in user_access.`);
  }

  const authUser = mapAccessRow(matchedUser);
  authUser.accessToken = authSession.access_token ?? null;
  authUser.refreshToken = authSession.refresh_token ?? null;
  setStoredUser(authUser);
  return authUser;
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = window.localStorage.getItem(AUTH_USER_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawUser) as AuthUser;
    return parsed?.role === "admin" || parsed?.role === "hr" ? parsed : null;
  } catch {
    return null;
  }
}

export function getStoredRole(): UserRole | null {
  return getStoredUser()?.role ?? null;
}

export function setStoredUser(user: AuthUser) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearStoredRole() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_USER_KEY);
}
