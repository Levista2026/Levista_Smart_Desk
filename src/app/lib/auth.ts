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
  window.dispatchEvent(new Event("levista-user-updated"));
}

export async function updateStoredUserProfile(input: {
  name: string;
  email: string;
  designation: string;
}) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase configuration is missing.");
  }

  const currentUser = getStoredUser();
  if (!currentUser) {
    throw new Error("No logged-in user found.");
  }

  const trimmedName = input.name.trim();
  const trimmedEmail = input.email.trim().toLowerCase();
  const trimmedDesignation = input.designation.trim();

  if (!trimmedName || !trimmedEmail || !trimmedDesignation) {
    throw new Error("Name, email, and designation are all required.");
  }

  const userAccessResponse = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_access?id=eq.${currentUser.id}`,
    {
      method: "PATCH",
      headers: {
        ...getHeaders(),
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        name: trimmedName,
        email: trimmedEmail,
        Deisgnation: trimmedDesignation,
      }),
    },
  );

  if (!userAccessResponse.ok) {
    throw new Error("Failed to update profile in user_access.");
  }

  if (currentUser.accessToken) {
    const authUpdateResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`, {
      method: "PUT",
      headers: {
        apikey: getApiKey(),
        Authorization: `Bearer ${currentUser.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: trimmedEmail,
        data: {
          name: trimmedName,
          designation: trimmedDesignation,
        },
      }),
    });

    if (!authUpdateResponse.ok) {
      throw new Error("Profile updated in user_access, but failed to update Supabase Auth email.");
    }
  }

  const [updatedRow] = (await userAccessResponse.json()) as UserAccessRow[];
  const updatedUser = mapAccessRow(updatedRow);
  updatedUser.accessToken = currentUser.accessToken;
  updatedUser.refreshToken = currentUser.refreshToken;
  setStoredUser(updatedUser);
  return updatedUser;
}

export function clearStoredRole() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_USER_KEY);
}
