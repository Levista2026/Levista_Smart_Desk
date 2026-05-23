import { useEffect, useState } from "react";
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
import { listSupportTickets, type SupportTicket } from "../lib/admin-data";

const statusColors: Record<string, string> = {
  open: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "in-progress": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  in_progress: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  resolved: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  closed: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

const priorityColors: Record<string, string> = {
  low: "bg-slate-500/20 text-slate-300",
  medium: "bg-blue-500/20 text-blue-300",
  high: "bg-orange-500/20 text-orange-300",
  urgent: "bg-red-500/20 text-red-300",
};

export function TicketsPage() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    const loadTickets = async () => {
      setLoading(true);
      setError("");

      try {
        const rows = await listSupportTickets();
        setTickets(rows);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load tickets.");
      } finally {
        setLoading(false);
      }
    };

    void loadTickets();
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch =
      ticket.title?.toLowerCase().includes(search) ||
      String(ticket.id).toLowerCase().includes(search) ||
      ticket.requester?.toLowerCase().includes(search);
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-semibold text-slate-950">All Tickets</h1>
          <p className="text-slate-600">Support tickets from Supabase</p>
        </div>
        <Button className="bg-[#38bdf8] text-slate-950 hover:bg-[#0ea5e9]">Create Ticket</Button>
      </div>

      <Card className="border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 md:flex-row">
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
              <Filter className="mr-2 h-4 w-4" />
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
              <Filter className="mr-2 h-4 w-4" />
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
              {loading ? (
                <TableRow className="border-slate-200">
                  <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                    Loading tickets...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow className="border-slate-200">
                  <TableCell colSpan={8} className="py-8 text-center text-red-600">
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredTickets.length === 0 ? (
                <TableRow className="border-slate-200">
                  <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                    No tickets found in Supabase.
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
                      <Badge className={`${statusColors[ticket.status] ?? "bg-slate-100 text-slate-700"} border`}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${priorityColors[ticket.priority] ?? "bg-slate-100 text-slate-700"} border-0`}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {ticket.created_at
                        ? formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Link to={`${isAdmin ? "/admin" : "/hr"}/tickets/${ticket.id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[#0284c7] hover:bg-slate-100 hover:text-[#0369a1]"
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
