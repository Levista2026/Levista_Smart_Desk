export type UserRole = "admin" | "hr" | "levista";

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
  role: string;
  Designation?: string | null;
  Deisgnation?: string | null;
  status?: string | null;
  Status?: string | null;
  is_active?: boolean | null;
  isActive?: boolean | null;
  active?: boolean | null;
  Active?: boolean | null;
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

function normalizeUserRole(role: string | null | undefined): UserRole | null {
  const normalizedRole = role?.trim().toLowerCase();

  if (normalizedRole === "admin" || normalizedRole === "hr" || normalizedRole === "levista") {
    return normalizedRole;
  }

  if (normalizedRole === "levist") {
    return "levista";
  }

  return null;
}

function mapAccessRow(row: UserAccessRow, role: UserRole): AuthUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    empId: row.emp_id,
    role,
    designation: row.Designation ?? row.Deisgnation ?? row.role.toUpperCase(),
    accessToken: null,
    refreshToken: null,
  };
}

function getUserAccessUrl(email: string) {
  const encodedEmail = encodeURIComponent(email.trim());
  return `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_access?select=*&email=ilike.${encodedEmail}`;
}

function getAuthTokenUrl() {
  return `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=password`;
}

function isAccessRowActive(row: Record<string, unknown>) {
  const statusCandidates = [
    row.status,
    row.Status,
    row.is_active,
    row.isActive,
    row.active,
    row.Active,
  ];

  for (const candidate of statusCandidates) {
    if (typeof candidate === "boolean") {
      return candidate;
    }

    if (typeof candidate === "string") {
      return candidate.trim().toLowerCase() !== "inactive";
    }
  }

  return true;
}

async function validateEmployeeLoginStatus(empId: string) {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/Employee_deatils?select=status,Status,is_active,isActive,active,Active&Emp_code=eq.${encodeURIComponent(empId)}&limit=1`,
    {
      headers: getHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to validate employee status from Supabase.");
  }

  const rows = (await response.json()) as Array<Record<string, unknown>>;
  const employeeRow = rows[0];

  if (!employeeRow) {
    return true;
  }

  return isAccessRowActive(employeeRow);
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

  const response = await fetch(getUserAccessUrl(email), {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to validate user access from Supabase.");
  }

  const users = (await response.json()) as UserAccessRow[];

  if (users.length === 0) {
    throw new Error("No access record was found for this email in the Supabase User Access table.");
  }

  const matchedUser = users.find((userRow) => normalizeUserRole(userRow.role) === role);

  if (!matchedUser) {
    if (role === "levista") {
      throw new Error("Access Denied. Only users with the Levista role can access the ticketing system.");
    }

    throw new Error(`Access denied. This account does not have ${role.toUpperCase()} access.`);
  }

  if (role === "levista") {
    if (!isAccessRowActive(matchedUser)) {
      throw new Error("Access Denied. This employee is inactive and cannot log in.");
    }

    const employeeIsActive = await validateEmployeeLoginStatus(matchedUser.emp_id);

    if (!employeeIsActive) {
      throw new Error("Access Denied. This employee is inactive and cannot log in.");
    }
  }

  const authUser = mapAccessRow(matchedUser, role);
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
    return normalizeUserRole(parsed?.role) ? parsed : null;
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
        Designation: trimmedDesignation,
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
  const updatedRole = normalizeUserRole(updatedRow.role);

  if (!updatedRole) {
    throw new Error("Updated profile returned an unsupported role.");
  }

  const updatedUser = mapAccessRow(updatedRow, updatedRole);
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
