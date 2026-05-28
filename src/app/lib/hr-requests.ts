export type HrQueryType = "new_employee" | "exit_employee";
export type HrLocation = "Bangalore" | "Kushal Nagar" | "Warehouse";
export type HrAssignRequirement = "E-Mail" | "Laptop" | "Phone" | "SIM";
export type HrRequestStatus =
  | "pending"
  | "progress"
  | "assigned"
  | "collected"
  | "in_progress"
  | "resolved"
  | "completed";

interface HrRequestRow {
  ticket_id: string;
  employee_id: string;
  name: string;
  designation: string;
  reporting_to: string;
  mobile_no: string;
  doj: string;
  location: HrLocation;
  assignement_requirement: string | null;
  handover_asset: string | null;
  email: string | null;
  laptop: string | null;
  phone: string | null;
  sim: string | null;
  request_created_date: string;
  request_updated_date: string;
  status?: HrRequestStatus | null;
}

export interface HrRequest {
  id: string;
  ticket_id: string;
  query_type: HrQueryType;
  employee_id: string;
  employee_name: string;
  designation: string;
  reporting_to: string;
  mobile_number: string;
  doe: string;
  location: HrLocation;
  assign_requirement: string;
  handover_asset: string;
  email: string;
  laptop: string;
  phone: string;
  sim: string;
  status: HrRequestStatus;
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
  doe: string;
  location: HrLocation;
  assign_requirement: string;
}

export interface HrRequestAdminUpdate {
  id: string;
  status: HrRequestStatus;
  email?: string;
  laptop?: string;
  phone?: string;
  sim?: string;
}

export function parseAssetList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean) as HrAssignRequirement[];
}

export function isResolvedStatus(status: string) {
  return (
    status === "resolved" ||
    status === "completed" ||
    status === "assigned" ||
    status === "collected"
  );
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
  return `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/hr_request`;
}

function normalizeStatus(row: HrRequestRow): HrRequestStatus {
  if (!row.status) {
    return "pending";
  }

  if (row.status === "in_progress") {
    return "progress";
  }

  return row.status;
}

function mapHrRequest(row: HrRequestRow): HrRequest {
  const hasHandoverAsset = Boolean(row.handover_asset && row.handover_asset.trim());

  return {
    id: row.ticket_id,
    ticket_id: row.ticket_id,
    query_type: hasHandoverAsset ? "exit_employee" : "new_employee",
    employee_id: row.employee_id,
    employee_name: row.name,
    designation: row.designation,
    reporting_to: row.reporting_to,
    mobile_number: row.mobile_no,
    doe: row.doj,
    location: row.location,
    assign_requirement: row.assignement_requirement ?? "",
    handover_asset: row.handover_asset ?? "",
    email: row.email ?? "",
    laptop: row.laptop ?? "",
    phone: row.phone ?? "",
    sim: row.sim ?? "",
    status: normalizeStatus(row),
    created_at: row.request_created_date,
    updated_at: row.request_updated_date,
  };
}

export async function listHrRequests() {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase configuration is missing.");
  }

  const response = await fetch(
    `${getSupabaseTableUrl()}?select=*&order=request_created_date.desc`,
    {
      headers: getSupabaseHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load HR requests from Supabase.");
  }

  const rows = (await response.json()) as HrRequestRow[];
  return rows.map(mapHrRequest);
}

export async function createHrRequest(input: HrRequestInput) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase configuration is missing.");
  }

  const now = new Date().toISOString();
  const response = await fetch(getSupabaseTableUrl(), {
    method: "POST",
    headers: {
      ...getSupabaseHeaders(),
      Prefer: "return=representation",
    },
    body: JSON.stringify([
      {
        employee_id: input.employee_id,
        name: input.employee_name,
        designation: input.designation,
        reporting_to: input.reporting_to,
        mobile_no: input.mobile_number,
        doj: input.doe,
        location: input.location,
        assignement_requirement:
          input.query_type === "new_employee" ? input.assign_requirement : null,
        handover_asset: input.query_type === "exit_employee" ? input.assign_requirement : null,
        email: null,
        laptop: null,
        phone: null,
        sim: null,
        request_created_date: now,
        request_updated_date: now,
        status: "pending",
      },
    ]),
  });

  if (!response.ok) {
    throw new Error("Failed to create HR request in Supabase.");
  }

  const [created] = (await response.json()) as HrRequestRow[];
  return mapHrRequest(created);
}

export async function updateHrRequestAdmin(input: HrRequestAdminUpdate) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase configuration is missing.");
  }

  const payload = {
    status: input.status,
    email: input.email?.trim() || null,
    laptop: input.laptop?.trim() || null,
    phone: input.phone?.trim() || null,
    sim: input.sim?.trim() || null,
    request_updated_date: new Date().toISOString(),
  };

  let response = await fetch(
    `${getSupabaseTableUrl()}?ticket_id=eq.${encodeURIComponent(input.id)}`,
    {
      method: "PATCH",
      headers: {
        ...getSupabaseHeaders(),
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok && input.status === "progress") {
    response = await fetch(
      `${getSupabaseTableUrl()}?ticket_id=eq.${encodeURIComponent(input.id)}`,
      {
        method: "PATCH",
        headers: {
          ...getSupabaseHeaders(),
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          ...payload,
          status: "in_progress",
        }),
      },
    );
  }

  if (!response.ok && (input.status === "assigned" || input.status === "collected")) {
    response = await fetch(
      `${getSupabaseTableUrl()}?ticket_id=eq.${encodeURIComponent(input.id)}`,
      {
        method: "PATCH",
        headers: {
          ...getSupabaseHeaders(),
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          ...payload,
          status: input.status === "assigned" ? "resolved" : "completed",
        }),
      },
    );
  }

  if (!response.ok) {
    throw new Error("Failed to update HR request in Supabase.");
  }

  const [updated] = (await response.json()) as HrRequestRow[];
  return updated ? mapHrRequest(updated) : null;
}

export const hrQueryLabels: Record<HrQueryType, string> = {
  new_employee: "New Employee",
  exit_employee: "Exit Employee",
};

export const hrStatusLabels: Record<HrRequestStatus, string> = {
  pending: "Pending",
  progress: "Progress",
  in_progress: "Progress",
  assigned: "Assigned",
  collected: "Collected",
  resolved: "Assigned",
  completed: "Collected",
};
