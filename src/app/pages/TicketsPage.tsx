import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Search, Filter, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const allTickets = [
  {
    id: "LIT-001",
    title: "Laptop battery not charging",
    requester: "Mike Chen",
    department: "IT",
    category: "Hardware",
    status: "in-progress",
    priority: "high",
    createdAt: new Date(2026, 4, 20, 9, 15),
  },
  {
    id: "LIT-002",
    title: "Cannot access shared network drive",
    requester: "Emily Rodriguez",
    department: "Finance",
    category: "Network",
    status: "open",
    priority: "urgent",
    createdAt: new Date(2026, 4, 21, 8, 0),
  },
  {
    id: "LIT-003",
    title: "Software installation request - Adobe Photoshop",
    requester: "James Wilson",
    department: "Marketing",
    category: "Software",
    status: "open",
    priority: "medium",
    createdAt: new Date(2026, 4, 19, 11, 30),
  },
  {
    id: "LIT-004",
    title: "Email not syncing on mobile device",
    requester: "Lisa Anderson",
    department: "Sales",
    category: "Email",
    status: "resolved",
    priority: "low",
    createdAt: new Date(2026, 4, 18, 14, 20),
  },
  {
    id: "LIT-005",
    title: "Monitor flickering issue",
    requester: "Robert Taylor",
    department: "Operations",
    category: "Hardware",
    status: "in-progress",
    priority: "medium",
    createdAt: new Date(2026, 4, 17, 10, 0),
  },
  {
    id: "LIT-006",
    title: "VPN connection keeps dropping",
    requester: "Jennifer Lee",
    department: "Development",
    category: "Network",
    status: "open",
    priority: "high",
    createdAt: new Date(2026, 4, 21, 7, 45),
  },
  {
    id: "LIT-007",
    title: "Password reset request",
    requester: "Mark Thomas",
    department: "HR",
    category: "Access",
    status: "closed",
    priority: "low",
    createdAt: new Date(2026, 4, 16, 13, 10),
  },
  {
    id: "LIT-008",
    title: "Printer not responding",
    requester: "Karen Martinez",
    department: "Finance",
    category: "Hardware",
    status: "in-progress",
    priority: "medium",
    createdAt: new Date(2026, 4, 20, 15, 0),
  },
];

const statusColors = {
  open: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "in-progress": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  resolved: "bg-green-500/20 text-green-300 border-green-500/30",
  closed: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

const priorityColors = {
  low: "bg-slate-500/20 text-slate-300",
  medium: "bg-blue-500/20 text-blue-300",
  high: "bg-orange-500/20 text-orange-300",
  urgent: "bg-red-500/20 text-red-300",
};

export function TicketsPage() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredTickets = allTickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.requester.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-semibold text-slate-950">All Tickets</h1>
          <p className="text-slate-600">Manage and track support tickets</p>
        </div>
        <Button className="bg-[#3ecf8e] text-slate-950 hover:bg-[#2fbe7d]">Create Ticket</Button>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-slate-300 bg-white pl-10 text-slate-950 placeholder:text-slate-400"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full border-slate-300 bg-white text-slate-950 md:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full border-slate-300 bg-white text-slate-950 md:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Tickets Table */}
      <Card className="border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-slate-600">ID</TableHead>
                <TableHead className="text-slate-600">Title</TableHead>
                <TableHead className="text-slate-600">Requester</TableHead>
                <TableHead className="text-slate-600">Category</TableHead>
                <TableHead className="text-slate-600">Status</TableHead>
                <TableHead className="text-slate-600">Priority</TableHead>
                <TableHead className="text-slate-600">Created</TableHead>
                <TableHead className="text-slate-600"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow className="border-slate-200">
                  <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                    No tickets found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="border-slate-200 hover:bg-slate-50">
                    <TableCell className="font-mono text-slate-950">{ticket.id}</TableCell>
                    <TableCell className="max-w-xs text-slate-950">
                      <div className="line-clamp-2">{ticket.title}</div>
                    </TableCell>
                    <TableCell className="text-slate-600">{ticket.requester}</TableCell>
                    <TableCell className="text-slate-600">{ticket.category}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[ticket.status]} border`}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${priorityColors[ticket.priority]} border-0`}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {formatDistanceToNow(ticket.createdAt, { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Link to={`${isAdmin ? "/admin" : "/hr"}/tickets/${ticket.id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[#15803d] hover:bg-slate-100 hover:text-[#166534]"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
