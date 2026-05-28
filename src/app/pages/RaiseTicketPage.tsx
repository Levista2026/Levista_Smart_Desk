import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle, LogOut, Sparkles } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import logoImage from "../../../Logo/Logo.png";
import {
  createSupportTicket,
  listSupportTickets,
  type SupportTicket,
} from "../lib/admin-data";
import { clearStoredRole, getStoredUser, type AuthUser } from "../lib/auth";

const issueTypes = [
  "Laptop Issue",
  "System Access",
  "Email Creation",
  "Password Reset",
  "Software Installation",
  "Network Issue",
  "Hardware Issue",
  "HR Support",
  "Other",
];

const departments = [
  "IT",
  "HR",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
  "Development",
  "Design",
];

const inputClassName =
  "border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:ring-[#38bdf8]/40";

const statusClasses: Record<string, string> = {
  pending: "border-0 bg-amber-100 text-amber-700",
  in_progress: "border-0 bg-blue-100 text-blue-700",
  resolved: "border-0 bg-sky-100 text-sky-700",
  completed: "border-0 bg-sky-100 text-sky-700",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
  completed: "Resolved",
};

const priorityLabels: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const readOnlyInputClassName = `${inputClassName} bg-slate-50`;

function ticketBelongsToUser(ticket: SupportTicket, user: AuthUser) {
  return (
    ticket.email?.trim().toLowerCase() === user.email.trim().toLowerCase() ||
    ticket.employee_id?.trim().toLowerCase() === user.empId.trim().toLowerCase()
  );
}

