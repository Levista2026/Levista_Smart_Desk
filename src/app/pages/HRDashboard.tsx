import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useLocation, useNavigate, useSearchParams } from "react-router";
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
  "border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:ring-[#3ecf8e]/40";

const locationOptions: HrLocation[] = ["Bangalore", "Kushal Nagar", "Warehouse"];
const assignOptions: HrAssignRequirement[] = ["E-mail Creation", "Laptop Allocation"];

const initialFormState = {
  employee_id: "",
  first_name: "",
  last_name: "",
  designation: "",
  reporting_to: "",
  mobile_number: "",
  doj: "",
  location: "",
  assign_requirements: [] as HrAssignRequirement[],
  remarks: "",
};

const statusClasses = {
  pending: "border-0 bg-amber-100 text-amber-700",
  in_progress: "border-0 bg-blue-100 text-blue-700",
  completed: "border-0 bg-green-100 text-green-700",
};

export function HRDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("select-query");
  const [queryType, setQueryType] = useState<HrQueryType>("new_employee");
  const [requests, setRequests] = useState<HrRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState(initialFormState);

  const loadRequests = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await listHrRequests();
      setRequests(result.filter((request) => request.query_type === "new_employee"));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load HR requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  useEffect(() => {
    if (searchParams.get("tab") === "view-status") {
      setActiveTab("request-table");
    } else {
      setActiveTab("select-query");
    }
  }, [location.pathname, searchParams]);

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId) ?? null,
    [requests, selectedRequestId],
  );

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
      !formData.doj ||
      !formData.location ||
      formData.assign_requirements.length === 0 ||
      !formData.remarks
    ) {
      setError("All fields are mandatory.");
      return;
    }

    if (queryType !== "new_employee") {
      setError("Only New Employee requests are enabled in this module right now.");
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
        doj: formData.doj,
        location: formData.location as HrLocation,
        assign_requirement: formData.assign_requirements.join(", "),
        remarks: formData.remarks,
      });

      setFormData(initialFormState);
      setSuccessMessage("New employee request submitted successfully.");
      await loadRequests();
      setActiveTab("request-table");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(value === "request-table" ? "/hr?tab=view-status" : "/hr");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-semibold text-slate-950">HR Dashboard</h1>
        <p className="text-slate-600">
          Raise and track employee onboarding requests for admin follow-up.
        </p>
      </div>

      <Card className={surfaceClass}>
        <CardHeader>
          <CardTitle className="text-slate-950">New Employee Request Module</CardTitle>
          <CardDescription className="text-slate-600">
            Select a query, submit the request, and track the status from HR.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="gap-6">
            <TabsList className="grid w-full max-w-xl grid-cols-2 bg-slate-100">
              <TabsTrigger value="select-query" className="data-[state=active]:bg-white">
                Select Query
              </TabsTrigger>
              <TabsTrigger value="request-table" className="data-[state=active]:bg-white">
                Submitted Requests
              </TabsTrigger>
            </TabsList>

            <TabsContent value="select-query" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-[260px_1fr]">
                <div className="space-y-2">
                  <Label className="text-slate-900">Select Query</Label>
                  <Select value={queryType} onValueChange={(value) => setQueryType(value as HrQueryType)}>
                    <SelectTrigger className={inputClassName}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="it_issue">{hrQueryLabels.it_issue}</SelectItem>
                      <SelectItem value="new_employee">{hrQueryLabels.new_employee}</SelectItem>
                      <SelectItem value="exit_employee">{hrQueryLabels.exit_employee}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  {queryType === "new_employee" && (
                    <p>
                      HR can submit onboarding requests here. Admin will update official e-mail,
                      laptop allocation, and request status from the admin portal.
                    </p>
                  )}
                  {queryType === "it_issue" && (
                    <p>IT Issue flow can be added next. This module currently supports New Employee requests.</p>
                  )}
                  {queryType === "exit_employee" && (
                    <p>Exit Employee flow can be added next. This module currently supports New Employee requests.</p>
                  )}
                </div>
              </div>

              {queryType === "new_employee" && (
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
                      <Label htmlFor="doj">Date of Joining *</Label>
                      <Input
                        id="doj"
                        type="date"
                        value={formData.doj}
                        onChange={(event) => handleFieldChange("doj", event.target.value)}
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
                      <Label>Assignment Requirement *</Label>
                      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        {assignOptions.map((option) => (
                          <label key={option} className="flex items-center gap-3 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={formData.assign_requirements.includes(option)}
                              onChange={() => handleAssignmentToggle(option)}
                              className="h-4 w-4 rounded border-slate-300 text-[#16a34a] accent-[#16a34a]"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                        <p className="text-xs text-slate-500">
                          Select one or both requirements.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks *</Label>
                    <Textarea
                      id="remarks"
                      rows={4}
                      value={formData.remarks}
                      onChange={(event) => handleFieldChange("remarks", event.target.value)}
                      className={inputClassName}
                      placeholder="Add onboarding remarks"
                      required
                    />
                  </div>

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
                    disabled={submitting}
                    className="bg-[#3ecf8e] text-slate-950 hover:bg-[#2fbe7d]"
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="request-table" className="space-y-6">
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
                      <TableHead className="text-slate-600">Remarks</TableHead>
                      <TableHead className="text-slate-600">Created Date</TableHead>
                      <TableHead className="text-slate-600">View Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow className="border-slate-200">
                        <TableCell colSpan={9} className="py-8 text-center text-slate-500">
                          Loading requests...
                        </TableCell>
                      </TableRow>
                    ) : requests.length === 0 ? (
                      <TableRow className="border-slate-200">
                        <TableCell colSpan={9} className="py-8 text-center text-slate-500">
                          No employee requests submitted yet.
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
                          <TableCell className="max-w-[220px] text-slate-600">
                            <div className="truncate">{request.remarks}</div>
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
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-slate-500">Current Status</p>
                      <Badge className={`mt-2 ${statusClasses[selectedRequest.status]}`}>
                        {hrStatusLabels[selectedRequest.status]}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Assigned Requirement</p>
                      <p className="mt-2 font-medium text-slate-950">
                        {selectedRequest.assign_requirement}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Official E-mail</p>
                      <p className="mt-2 text-slate-950">
                        {selectedRequest.official_email || "Pending admin update"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Laptop Allocation</p>
                      <p className="mt-2 text-slate-950">
                        {selectedRequest.laptop_allocation || "Pending admin update"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className={surfaceClass}>
        <CardHeader>
          <CardTitle className="text-slate-950">Suggested Status Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                  <TableHead className="text-slate-600">HR Action</TableHead>
                  <TableHead className="text-slate-600">Admin Action</TableHead>
                  <TableHead className="text-slate-600">Final Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-slate-200 hover:bg-slate-50">
                  <TableCell>New Request Submitted</TableCell>
                  <TableCell>Email &amp; Laptop Assigned</TableCell>
                  <TableCell>Completed</TableCell>
                </TableRow>
                <TableRow className="border-slate-200 hover:bg-slate-50">
                  <TableCell>Request Submitted</TableCell>
                  <TableCell>Pending Approval</TableCell>
                  <TableCell>Pending</TableCell>
                </TableRow>
                <TableRow className="border-slate-200 hover:bg-slate-50">
                  <TableCell>Processing Started</TableCell>
                  <TableCell>IT Team Working</TableCell>
                  <TableCell>In Progress</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
