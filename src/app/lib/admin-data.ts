import { getSupabaseHeaders, getSupabaseRestUrl, hasSupabaseConfig } from "./supabase-rest";
import { isResolvedStatus } from "./hr-requests";

export type TableCellValue = string | number | boolean | null;

export interface EmployeeDetail {
  id: number;
  Name: string;
  Emp_code: string;
  Designation: string;
  status?: string | null;
  Status?: string | null;
  is_active?: boolean | null;
  isActive?: boolean | null;
  active?: boolean | null;
  Active?: boolean | null;
  [key: string]: TableCellValue | undefined;
}

export interface InventoryItem {
  id: number;
  [key: string]: TableCellValue;
}

export interface SupportTicket {
  id: string;
  title: string;
  requester: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  description?: string | null;
  department?: string | null;
  employee_id?: string | null;
  mobile?: string | null;
  email?: string | null;
  assignee?: string | null;
  resolution_notes?: string | null;
  updated_at?: string | null;
}

export interface SupportTicketInput {
  title: string;
  requester: string;
  category: string;
  priority: string;
  description: string;
  department: string;
  employee_id: string;
  mobile: string;
  email: string;
}

export interface SupportTicketAdminUpdate {
  id: string;
  status: "pending" | "in_progress" | "resolved" | "completed";
  assignee?: string;
  resolution_notes?: string;
}

const employeeStatusFieldCandidates = [
  "status",
  "Status",
  "is_active",
  "isActive",
  "active",
  "Active",
] as const;

function normalizeTableValue(value: TableCellValue) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  return value;
}

function getEmployeeStatusField(employee: EmployeeDetail) {
  return employeeStatusFieldCandidates.find((field) => field in employee) ?? "status";
}

export function isEmployeeActive(employee: EmployeeDetail) {
  const field = getEmployeeStatusField(employee);
  const value = employee[field];

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.trim().toLowerCase() !== "inactive";
  }

  return true;
}

async function fetchTable<T>(path: string) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase configuration is missing.");
  }

  const response = await fetch(getSupabaseRestUrl(path), {
    headers: getSupabaseHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to load data from ${path}.`);
  }

  return (await response.json()) as T[];
}

export async function listEmployeeDetails() {
  return fetchTable<EmployeeDetail>("Employee_deatils?select=*&order=id.asc");
}

export async function listInventoryItems() {
  return fetchTable<InventoryItem>("Inventory?select=*&order=id.asc");
}

export async function createInventoryItem(input: Record<string, TableCellValue>) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase configuration is missing.");
  }

  const payload = Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, normalizeTableValue(value)]),
  );

  const response = await fetch(getSupabaseRestUrl("Inventory"), {
    method: "POST",
    headers: {
      ...getSupabaseHeaders(),
      Prefer: "return=representation",
    },
    body: JSON.stringify([payload]),
  });

  if (!response.ok) {
    throw new Error("Failed to add inventory record in Supabase.");
  }

  const [created] = (await response.json()) as InventoryItem[];
  return created;
}

export async function updateInventoryItem(
  id: number,
  input: Record<string, TableCellValue>,
) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase configuration is missing.");
  }

  const payload = Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, normalizeTableValue(value)]),
  );

  const response = await fetch(getSupabaseRestUrl(`Inventory?id=eq.${id}`), {
    method: "PATCH",
    headers: {
      ...getSupabaseHeaders(),
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update inventory record in Supabase.");
  }

  const [updated] = (await response.json()) as InventoryItem[];
  return updated;
}

export async function updateEmployeeActiveState(employee: EmployeeDetail, active: boolean) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase configuration is missing.");
  }

  const statusField = getEmployeeStatusField(employee);
  const statusValue =
    typeof employee[statusField] === "boolean" ? active : active ? "Active" : "Inactive";

  const employeeResponse = await fetch(getSupabaseRestUrl(`Employee_deatils?id=eq.${employee.id}`), {
    method: "PATCH",
    headers: {
      ...getSupabaseHeaders(),
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      [statusField]: statusValue,
    }),
  });

  if (!employeeResponse.ok) {
    throw new Error("Failed to update employee status in Supabase.");
  }

  const userAccessField = typeof employee[statusField] === "boolean" ? "is_active" : "status";

  await fetch(
    getSupabaseRestUrl(`user_access?emp_id=eq.${encodeURIComponent(employee.Emp_code)}`),
    {
      method: "PATCH",
      headers: {
        ...getSupabaseHeaders(),
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        [userAccessField]: statusValue,
      }),
    },
  ).catch(() => null);

  const [updated] = (await employeeResponse.json()) as EmployeeDetail[];
  return updated;
}

export async function listSupportTickets() {
  try {
    return await fetchTable<SupportTicket>("tickets?select=*&order=created_at.desc");
  } catch {
    return [];
  }
}

export async function listOpenSupportTickets() {
  try {
    const tickets = await fetchTable<SupportTicket>("tickets?select=*&order=created_at.desc");
    return tickets.filter((ticket) => !isResolvedStatus(ticket.status));
  } catch {
    return [];
  }
}

export async function createSupportTicket(input: SupportTicketInput) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase configuration is missing.");
  }

  const response = await fetch(getSupabaseRestUrl("tickets"), {
    method: "POST",
    headers: {
      ...getSupabaseHeaders(),
      Prefer: "return=representation",
    },
    body: JSON.stringify([
      {
        ...input,
        status: "pending",
      },
    ]),
  });

  if (!response.ok) {
    throw new Error("Failed to create ticket in Supabase.");
  }

  const [created] = (await response.json()) as SupportTicket[];
  return created;
}

export async function getSupportTicketById(ticketId: string) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase configuration is missing.");
  }

  try {
    const response = await fetch(
      getSupabaseRestUrl(`tickets?select=*&id=eq.${encodeURIComponent(ticketId)}&limit=1`),
      {
        headers: getSupabaseHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error("Ticket table unavailable.");
    }

    const tickets = (await response.json()) as SupportTicket[];
    return tickets[0] ?? null;
  } catch {
    return null;
  }
}

export async function updateSupportTicket(input: SupportTicketAdminUpdate) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase configuration is missing.");
  }

  const payload = {
    status: input.status,
    assignee: input.assignee?.trim() || null,
    resolution_notes: input.resolution_notes?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  let response = await fetch(getSupabaseRestUrl(`tickets?id=eq.${encodeURIComponent(input.id)}`), {
    method: "PATCH",
    headers: {
      ...getSupabaseHeaders(),
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok && input.status === "resolved") {
    response = await fetch(getSupabaseRestUrl(`tickets?id=eq.${encodeURIComponent(input.id)}`), {
      method: "PATCH",
      headers: {
        ...getSupabaseHeaders(),
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        ...payload,
        status: "completed",
      }),
    });
  }

  if (!response.ok) {
    throw new Error("Failed to update ticket in Supabase.");
  }

  const [updated] = (await response.json()) as SupportTicket[];
  return updated ?? null;
}