export function RaiseTicketPage() {
  const navigate = useNavigate();
  const [authReady, setAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState("raise");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    department: "",
    mobile: "",
    email: "",
    issueType: "",
    priority: "medium",
    description: "",
  });

  useEffect(() => {
    const storedUser = getStoredUser();

    if (!storedUser || storedUser.role !== "levista") {
      navigate("/login?role=levista&redirect=%2Fraise-ticket", { replace: true });
      return;
    }

    setCurrentUser(storedUser);
    setFormData((current) => ({
      ...current,
      name: storedUser.name,
      employeeId: storedUser.empId,
      email: storedUser.email,
    }));
    setAuthReady(true);
  }, [navigate]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const loadTickets = async () => {
      setTicketsLoading(true);
      setTicketsError("");

      try {
        const rows = await listSupportTickets();
        const ownTickets = rows.filter((ticket) => ticketBelongsToUser(ticket, currentUser));
        setTickets(ownTickets);
        setSelectedTicketId((current) =>
          current && ownTickets.some((ticket) => ticket.id === current)
            ? current
            : (ownTickets[0]?.id ?? null),
        );
      } catch (loadError) {
        setTicketsError(loadError instanceof Error ? loadError.message : "Failed to load tickets.");
      } finally {
        setTicketsLoading(false);
      }
    };

    void loadTickets();
  }, [currentUser]);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) ?? null,
    [selectedTicketId, tickets],
  );

  const handleLogout = () => {
    clearStoredRole();
    navigate("/login?role=levista&redirect=%2Fraise-ticket", { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const created = await createSupportTicket({
        title: formData.issueType,
        requester: formData.name,
        category: formData.issueType,
        priority: formData.priority,
        description: formData.description,
        department: formData.department,
        employee_id: formData.employeeId,
        mobile: formData.mobile,
        email: formData.email,
      });

      setTickets((current) => [created, ...current]);
      setSelectedTicketId(created.id);
      setSuccessMessage(`Ticket ${created.id} was submitted successfully.`);
      setFormData((current) => ({
        ...current,
        issueType: "",
        priority: "medium",
        description: "",
      }));
      setActiveTab("status");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to submit ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authReady || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faf8] px-6 text-slate-900">
        <p className="text-slate-500">Checking Levista access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf8] px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-[#0284c7] transition-colors hover:text-[#0369a1]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <Button
            type="button"
            variant="outline"
            className="border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
            <div className="mb-6 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[#38bdf8]/10">
              <img src={logoImage} alt="Levista logo" className="h-10 w-10 object-contain" />
            </div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              <Sparkles className="h-4 w-4 text-[#0284c7]" />
              Levista Ticketing System
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-slate-950">
              Raise tickets and track progress in one place
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              You are signed in with Levista access. Use this workspace to submit a new support
              request and review status updates on your existing tickets.
            </p>
          </div>

          <Card className="border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <CardTitle className="text-slate-950">Logged in as</CardTitle>
              <CardDescription className="text-slate-600">
                Access verified from Supabase User Access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-slate-500">Name</p>
                <p className="mt-1 font-medium text-slate-950">{currentUser.name}</p>
              </div>
              <div>
                <p className="text-slate-500">Employee ID</p>
                <p className="mt-1 font-mono text-slate-950">{currentUser.empId}</p>
              </div>
              <div>
                <p className="text-slate-500">Email</p>
                <p className="mt-1 text-slate-950">{currentUser.email}</p>
              </div>
              <div>
                <p className="text-slate-500">Role</p>
                <Badge className="mt-2 border-0 bg-[#38bdf8]/15 text-[#0369a1]">Levista</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-6">
              <TabsList className="w-full justify-start rounded-2xl bg-slate-100 p-1 md:w-auto">
                <TabsTrigger
                  value="raise"
                  className="rounded-xl px-4 py-2 data-[state=active]:bg-white"
                >
                  Raise New Ticket
                </TabsTrigger>
                <TabsTrigger
                  value="status"
                  className="rounded-xl px-4 py-2 data-[state=active]:bg-white"
                >
                  View Ticket Status
                </TabsTrigger>
              </TabsList>

              <TabsContent value="raise">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-slate-950">Submit a support request</h2>
                  <p className="mt-2 text-slate-600">
                    Your Levista account details are pre-filled from Supabase User Access.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-900">
                        Employee Name
                      </Label>
                      <Input id="name" value={formData.name} readOnly className={readOnlyInputClassName} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employeeId" className="text-slate-900">
                        Employee ID
                      </Label>
                      <Input
                        id="employeeId"
                        value={formData.employeeId}
                        readOnly
                        className={readOnlyInputClassName}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-slate-900">
                        Department *
                      </Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => setFormData({ ...formData, department: value })}
                      >
                        <SelectTrigger id="department" className={inputClassName}>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile" className="text-slate-900">
                        Mobile Number *
                      </Label>
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        className={inputClassName}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-900">
                      Email Address
                    </Label>
                    <Input id="email" value={formData.email} readOnly className={readOnlyInputClassName} />
                  </div>

                  <div className="border-t border-slate-200 pt-5">
                    <h3 className="mb-4 text-lg font-semibold text-slate-950">Issue details</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="issueType" className="text-slate-900">
                          Issue Type *
                        </Label>
                        <Select
                          value={formData.issueType}
                          onValueChange={(value) => setFormData({ ...formData, issueType: value })}
                        >
                          <SelectTrigger id="issueType" className={inputClassName}>
                            <SelectValue placeholder="Select issue type" />
                          </SelectTrigger>
                          <SelectContent>
                            {issueTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority" className="text-slate-900">
                          Priority Level *
                        </Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(value) => setFormData({ ...formData, priority: value })}
                        >
                          <SelectTrigger id="priority" className={inputClassName}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-slate-900">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Please describe your issue in detail..."
                      rows={6}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={inputClassName}
                      required
                    />
                  </div>

                  {error ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  ) : null}

                  {successMessage && activeTab === "raise" ? (
                    <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                      {successMessage}
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-[#38bdf8] text-slate-950 hover:bg-[#0ea5e9]"
                    >
                      {submitting ? "Submitting..." : "Submit ticket"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                      onClick={() => setActiveTab("status")}
                    >
                      View my tickets
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="status" className="space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-950">Your ticket status</h2>
                    <p className="mt-2 text-slate-600">
                      Review the latest status for tickets raised with your Levista account.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                    onClick={() => setActiveTab("raise")}
                  >
                    Raise another ticket
                  </Button>
                </div>

                {successMessage ? (
                  <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                    {successMessage}
                  </div>
                ) : null}

                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                        <TableHead className="text-slate-600">Ticket No</TableHead>
                        <TableHead className="text-slate-600">Issue</TableHead>
                        <TableHead className="text-slate-600">Department</TableHead>
                        <TableHead className="text-slate-600">Priority</TableHead>
                        <TableHead className="text-slate-600">Status</TableHead>
                        <TableHead className="text-slate-600">Created Date</TableHead>
                        <TableHead className="text-slate-600">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ticketsLoading ? (
                        <TableRow className="border-slate-200">
                          <TableCell colSpan={7} className="py-8 text-center text-slate-500">
                            Loading your tickets...
                          </TableCell>
                        </TableRow>
                      ) : ticketsError ? (
                        <TableRow className="border-slate-200">
                          <TableCell colSpan={7} className="py-8 text-center text-red-600">
                            {ticketsError}
                          </TableCell>
                        </TableRow>
                      ) : tickets.length === 0 ? (
                        <TableRow className="border-slate-200">
                          <TableCell colSpan={7} className="py-8 text-center text-slate-500">
                            No tickets have been raised with this account yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        tickets.map((ticket) => (
                          <TableRow key={ticket.id} className="border-slate-200 hover:bg-slate-50">
                            <TableCell className="font-mono text-slate-950">{ticket.id}</TableCell>
                            <TableCell className="text-slate-950">{ticket.title}</TableCell>
                            <TableCell className="text-slate-600">{ticket.department}</TableCell>
                            <TableCell className="text-slate-600">
                              {priorityLabels[ticket.priority] ?? ticket.priority}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  statusClasses[ticket.status] ?? "border-0 bg-slate-100 text-slate-700"
                                }
                              >
                                {statusLabels[ticket.status] ?? ticket.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-500">
                              {ticket.created_at
                                ? format(new Date(ticket.created_at), "dd MMM yyyy")
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="outline"
                                className="border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                                onClick={() => setSelectedTicketId(ticket.id)}
                              >
                                View Status
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {selectedTicket ? (
                  <Card className="border-slate-200 bg-slate-50">
                    <CardHeader>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-slate-950">
                            Status View: {selectedTicket.title}
                          </CardTitle>
                          <CardDescription className="text-slate-600">
                            Track the latest update for ticket {selectedTicket.id}.
                          </CardDescription>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#38bdf8]/30 bg-white px-4 py-2">
                          <CheckCircle className="h-4 w-4 text-[#0284c7]" />
                          <span className="text-sm font-medium text-slate-900">
                            {statusLabels[selectedTicket.status] ?? selectedTicket.status}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-slate-500">Description</p>
                        <p className="mt-2 whitespace-pre-wrap text-slate-950">
                          {selectedTicket.description || "No description provided."}
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-slate-500">Ticket Number</p>
                          <p className="mt-1 font-mono text-slate-950">{selectedTicket.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Priority</p>
                          <p className="mt-1 text-slate-950">
                            {priorityLabels[selectedTicket.priority] ?? selectedTicket.priority}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Department</p>
                          <p className="mt-1 text-slate-950">{selectedTicket.department || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Created Date</p>
                          <p className="mt-1 text-slate-950">
                            {selectedTicket.created_at
                              ? format(new Date(selectedTicket.created_at), "dd MMM yyyy, p")
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Assignee</p>
                          <p className="mt-1 text-slate-950">{selectedTicket.assignee || "Pending assignment"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Resolution Notes</p>
                          <p className="mt-1 whitespace-pre-wrap text-slate-950">
                            {selectedTicket.resolution_notes || "No admin update yet."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
