import { useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Ticket, Upload, ArrowLeft, CheckCircle, Sparkles } from "lucide-react";

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
  "border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:ring-[#3ecf8e]/40";

export function RaiseTicketPage() {
  const [submitted, setSubmitted] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f8faf8] px-6 py-12 text-slate-900">
        <div className="mx-auto flex max-w-xl items-center justify-center pt-12">
          <Card className="w-full border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <CardContent className="p-12 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#3ecf8e]/15 text-[#16a34a]">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h2 className="mb-3 text-3xl font-semibold tracking-tight text-slate-950">
                Ticket submitted
              </h2>
              <p className="mb-3 text-slate-600">
                Your request has been created successfully in Levista SmartDesk.
              </p>
              <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-[#3ecf8e]/30 bg-[#3ecf8e]/10 px-4 py-2">
                <span className="text-sm font-mono font-medium text-slate-900">
                  Ticket ID: LIT-009
                </span>
              </div>
              <p className="mb-8 text-sm text-slate-500">
                Our team will review your request and respond as soon as possible.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => setSubmitted(false)}
                  className="w-full bg-[#3ecf8e] text-slate-950 hover:bg-[#2fbe7d]"
                >
                  Submit another ticket
                </Button>
                <Link to="/" className="block">
                  <Button
                    variant="outline"
                    className="w-full border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                  >
                    Back to home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf8] px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#15803d] transition-colors hover:text-[#166534]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3ecf8e]/15 text-[#16a34a]">
              <Ticket className="h-7 w-7" />
            </div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              <Sparkles className="h-4 w-4 text-[#16a34a]" />
              Levista SmartDesk
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-slate-950">
              Raise a support ticket
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Submit IT or HR requests through the same internal workflow your teams already use.
            </p>
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">Best for staff</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  Use this form for access issues, hardware problems, HR support, or internal
                  service requests.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">Faster handling</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  Clear details help the Levista admin and HR teams prioritize and respond faster.
                </p>
              </div>
            </div>
          </div>

          <Card className="border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <CardHeader className="border-b border-slate-200 pb-6">
              <CardTitle className="text-2xl text-slate-950">Ticket information</CardTitle>
              <CardDescription className="text-slate-600">
                Please provide the details needed to route your request correctly.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-900">
                      Employee Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClassName}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeId" className="text-slate-900">
                      Employee ID *
                    </Label>
                    <Input
                      id="employeeId"
                      placeholder="EMP-001"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      className={inputClassName}
                      required
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
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@levista.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputClassName}
                    required
                  />
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

                <div className="space-y-2">
                  <Label htmlFor="attachment" className="text-slate-900">
                    Attachment (Optional)
                  </Label>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload file
                    </Button>
                    <span className="text-sm text-slate-500">Max file size: 10MB</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                  <Button
                    type="submit"
                    className="flex-1 bg-[#3ecf8e] text-slate-950 hover:bg-[#2fbe7d]"
                  >
                    Submit ticket
                  </Button>
                  <Link to="/" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
