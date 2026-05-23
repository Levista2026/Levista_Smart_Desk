import { getSupabaseHeaders, getSupabaseRestUrl, hasSupabaseConfig } from "./supabase-rest";

export interface EmployeeDetail {
  id: number;
  Name: string;
  Emp_code: string;
  Designation: string;
}

export interface InventoryItem {
  id: number;
  [key: string]: string | number | boolean | null;
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
  assignee?: string | null;
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

export async function listSupportTickets() {
  try {
    return await fetchTable<SupportTicket>("Tickets?select=*&order=created_at.desc");
  } catch {
    return [];
  }
}

export async function getSupportTicketById(ticketId: string) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase configuration is missing.");
  }

  try {
    const response = await fetch(
      getSupabaseRestUrl(`Tickets?select=*&id=eq.${encodeURIComponent(ticketId)}&limit=1`),
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
