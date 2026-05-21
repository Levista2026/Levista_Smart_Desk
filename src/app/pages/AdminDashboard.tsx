import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Archive,
  CheckCircle,
  Clock,
  Laptop,
  Mail,
  Ticket,
  Users,
} from "lucide-react";
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
  hrStatusLabels,
  listHrRequests,
  updateHrRequestAdmin,
  type HrRequest,
  type HrRequestStatus,
} from "../lib/hr-requests";

const surfaceClass = "border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]";
const inputClassName =
  "border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:ring-[#3ecf8e]/40";

const kpiData = [
  { title: "Total Tickets", value: "1,245", icon: Ticket, color: "from-blue-400 to-blue-600" },
  { title: "Pending", value: "147", icon: Clock, color: "from-yellow-400 to-yellow-600" },
  { title: "Completed", value: "892", icon: CheckCircle, color: "from-green-400 to-green-600" },
  { title: "Closed", value: "148", icon: Archive, color: "from-purple-400 to-purple-600" },
];

const statusClasses = {
  pending: "border-0 bg-amber-100 text-amber-700",
  in_progress: "border-0 bg-blue-100 text-blue-700",
  completed: "border-0 bg-green-100 text-green-700",
};

export function AdminDashboard() {
  const [requests, setRequests] = useState<HrRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [adminForm, setAdminForm] = useState({
    official_email: "",
    laptop_allocation: "",
    remarks: "",
    status: "pending" as HrRequestStatus,
  });

  const loadRequests = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await listHrRequests();
      setRequests(result.filter((request) => request.query_type === "new_employee"));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load admin requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId) ?? null,
    [requests, selectedRequestId],
  );

  useEffect(() => {
    if (!selectedRequest) {
      return;
    }

    setAdminForm({
      official_email: selectedRequest.official_email ?? "",
      laptop_allocation: selectedRequest.laptop_allocation ?? "",
      remarks: selectedRequest.remarks,
      status: selectedRequest.status,
    });
  }, [selectedRequest]);

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedRequest) {
      setError("Please choose a request to update.");
      return;
    }

    if (!adminForm.official_email || !adminForm.laptop_allocation || !adminForm.remarks) {
      setError("Official e-mail, laptop allocation, remarks, and status are all mandatory.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      await updateHrRequestAdmin({
        id: selectedRequest.id,
        official_email: adminForm.official_email,
        laptop_allocation: adminForm.laptop_allocation,
        remarks: adminForm.remarks,
        status: adminForm.status,
      });

      setSuccessMessage("Request updated successfully.");
      await loadRequests();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update request.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-semibold text-slate-950">Admin Dashboard</h1>
        <p className="text-slate-600">
          Review HR onboarding requests and update e-mail, laptop allocation, and status.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className={surfaceClass}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-2 text-sm text-slate-500">{kpi.title}</p>
                  <h3 className="text-3xl font-bold text-slate-950">{kpi.value}</h3>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${kpi.color}`}>
                  <kpi.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className={surfaceClass}>
        <CardHeader>
          <CardTitle className="text-slate-950">Submitted HR Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                  <TableHead className="text-slate-600">Employee ID</TableHead>
                  <TableHead className="text-slate-600">Employee Name</TableHead>
                  <TableHead className="text-slate-600">Designation</TableHead>
                  <TableHead className="text-slate-600">Location</TableHead>
                  <TableHead className="text-slate-600">Assigned Requirement</TableHead>
                  <TableHead className="text-slate-600">Status</TableHead>
                  <TableHead className="text-slate-600">Created Date</TableHead>
                  <TableHead className="text-slate-600">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className="border-slate-200">
                    <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                      Loading requests...
                    </TableCell>
                  </TableRow>
                ) : requests.length === 0 ? (
                  <TableRow className="border-slate-200">
                    <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                      No HR requests submitted yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id} className="border-slate-200 hover:bg-slate-50">
                      <TableCell className="font-mono text-slate-950">{request.employee_id}</TableCell>
                      <TableCell className="text-slate-950">{request.employee_name}</TableCell>
                      <TableCell className="text-slate-600">{request.designation}</TableCell>
                      <TableCell className="text-slate-600">{request.location}</TableCell>
                      <TableCell className="text-slate-600">{request.assign_requirement}</TableCell>
                      <TableCell>
                        <Badge className={statusClasses[request.status]}>
                          {hrStatusLabels[request.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {format(new Date(request.created_at), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                          onClick={() => setSelectedRequestId(request.id)}
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

          {selectedRequest ? (
            <form onSubmit={handleUpdate} className="grid gap-6 xl:grid-cols-[1fr_360px]">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Employee</p>
                  <p className="mt-2 font-semibold text-slate-950">{selectedRequest.employee_name}</p>
                  <p className="text-sm text-slate-600">{selectedRequest.designation}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Request Details</p>
                  <p className="mt-2 text-slate-950">{selectedRequest.assign_requirement}</p>
                  <p className="text-sm text-slate-600">{selectedRequest.location}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="official_email">Official E-mail *</Label>
                  <Input
                    id="official_email"
                    value={adminForm.official_email}
                    onChange={(event) =>
                      setAdminForm((current) => ({
                        ...current,
                        official_email: event.target.value,
                      }))
                    }
                    className={inputClassName}
                    placeholder="name@levista.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="laptop_allocation">Laptop Allocation *</Label>
                  <Input
                    id="laptop_allocation"
                    value={adminForm.laptop_allocation}
                    onChange={(event) =>
                      setAdminForm((current) => ({
                        ...current,
                        laptop_allocation: event.target.value,
                      }))
                    }
                    className={inputClassName}
                    placeholder="Dell Latitude 5440 / Asset ID"
                    required
                  />
                </div>

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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="admin_remarks">Remarks *</Label>
                  <Textarea
                    id="admin_remarks"
                    rows={4}
                    value={adminForm.remarks}
                    onChange={(event) =>
                      setAdminForm((current) => ({
                        ...current,
                        remarks: event.target.value,
                      }))
                    }
                    className={inputClassName}
                    placeholder="Add admin update remarks"
                    required
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-lg font-semibold text-slate-950">Status Summary</h3>
                <div className="mt-4 space-y-4 text-sm">
                  <div>
                    <p className="text-slate-500">Current Status</p>
                    <Badge className={`mt-2 ${statusClasses[adminForm.status]}`}>
                      {hrStatusLabels[adminForm.status]}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-slate-500">Assigned Requirement</p>
                    <p className="mt-1 text-slate-950">{selectedRequest.assign_requirement}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Reporting To</p>
                    <p className="mt-1 text-slate-950">{selectedRequest.reporting_to}</p>
                  </div>
                  <div className="space-y-2 border-t border-slate-200 pt-4">
                    {error ? (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                      </div>
                    ) : null}
                    {successMessage ? (
                      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {successMessage}
                      </div>
                    ) : null}
                    <Button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-[#3ecf8e] text-slate-950 hover:bg-[#2fbe7d]"
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

      <Card className={surfaceClass}>
        <CardContent className="grid gap-4 p-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#3ecf8e]/15 text-[#15803d]">
              <Mail className="h-5 w-5" />
            </div>
            <p className="font-medium text-slate-950">Official E-mail</p>
            <p className="mt-1 text-sm text-slate-600">
              Admin updates official e-mail after request review.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#3ecf8e]/15 text-[#15803d]">
              <Laptop className="h-5 w-5" />
            </div>
            <p className="font-medium text-slate-950">Laptop Allocation</p>
            <p className="mt-1 text-sm text-slate-600">
              Device or asset details are captured here for HR visibility.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#3ecf8e]/15 text-[#15803d]">
              <Users className="h-5 w-5" />
            </div>
            <p className="font-medium text-slate-950">Shared Tracking</p>
            <p className="mt-1 text-sm text-slate-600">
              HR and Admin view the same request record and status trail.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
