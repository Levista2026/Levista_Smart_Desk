import { useParams, Link, useLocation } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Separator } from "../components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ArrowLeft, User, Calendar, Tag, MessageSquare, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

const ticketData = {
  id: "LIT-001",
  title: "Laptop battery not charging",
  description:
    "My laptop battery stopped charging yesterday. The charging light doesn't turn on when plugged in. I've tried different power outlets but the issue persists. This is affecting my ability to work remotely.",
  status: "in-progress",
  priority: "high",
  category: "Hardware",
  requester: "Mike Chen",
  department: "IT",
  assignee: "Sarah Johnson",
  createdAt: new Date(2026, 4, 20, 9, 15),
  updatedAt: new Date(2026, 4, 20, 14, 30),
};

const comments = [
  {
    id: 1,
    author: "Sarah Johnson",
    role: "IT Support",
    content: "I've checked the laptop and confirmed the battery issue. Will order a replacement.",
    createdAt: new Date(2026, 4, 20, 10, 30),
  },
  {
    id: 2,
    author: "Mike Chen",
    role: "Employee",
    content: "Thanks for the quick response! When can I expect the replacement?",
    createdAt: new Date(2026, 4, 20, 14, 15),
  },
  {
    id: 3,
    author: "Sarah Johnson",
    role: "IT Support",
    content:
      "The replacement battery should arrive by tomorrow. I'll install it as soon as it arrives.",
    createdAt: new Date(2026, 4, 21, 9, 0),
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

export function TicketDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const [newComment, setNewComment] = useState("");
  const [status, setStatus] = useState(ticketData.status);
  const [priority, setPriority] = useState(ticketData.priority);

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={`${isAdmin ? "/admin" : "/hr"}/tickets`}
          className="mb-4 inline-flex items-center gap-2 text-[#15803d] hover:text-[#166534]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tickets
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-semibold text-slate-950">{ticketData.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-500">{ticketData.id}</span>
              <Badge className={`${statusColors[status]} border`}>{status}</Badge>
              <Badge className={`${priorityColors[priority]} border-0`}>{priority}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-300 bg-white text-slate-900 hover:bg-slate-50">
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <CardHeader>
              <CardTitle className="text-slate-950">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-slate-600">{ticketData.description}</p>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card className="border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-950">
                <MessageSquare className="h-5 w-5" />
                Comments ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.map((comment, index) => (
                <div key={comment.id}>
                  {index > 0 && <Separator className="my-4 bg-slate-200" />}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3ecf8e]/15 text-sm font-semibold text-[#166534]">
                          {comment.author[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-950">{comment.author}</p>
                          <p className="text-xs text-slate-500">{comment.role}</p>
                        </div>
                      </div>
                      <span className="text-sm text-slate-500">
                        {format(comment.createdAt, "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p className="pl-10 text-slate-600">{comment.content}</p>
                  </div>
                </div>
              ))}

              <Separator className="my-4 bg-slate-200" />

              <div className="space-y-3">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="border-slate-300 bg-white text-slate-950 placeholder:text-slate-400"
                />
                <div className="flex gap-2">
                  <Button
                    className="bg-[#3ecf8e] text-slate-950 hover:bg-[#2fbe7d]"
                    disabled={!newComment.trim()}
                  >
                    Add Comment
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach File
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card className="border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <CardHeader>
              <CardTitle className="text-sm text-slate-950">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm text-slate-600">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="border-slate-300 bg-white text-slate-950">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-600">Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="border-slate-300 bg-white text-slate-950">
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
              <Button className="w-full bg-[#3ecf8e] text-slate-950 hover:bg-[#2fbe7d]">Save Changes</Button>
            </CardContent>
          </Card>

          {/* Details */}
          <Card className="border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <CardHeader>
              <CardTitle className="text-sm text-slate-950">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-slate-500" />
                <span className="text-slate-500">Requester:</span>
                <span className="font-medium text-slate-950">{ticketData.requester}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-slate-500" />
                <span className="text-slate-500">Assignee:</span>
                <span className="font-medium text-slate-950">{ticketData.assignee}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-slate-500" />
                <span className="text-slate-500">Category:</span>
                <span className="font-medium text-slate-950">{ticketData.category}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-slate-500" />
                <span className="text-slate-500">Department:</span>
                <span className="font-medium text-slate-950">{ticketData.department}</span>
              </div>
              <Separator className="bg-slate-200" />
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span className="text-slate-500">Created:</span>
                <span className="text-slate-950">{format(ticketData.createdAt, "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span className="text-slate-500">Updated:</span>
                <span className="text-slate-950">{format(ticketData.updatedAt, "MMM d, yyyy")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
