import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { ArrowLeft, User, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";
import { getSupportTicketById, type SupportTicket } from "../lib/admin-data";

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

export function TicketDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTicket = async () => {
      if (!id) {
        setError("Ticket ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const row = await getSupportTicketById(id);
        setTicket(row);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load ticket.");
      } finally {
        setLoading(false);
      }
    };

    void loadTicket();
  }, [id]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={`${isAdmin ? "/admin" : "/hr"}/tickets`}
          className="mb-4 inline-flex items-center gap-2 text-[#0284c7] hover:text-[#0369a1]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tickets
        </Link>
      </div>

      <Card className="border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <CardHeader>
          <CardTitle className="text-slate-950">Ticket Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">Loading ticket details...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : !ticket ? (
            <p className="text-slate-500">No ticket details found in Supabase.</p>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-slate-950">{ticket.title}</h1>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="font-mono text-slate-500">{ticket.id}</span>
                    <Badge className={`${statusColors[ticket.status] ?? "bg-slate-100 text-slate-700"} border`}>
                      {ticket.status}
                    </Badge>
                    <Badge className={`${priorityColors[ticket.priority] ?? "bg-slate-100 text-slate-700"} border-0`}>
                      {ticket.priority}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" className="border-slate-300 bg-white text-slate-900 hover:bg-slate-50">
                  Export PDF
                </Button>
              </div>

              <Separator className="bg-slate-200" />

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-slate-950">Description</h2>
                  <p className="whitespace-pre-wrap text-slate-600">
                    {ticket.description || "No description available."}
                  </p>
                </div>

                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-slate-950">Metadata</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-500">Requester:</span>
                      <span className="font-medium text-slate-950">{ticket.requester || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-500">Assignee:</span>
                      <span className="font-medium text-slate-950">{ticket.assignee || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-500">Category:</span>
                      <span className="font-medium text-slate-950">{ticket.category || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-500">Department:</span>
                      <span className="font-medium text-slate-950">{ticket.department || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-500">Created:</span>
                      <span className="text-slate-950">
                        {ticket.created_at ? format(new Date(ticket.created_at), "MMM d, yyyy") : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
