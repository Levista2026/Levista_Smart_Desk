import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Check, ChevronDown } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
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
import {
  createHrRequest,
  hrQueryLabels,
  hrStatusLabels,
  listHrRequests,
  type HrAssignRequirement,
  type HrLocation,
  type HrQueryType,
  type HrRequest,
} from "../lib/hr-requests";

const surfaceClass = "border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]";
const inputClassName =
  "border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:ring-[#38bdf8]/40";

const locationOptions: HrLocation[] = ["Bangalore", "Kushal Nagar", "Warehouse"];
const assignOptions: HrAssignRequirement[] = ["E-Mail", "Laptop", "Phone", "SIM"];

const initialFormState = {
  employee_id: "",
  first_name: "",
  last_name: "",
  designation: "",
  reporting_to: "",
  mobile_number: "",
  doe: "",
  location: "",
  assign_requirements: [] as HrAssignRequirement[],
};

const statusClasses = {
  pending: "border-0 bg-amber-100 text-amber-700",
  progress: "border-0 bg-blue-100 text-blue-700",
  in_progress: "border-0 bg-blue-100 text-blue-700",
  assigned: "border-0 bg-emerald-100 text-emerald-700",
  collected: "border-0 bg-violet-100 text-violet-700",
  resolved: "border-0 bg-sky-100 text-sky-700",
  completed: "border-0 bg-sky-100 text-sky-700",
};

