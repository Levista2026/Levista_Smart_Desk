import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Clock3, LoaderCircle } from "lucide-react";
import { useSearchParams } from "react-router";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Textarea } from "../components/ui/textarea";
import {
  listSupportTickets,
  updateSupportTicket,
  type SupportTicket,
} from "../lib/admin-data";
import {
  hrQueryLabels,
  hrStatusLabels,
  isResolvedStatus,
  listHrRequests,
  parseAssetList,
  updateHrRequestAdmin,
  type HrRequest,
  type HrRequestStatus,
} from "../lib/hr-requests";

const surfaceClass = "border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]";
const inputClassName =
  "border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:ring-[#38bdf8]/40";

const statusClasses = {
  pending: "border-0 bg-amber-100 text-amber-700",
  progress: "border-0 bg-blue-100 text-blue-700",
  in_progress: "border-0 bg-blue-100 text-blue-700",
  assigned: "border-0 bg-emerald-100 text-emerald-700",
  collected: "border-0 bg-violet-100 text-violet-700",
  resolved: "border-0 bg-sky-100 text-sky-700",
  completed: "border-0 bg-sky-100 text-sky-700",
};

type AdminTicketRow =
  | {
      kind: "hr";
      id: string;
      ticketNo: string;
      requester: string;
      department: string;
      category: string;
      priority: string;
      status: HrRequestStatus;
      createdAt: string;
      raw: HrRequest;
    }
  | {
      kind: "support";
      id: string;
      ticketNo: string;
      requester: string;
      department: string;
      category: string;
      priority: string;
      status: HrRequestStatus;
      createdAt: string;
      raw: SupportTicket;
    };

