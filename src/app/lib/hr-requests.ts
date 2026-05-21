export type HrQueryType = "it_issue" | "new_employee" | "exit_employee";
export type HrLocation = "Bangalore" | "Kushal Nagar" | "Warehouse";
export type HrAssignRequirement = "E-mail Creation" | "Laptop Allocation";
export type HrRequestStatus = "pending" | "in_progress" | "completed";

export interface HrRequest {
  id: string;
  query_type: HrQueryType;
  employee_id: string;
  employee_name: string;
  designation: string;
  reporting_to: string;
  mobile_number: string;
  doj: string;
  location: HrLocation;
  assign_requirement: string;
  remarks: string;
  status: HrRequestStatus;
  official_email: string | null;
  laptop_allocation: string | null;
  created_at: string;
  updated_at: string;
}

export interface HrRequestInput {
  query_type: HrQueryType;
  employee_id: string;
  employee_name: string;
  designation: string;
  reporting_to: string;
  mobile_number: string;
  doj: string;
  location: HrLocation;
  assign_requirement: string;
  remarks: string;
}

export interface HrRequestAdminUpdate {
  id: string;
  official_email: string;
  laptop_allocation: string;
  remarks: string;
  status: HrRequestStatus;
}

function hasSupabaseConfig() {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
      (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY),
  );
}

function getSupabaseHeaders() {
  const apiKey =
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

  return {
    apikey: apiKey as string,
    Authorization: `Bearer ${apiKey as string}`,
    "Content-Type": "application/json",
  };
}

function getSupabaseTableUrl() {
  return `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/Hr_request`;
}

export async function listHrRequests() {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase configuration is missing.");
  }

  const response = await fetch(
    `${getSupabaseTableUrl()}?select=*&order=created_at.desc`,
    {
      headers: getSupabaseHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load HR requests from Supabase.");
  }

  return (await response.json()) as HrRequest[];
}

export async function createHrRequest(input: HrRequestInput) {
  const now = new Date().toISOString();
  const request: HrRequest = {
    id: `HR-REQ-${Date.now()}`,
    ...input,
    status: "pending",
    official_email: null,
    laptop_allocation: null,
    created_at: now,
    updated_at: now,
  };

  if (!hasSupabaseConfig()) {
    throw new Error("Supabase configuration is missing.");
  }

  const response = await fetch(getSupabaseTableUrl(), {
    method: "POST",
    headers: {
      ...getSupabaseHeaders(),
      Prefer: "return=representation",
    },
    body: JSON.stringify([request]),
  });

  if (!response.ok) {
    throw new Error("Failed to create HR request in Supabase.");
  }

  const [created] = (await response.json()) as HrRequest[];
  return created;
}

export async function updateHrRequestAdmin(input: HrRequestAdminUpdate) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase configuration is missing.");
  }

  const response = await fetch(`${getSupabaseTableUrl()}?id=eq.${encodeURIComponent(input.id)}`, {
    method: "PATCH",
    headers: {
      ...getSupabaseHeaders(),
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      official_email: input.official_email,
      laptop_allocation: input.laptop_allocation,
      remarks: input.remarks,
      status: input.status,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update HR request in Supabase.");
  }

  const [updated] = (await response.json()) as HrRequest[];
  return updated ?? null;
}

export const hrQueryLabels: Record<HrQueryType, string> = {
  it_issue: "IT Issue",
  new_employee: "New Employee",
  exit_employee: "Exit Employee",
};

export const hrStatusLabels: Record<HrRequestStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};