export function HRDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [queryType, setQueryType] = useState<HrQueryType>("new_employee");
  const [requests, setRequests] = useState<HrRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const isViewStatusPage = searchParams.get("tab") === "view-status";
  const searchQuery = searchParams.get("q")?.trim().toLowerCase() ?? "";

  const loadRequests = async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }

    setError("");

    try {
      const result = await listHrRequests();
      setRequests(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load HR requests.");
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadRequests({ silent: true });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId) ?? null,
    [requests, selectedRequestId],
  );

  const filteredRequests = useMemo(() => {
    if (!searchQuery) {
      return requests;
    }

    return requests.filter((request) => {
      const ticketNo = request.id.toLowerCase();
      const employeeId = request.employee_id.toLowerCase();
      const employeeName = request.employee_name.toLowerCase();
      return (
        ticketNo.includes(searchQuery) ||
        employeeId.includes(searchQuery) ||
        employeeName.includes(searchQuery)
      );
    });
  }, [requests, searchQuery]);

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleAssignmentToggle = (option: HrAssignRequirement) => {
    setFormData((current) => {
      const exists = current.assign_requirements.includes(option);
      return {
        ...current,
        assign_requirements: exists
          ? current.assign_requirements.filter((item) => item !== option)
          : [...current.assign_requirements, option],
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (
      !formData.employee_id ||
      !formData.first_name ||
      !formData.last_name ||
      !formData.designation ||
      !formData.reporting_to ||
      !formData.mobile_number ||
      !formData.doe ||
      !formData.location ||
      formData.assign_requirements.length === 0
    ) {
      setError("All fields are mandatory.");
      return;
    }

    setSubmitting(true);

    try {
      await createHrRequest({
        query_type: queryType,
        employee_id: formData.employee_id,
        employee_name: `${formData.first_name} ${formData.last_name}`.trim(),
        designation: formData.designation,
        reporting_to: formData.reporting_to,
        mobile_number: formData.mobile_number,
        doe: formData.doe,
        location: formData.location as HrLocation,
        assign_requirement: formData.assign_requirements.join(", "),
      });

      setFormData(initialFormState);
      setAssetPickerOpen(false);
      setSuccessMessage(`${hrQueryLabels[queryType]} request submitted successfully.`);
      await loadRequests();
      navigate("/hr?tab=view-status");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const dateLabel = queryType === "exit_employee" ? "DOE" : "DOJ";
  const assetLabel = queryType === "exit_employee" ? "Handover Asset" : "Assignment Requirement";
  const selectedAssetsLabel =
    formData.assign_requirements.length > 0
      ? formData.assign_requirements.join(", ")
      : `Select ${assetLabel.toLowerCase()}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-semibold text-slate-950">
          {isViewStatusPage ? "HR Request Status" : "HR Dashboard"}
        </h1>
        {isViewStatusPage ? (
          <p className="text-slate-600">
            Track employee onboarding and exit requests with admin progress updates.
          </p>
        ) : null}
        <p className="text-sm text-slate-500">
          Status and admin-issued asset details refresh automatically every 15 seconds.
        </p>
      </div>

      <Card className={surfaceClass}>
        <CardHeader>
          <CardTitle className="text-slate-950">
            {isViewStatusPage ? "View Status" : "HR Request Module"}
          </CardTitle>
          {isViewStatusPage ? (
            <CardDescription className="text-slate-600">
              Review submitted requests and check the latest admin updates.
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>
          {!isViewStatusPage ? (
            <div className="space-y-6">
              <div className="max-w-[260px] space-y-2">
                <div className="space-y-2">
                  <Label className="text-slate-900">Select Query</Label>
                  <Select value={queryType} onValueChange={(value) => setQueryType(value as HrQueryType)}>
                    <SelectTrigger className={inputClassName}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new_employee">{hrQueryLabels.new_employee}</SelectItem>
                      <SelectItem value="exit_employee">{hrQueryLabels.exit_employee}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(queryType === "new_employee" || queryType === "exit_employee") && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="employee_id">Employee ID *</Label>
                      <Input
                        id="employee_id"
                        value={formData.employee_id}
                        onChange={(event) => handleFieldChange("employee_id", event.target.value)}
                        className={inputClassName}
                        placeholder="EMP-1003"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(event) => handleFieldChange("first_name", event.target.value)}
                        className={inputClassName}
                        placeholder="First name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(event) => handleFieldChange("last_name", event.target.value)}
                        className={inputClassName}
                        placeholder="Last name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation *</Label>
                      <Input
                        id="designation"
                        value={formData.designation}
                        onChange={(event) => handleFieldChange("designation", event.target.value)}
                        className={inputClassName}
                        placeholder="Designation"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reporting_to">Reporting To *</Label>
                      <Input
                        id="reporting_to"
                        value={formData.reporting_to}
                        onChange={(event) => handleFieldChange("reporting_to", event.target.value)}
                        className={inputClassName}
                        placeholder="Manager name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="mobile_number">Mobile Number *</Label>
                      <Input
                        id="mobile_number"
                        value={formData.mobile_number}
                        onChange={(event) => handleFieldChange("mobile_number", event.target.value)}
                        className={inputClassName}
                        placeholder="9876543210"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doe">{dateLabel} *</Label>
                      <Input
                        id="doe"
                        type="date"
                        value={formData.doe}
                        onChange={(event) => handleFieldChange("doe", event.target.value)}
                        className={inputClassName}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Location *</Label>
                      <Select
                        value={formData.location}
                        onValueChange={(value) => handleFieldChange("location", value)}
                      >
                        <SelectTrigger className={inputClassName}>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locationOptions.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{assetLabel} *</Label>
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setAssetPickerOpen((current) => !current)}
                          className="w-full justify-between border-slate-300 bg-white text-slate-950 hover:bg-slate-50"
                        >
                          <span className="truncate">{selectedAssetsLabel}</span>
                          <ChevronDown
                            className={`h-4 w-4 text-slate-500 transition-transform ${
                              assetPickerOpen ? "rotate-180" : ""
                            }`}
                          />
                        </Button>

                        {assetPickerOpen ? (
                          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                            <div className="space-y-2">
                              {assignOptions.map((option) => (
                                <label
                                  key={option}
                                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <Checkbox
                                    checked={formData.assign_requirements.includes(option)}
                                    onCheckedChange={() => handleAssignmentToggle(option)}
                                  />
                                  <span>{option}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {formData.assign_requirements.map((option) => (
                          <span
                            key={option}
                            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
                          >
                            <Check className="h-3 w-3 text-[#0284c7]" />
                            {option}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

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
                    disabled={submitting}
                    className="bg-[#38bdf8] text-slate-950 hover:bg-[#0ea5e9]"
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </Button>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                        <TableHead className="text-slate-600">Ticket No</TableHead>
                        <TableHead className="text-slate-600">Query</TableHead>
                        <TableHead className="text-slate-600">Employee ID</TableHead>
                        <TableHead className="text-slate-600">Employee Name</TableHead>
                        <TableHead className="text-slate-600">Designation</TableHead>
                      <TableHead className="text-slate-600">Location</TableHead>
                      <TableHead className="text-slate-600">Assigned Requirement</TableHead>
                      <TableHead className="text-slate-600">Status</TableHead>
                      <TableHead className="text-slate-600">Created Date</TableHead>
                      <TableHead className="text-slate-600">View Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow className="border-slate-200">
                        <TableCell colSpan={10} className="py-8 text-center text-slate-500">
                          Loading requests...
                        </TableCell>
                      </TableRow>
                    ) : filteredRequests.length === 0 ? (
                      <TableRow className="border-slate-200">
                        <TableCell colSpan={10} className="py-8 text-center text-slate-500">
                          {searchQuery
                            ? "No HR requests match this search."
                            : "No employee requests submitted yet."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((request) => (
                        <TableRow key={request.id} className="border-slate-200 hover:bg-slate-50">
                          <TableCell className="font-mono text-slate-950">{request.id}</TableCell>
                          <TableCell className="text-slate-600">
                            {hrQueryLabels[request.query_type]}
                          </TableCell>
                          <TableCell className="font-mono text-slate-950">{request.employee_id}</TableCell>
                          <TableCell className="text-slate-950">{request.employee_name}</TableCell>
                          <TableCell className="text-slate-600">{request.designation}</TableCell>
                          <TableCell className="text-slate-600">{request.location}</TableCell>
                          <TableCell className="text-slate-600">
                            {request.query_type === "exit_employee"
                              ? request.handover_asset
                              : request.assign_requirement}
                          </TableCell>
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
                              View Status
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {selectedRequest ? (
                <Card className="border-slate-200 bg-slate-50">
                  <CardHeader>
                    <CardTitle className="text-slate-950">
                      Status View: {selectedRequest.employee_name}
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Track request progress from submission to completion.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-slate-500">Employee ID</p>
                        <p className="mt-2 font-mono text-slate-950">{selectedRequest.employee_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Employee Name</p>
                        <p className="mt-2 text-slate-950">{selectedRequest.employee_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Designation</p>
                        <p className="mt-2 text-slate-950">{selectedRequest.designation}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Reporting To</p>
                        <p className="mt-2 text-slate-950">{selectedRequest.reporting_to}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Mobile Number</p>
                        <p className="mt-2 text-slate-950">{selectedRequest.mobile_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Location</p>
                        <p className="mt-2 text-slate-950">{selectedRequest.location}</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-slate-500">Ticket No</p>
                      <p className="mt-2 font-mono text-slate-950">{selectedRequest.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Query Type</p>
                      <p className="mt-2 text-slate-950">{hrQueryLabels[selectedRequest.query_type]}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Current Status</p>
                      <Badge className={`mt-2 ${statusClasses[selectedRequest.status]}`}>
                        {hrStatusLabels[selectedRequest.status]}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">
                        {selectedRequest.query_type === "exit_employee"
                          ? "Handover Asset"
                          : "Assignment Requirement"}
                      </p>
                      <p className="mt-2 font-medium text-slate-950">
                        {selectedRequest.query_type === "exit_employee"
                          ? selectedRequest.handover_asset
                          : selectedRequest.assign_requirement}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Assigned Details</p>
                      <div className="mt-2 space-y-1 text-slate-950">
                        {selectedRequest.email ? <p>E-Mail: {selectedRequest.email}</p> : null}
                        {selectedRequest.laptop ? <p>Laptop: {selectedRequest.laptop}</p> : null}
                        {selectedRequest.phone ? <p>Phone: {selectedRequest.phone}</p> : null}
                        {selectedRequest.sim ? <p>SIM: {selectedRequest.sim}</p> : null}
                        {!selectedRequest.email &&
                        !selectedRequest.laptop &&
                        !selectedRequest.phone &&
                        !selectedRequest.sim ? (
                          <p>Pending admin update</p>
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">
                        {selectedRequest.query_type === "exit_employee" ? "DOE" : "DOJ"}
                      </p>
                      <p className="mt-2 text-slate-950">{selectedRequest.doe}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Last Updated</p>
                      <p className="mt-2 text-slate-950">
                        {format(new Date(selectedRequest.updated_at), "dd MMM yyyy, p")}
                      </p>
                    </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