export function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const [requests, setRequests] = useState<HrRequest[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedTicketKey, setSelectedTicketKey] = useState<string | null>(null);
  const [adminForm, setAdminForm] = useState({
    email: "",
    laptop: "",
    phone: "",
    sim: "",
    assignee: "",
    resolution_notes: "",
    status: "pending" as HrRequestStatus,
  });

  const loadDashboardData = async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }

    setError("");

    try {
      const [hrRows, supportRows] = await Promise.all([listHrRequests(), listSupportTickets()]);
      setRequests(hrRows);
      setSupportTickets(supportRows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load admin data.");
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadDashboardData();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadDashboardData({ silent: true });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  const totals = useMemo(() => {
    const allStatuses = [
      ...requests.map((request) => request.status),
      ...supportTickets.map((ticket) => ticket.status as HrRequestStatus),
    ];

    return {
      resolved: allStatuses.filter((status) => isResolvedStatus(status)).length,
      pending: allStatuses.filter((status) => status === "pending").length,
      in_progress: allStatuses.filter((status) => status === "in_progress").length,
    };
  }, [requests, supportTickets]);

  const combinedTickets = useMemo<AdminTicketRow[]>(() => {
    const hrRows: AdminTicketRow[] = requests
      .filter((request) => !isResolvedStatus(request.status))
      .map((request) => ({
        kind: "hr",
        id: `hr:${request.id}`,
        ticketNo: request.id,
        requester: request.employee_name,
        department: request.location,
        category: hrQueryLabels[request.query_type],
        priority:
          request.query_type === "exit_employee"
            ? request.handover_asset
            : request.assign_requirement,
        status: request.status,
        createdAt: request.created_at,
        raw: request,
      }));

    const supportRows: AdminTicketRow[] = supportTickets
      .filter((ticket) => !isResolvedStatus(ticket.status))
      .map((ticket) => ({
        kind: "support",
        id: `support:${ticket.id}`,
        ticketNo: ticket.id,
        requester: ticket.requester,
        department: ticket.department ?? "-",
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status as HrRequestStatus,
        createdAt: ticket.created_at,
        raw: ticket,
      }));

    return [...hrRows, ...supportRows].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [requests, supportTickets]);

  const searchQuery = searchParams.get("q")?.trim().toLowerCase() ?? "";

  const filteredTickets = useMemo(() => {
    if (!searchQuery) {
      return combinedTickets;
    }

    return combinedTickets.filter((ticket) => {
      const ticketNo = ticket.ticketNo.toLowerCase();
      const requester = ticket.requester.toLowerCase();
      return ticketNo.includes(searchQuery) || requester.includes(searchQuery);
    });
  }, [combinedTickets, searchQuery]);

  const selectedTicket = useMemo(
    () => combinedTickets.find((ticket) => ticket.id === selectedTicketKey) ?? null,
    [combinedTickets, selectedTicketKey],
  );

  useEffect(() => {
    if (!selectedTicket) {
      return;
    }

    if (selectedTicket.kind === "hr") {
      setAdminForm({
        email: selectedTicket.raw.email,
        laptop: selectedTicket.raw.laptop,
        phone: selectedTicket.raw.phone,
        sim: selectedTicket.raw.sim,
        assignee: "",
        resolution_notes: "",
        status: isResolvedStatus(selectedTicket.raw.status)
          ? selectedTicket.raw.query_type === "exit_employee"
            ? "collected"
            : "assigned"
          : selectedTicket.raw.status,
      });
      return;
    }

    setAdminForm({
      email: "",
      laptop: "",
      phone: "",
      sim: "",
      assignee: selectedTicket.raw.assignee ?? "",
      resolution_notes: selectedTicket.raw.resolution_notes ?? "",
      status: isResolvedStatus(selectedTicket.raw.status)
        ? "resolved"
        : (selectedTicket.raw.status as HrRequestStatus),
    });
  }, [selectedTicket]);

  const selectedHrAssets =
    selectedTicket?.kind === "hr"
      ? (
          parseAssetList(
          selectedTicket.raw.query_type === "exit_employee"
            ? selectedTicket.raw.handover_asset
            : selectedTicket.raw.assign_requirement,
          ).length > 0
            ? parseAssetList(
                selectedTicket.raw.query_type === "exit_employee"
                  ? selectedTicket.raw.handover_asset
                  : selectedTicket.raw.assign_requirement,
              )
            : hrAssetOptions
        )
      : [];

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedTicket) {
      setError("Please choose a ticket to update.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      if (selectedTicket.kind === "hr") {
        if (adminForm.status === "assigned" || adminForm.status === "collected") {
          const missingAssets = selectedHrAssets.filter((asset) => {
            if (asset === "E-Mail") {
              return !adminForm.email.trim();
            }

            if (asset === "Laptop") {
              return !adminForm.laptop.trim();
            }

            if (asset === "Phone") {
              return !adminForm.phone.trim();
            }

            return !adminForm.sim.trim();
          });

          if (missingAssets.length > 0) {
            setError(`Please add details for: ${missingAssets.join(", ")}`);
            setSaving(false);
            return;
          }
        }

        await updateHrRequestAdmin({
          id: selectedTicket.raw.id,
          status: adminForm.status,
          email: adminForm.email,
          laptop: adminForm.laptop,
          phone: adminForm.phone,
          sim: adminForm.sim,
        });
      } else {
        await updateSupportTicket({
          id: selectedTicket.raw.id,
          status: adminForm.status,
          assignee: adminForm.assignee,
          resolution_notes: adminForm.resolution_notes,
        });
      }

      setSuccessMessage("Ticket updated successfully.");
      setSelectedTicketKey(null);
      await loadDashboardData();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update ticket.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-semibold text-slate-950">Admin Dashboard</h1>
        <p className="text-slate-600">
          Review all open tickets in one queue and move them through pending, in progress, and
          resolved states.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className={surfaceClass}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Number of Resolved Tickets</p>
              <p className="text-3xl font-semibold text-slate-950">{totals.resolved}</p>
            </div>
          </CardContent>
        </Card>
        <Card className={surfaceClass}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Clock3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending Tickets</p>
              <p className="text-3xl font-semibold text-slate-950">{totals.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className={surfaceClass}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <LoaderCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Tickets In Progress</p>
              <p className="text-3xl font-semibold text-slate-950">{totals.in_progress}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={surfaceClass}>
        <CardHeader>
          <CardTitle className="text-slate-950">Raise Ticket Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                  <TableHead className="text-slate-600">Ticket No</TableHead>
                  <TableHead className="text-slate-600">Requester</TableHead>
                  <TableHead className="text-slate-600">Department</TableHead>
                  <TableHead className="text-slate-600">Category</TableHead>
                  <TableHead className="text-slate-600">Priority / Requirement</TableHead>
                  <TableHead className="text-slate-600">Status</TableHead>
                  <TableHead className="text-slate-600">Created</TableHead>
                  <TableHead className="text-slate-600">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className="border-slate-200">
                    <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                      Loading tickets...
                    </TableCell>
                  </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow className="border-slate-200">
                    <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                      {searchQuery
                        ? "No tickets match this search."
                        : "No open tickets available."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="border-slate-200 hover:bg-slate-50">
                      <TableCell className="font-mono text-slate-950">{ticket.ticketNo}</TableCell>
                      <TableCell className="text-slate-950">{ticket.requester}</TableCell>
                      <TableCell className="text-slate-600">{ticket.department}</TableCell>
                      <TableCell className="text-slate-600">{ticket.category}</TableCell>
                      <TableCell className="text-slate-600">{ticket.priority}</TableCell>
                      <TableCell>
                        <Badge className={statusClasses[ticket.status]}>
                          {hrStatusLabels[ticket.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {format(new Date(ticket.createdAt), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                          onClick={() => setSelectedTicketKey(ticket.id)}
                        >
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {selectedTicket ? (
            <form onSubmit={handleUpdate} className="grid gap-6 xl:grid-cols-[1fr_360px]">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Ticket No</p>
                  <p className="mt-2 font-mono text-slate-950">{selectedTicket.ticketNo}</p>
                  <p className="text-sm text-slate-600">{selectedTicket.category}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Requester</p>
                  <p className="mt-2 font-semibold text-slate-950">{selectedTicket.requester}</p>
                  <p className="text-sm text-slate-600">{selectedTicket.department}</p>
                </div>

                {selectedTicket.kind === "hr" ? (
                  <>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                      <p className="text-sm font-medium text-slate-500">Employee Submitted Details</p>
                      <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
                        <div>
                          <p className="text-slate-500">Employee ID</p>
                          <p className="mt-1 font-mono text-slate-950">{selectedTicket.raw.employee_id}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Employee Name</p>
                          <p className="mt-1 text-slate-950">{selectedTicket.raw.employee_name}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Designation</p>
                          <p className="mt-1 text-slate-950">{selectedTicket.raw.designation}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Reporting To</p>
                          <p className="mt-1 text-slate-950">{selectedTicket.raw.reporting_to}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Mobile Number</p>
                          <p className="mt-1 text-slate-950">{selectedTicket.raw.mobile_number}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Location</p>
                          <p className="mt-1 text-slate-950">{selectedTicket.raw.location}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">
                            {selectedTicket.raw.query_type === "exit_employee" ? "DOE" : "DOJ"}
                          </p>
                          <p className="mt-1 text-slate-950">{selectedTicket.raw.doe}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">
                            {selectedTicket.raw.query_type === "exit_employee"
                              ? "Handover Asset"
                              : "Assignment Requirement"}
                          </p>
                          <p className="mt-1 text-slate-950">
                            {selectedTicket.raw.query_type === "exit_employee"
                              ? selectedTicket.raw.handover_asset
                              : selectedTicket.raw.assign_requirement}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hr-email">E-mail ID</Label>
                      <Input
                        id="hr-email"
                        value={adminForm.email}
                        onChange={(event) =>
                          setAdminForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        className={inputClassName}
                        placeholder="Enter e-mail ID"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hr-laptop">Laptop Asset Number</Label>
                      <Input
                        id="hr-laptop"
                        value={adminForm.laptop}
                        onChange={(event) =>
                          setAdminForm((current) => ({
                            ...current,
                            laptop: event.target.value,
                          }))
                        }
                        className={inputClassName}
                        placeholder="Enter laptop asset number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hr-phone">Phone Number</Label>
                      <Input
                        id="hr-phone"
                        value={adminForm.phone}
                        onChange={(event) =>
                          setAdminForm((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))
                        }
                        className={inputClassName}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hr-sim">SIM Number</Label>
                      <Input
                        id="hr-sim"
                        value={adminForm.sim}
                        onChange={(event) =>
                          setAdminForm((current) => ({
                            ...current,
                            sim: event.target.value,
                          }))
                        }
                        className={inputClassName}
                        placeholder="Enter SIM number"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="ticket_assignee">Assignee</Label>
                      <Input
                        id="ticket_assignee"
                        value={adminForm.assignee}
                        onChange={(event) =>
                          setAdminForm((current) => ({
                            ...current,
                            assignee: event.target.value,
                          }))
                        }
                        className={inputClassName}
                        placeholder="Admin or support owner"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="ticket_notes">Resolution Notes</Label>
                      <Textarea
                        id="ticket_notes"
                        rows={4}
                        value={adminForm.resolution_notes}
                        onChange={(event) =>
                          setAdminForm((current) => ({
                            ...current,
                            resolution_notes: event.target.value,
                          }))
                        }
                        className={inputClassName}
                        placeholder="Add progress or resolution notes"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2 md:col-span-2">
                  <Label>Status *</Label>
                  <Select
                    value={adminForm.status}
                    onValueChange={(value) =>
                      setAdminForm((current) => ({
                        ...current,
                        status: value as HrRequestStatus,
                      }))
                    }
                  >
                    <SelectTrigger className={inputClassName}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedTicket.kind === "hr" ? (
                        selectedTicket.raw.query_type === "exit_employee" ? (
                          <>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="progress">Progress</SelectItem>
                            <SelectItem value="collected">Collected</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="progress">Progress</SelectItem>
                            <SelectItem value="assigned">Assigned</SelectItem>
                          </>
                        )
                      ) : (
                        <>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-lg font-semibold text-slate-950">Ticket Summary</h3>
                <div className="mt-4 space-y-4 text-sm">
                  <div>
                    <p className="text-slate-500">Current Status</p>
                    <Badge className={`mt-2 ${statusClasses[adminForm.status]}`}>
                      {hrStatusLabels[adminForm.status]}
                    </Badge>
                  </div>

                  {selectedTicket.kind === "hr" ? (
                    <>
                      <div>
                        <p className="text-slate-500">Request Type</p>
                        <p className="mt-1 text-slate-950">{hrQueryLabels[selectedTicket.raw.query_type]}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Requested Assets</p>
                        <p className="mt-1 text-slate-950">
                          {selectedHrAssets.length > 0 ? selectedHrAssets.join(", ") : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Admin Provisioning Details</p>
                        <div className="mt-1 space-y-1 text-slate-950">
                          {adminForm.email ? <p>E-Mail: {adminForm.email}</p> : null}
                          {adminForm.laptop ? <p>Laptop: {adminForm.laptop}</p> : null}
                          {adminForm.phone ? <p>Phone: {adminForm.phone}</p> : null}
                          {adminForm.sim ? <p>SIM: {adminForm.sim}</p> : null}
                          {!adminForm.email &&
                          !adminForm.laptop &&
                          !adminForm.phone &&
                          !adminForm.sim ? (
                            <p>-</p>
                          ) : null}
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-500">Last Updated</p>
                        <p className="mt-1 text-slate-950">
                          {format(new Date(selectedTicket.raw.updated_at), "dd MMM yyyy, p")}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-slate-500">Issue</p>
                        <p className="mt-1 text-slate-950">{selectedTicket.raw.title}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Description</p>
                        <p className="mt-1 whitespace-pre-wrap text-slate-950">
                          {selectedTicket.raw.description || "-"}
                        </p>
                      </div>
                    </>
                  )}

                  <div className="space-y-2 border-t border-slate-200 pt-4">
                    {error ? (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                      </div>
                    ) : null}
                    {successMessage ? (
                      <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                        {successMessage}
                      </div>
                    ) : null}
                    <Button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-[#38bdf8] text-slate-950 hover:bg-[#0ea5e9]"
                    >
                      {saving ? "Saving..." : "Save Update"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
