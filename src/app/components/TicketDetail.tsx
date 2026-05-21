import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { User, Calendar, Tag, MessageSquare, X } from "lucide-react";
import { format } from "date-fns";
import { Ticket, TicketStatus, TicketPriority } from "./TicketList";
import { useState } from "react";

interface TicketDetailProps {
  ticket: Ticket;
  onClose: () => void;
  onUpdateStatus: (ticketId: string, status: TicketStatus) => void;
  onUpdatePriority: (ticketId: string, priority: TicketPriority) => void;
  onAddComment: (ticketId: string, comment: string) => void;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
}

const mockComments: Record<string, Comment[]> = {
  "LIT-001": [
    {
      id: "c1",
      author: "Sarah Johnson",
      content: "I've checked the laptop and confirmed the battery issue. Will order a replacement.",
      createdAt: new Date(2026, 4, 20, 10, 30),
    },
    {
      id: "c2",
      author: "Mike Chen",
      content: "Thanks for the quick response! When can I expect the replacement?",
      createdAt: new Date(2026, 4, 20, 14, 15),
    },
  ],
  "LIT-002": [
    {
      id: "c3",
      author: "David Kim",
      content: "Reset the password and sent instructions via email.",
      createdAt: new Date(2026, 4, 21, 9, 0),
    },
  ],
};

export function TicketDetail({
  ticket,
  onClose,
  onUpdateStatus,
  onUpdatePriority,
  onAddComment,
}: TicketDetailProps) {
  const [newComment, setNewComment] = useState("");
  const comments = mockComments[ticket.id] || [];

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(ticket.id, newComment);
      setNewComment("");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-muted-foreground">{ticket.id}</span>
            <Badge variant="secondary">
              {ticket.status}
            </Badge>
            <Badge variant="outline">
              {ticket.priority}
            </Badge>
          </div>
          <h2 className="text-2xl font-semibold">{ticket.title}</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={ticket.status}
                  onValueChange={(value) => onUpdateStatus(ticket.id, value as TicketStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={ticket.priority}
                  onValueChange={(value) => onUpdatePriority(ticket.id, value as TicketPriority)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Requester:</span>
                <span className="text-sm">{ticket.requester}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Assignee:</span>
                <span className="text-sm">{ticket.assignee || "Unassigned"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Category:</span>
                <span className="text-sm">{ticket.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Created:</span>
                <span className="text-sm">{format(ticket.createdAt, "MMM d, yyyy 'at' h:mm a")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Updated:</span>
                <span className="text-sm">{format(ticket.updatedAt, "MMM d, yyyy 'at' h:mm a")}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.map((comment, index) => (
                <div key={comment.id}>
                  {index > 0 && <Separator className="mb-4" />}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{comment.author}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(comment.createdAt, "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{comment.content}</p>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="space-y-3">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  Add Comment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
