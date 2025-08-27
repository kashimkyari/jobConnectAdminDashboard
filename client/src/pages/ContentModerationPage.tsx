import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Shield, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ModeratedContent, ContentType } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function ContentModerationPage() {
  const [page, setPage] = useState(1);
  const [selectedContent, setSelectedContent] =
    useState<ModeratedContent | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [reason, setReason] = useState("");
  const [filters, setFilters] = useState<{
    content_type?: string;
    status?: string;
  }>({});

  const limit = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["flaggedContent", page, limit, filters],
    queryFn: () => api.getFlaggedContent(page, limit, filters),
  });

  useEffect(() => {
    const titleElement = document.querySelector('[data-testid="page-title"]');
    if (titleElement) {
      titleElement.textContent = "Content Moderation";
    }
  }, []);

  const moderateMutation = useMutation({
    mutationFn: ({
      contentId,
      action,
      reason,
    }: {
      contentId: number;
      action: string;
      reason: string;
    }) => api.moderateContent(contentId, action, reason),
    onSuccess: (_data, variables) => {
      toast({
        title: "Content Moderated",
        description: `Content has been ${variables.action} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["flaggedContent"] });
      setShowActionModal(false);
      setSelectedContent(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to moderate content.",
        variant: "destructive",
      });
    },
  });

  const flaggedContent = data?.content || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 0;

  const handleModerateContent = (content: ModeratedContent) => {
    setSelectedContent(content);
    setShowActionModal(true);
  };

  const handleTakeAction = (action: string) => {
    if (!selectedContent) return;

    moderateMutation.mutate({
      contentId: selectedContent.id,
      action,
      reason,
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      pending:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400",
      approved:
        "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400",
      removed:
        "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400",
    };
    return (
      <Badge className={colors[status] || "bg-muted text-muted-foreground"}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="shadow-sm flex flex-col flex-grow">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Content Moderation
            </h3>
            <div className="flex items-center space-x-4">
              <Select
                onValueChange={(value) =>
                  setFilters((f) => ({
                    ...f,
                    content_type: value === "all" ? undefined : value,
                  }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.values(ContentType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                onValueChange={(value) =>
                  setFilters((f) => ({
                    ...f,
                    status: value === "all" ? undefined : value,
                  }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="removed">Removed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content ID</TableHead>
                <TableHead>Content Type</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flaggedContent.map((content: ModeratedContent) => (
                <TableRow key={content.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-foreground">
                          #{content.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Flag className="h-4 w-4" />
                      <span className="ml-2 text-sm text-foreground">
                        {content.content_type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-foreground">
                      {content.reporter_name || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="text-sm text-foreground truncate">
                        {content.reason}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(content.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(content.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {content.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleModerateContent(content)}
                      >
                        Review
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-background px-4 py-3 flex items-center justify-between border-t sm:px-6 mt-auto">
          <div>
            <p className="text-sm text-foreground">
              Showing{" "}
              <span className="font-medium">
                {((page - 1) * limit) + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(page * limit, total)}
              </span>{" "}
              of <span className="font-medium">{total}</span> results
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Moderate Content</DialogTitle>
          </DialogHeader>

          {selectedContent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Content ID
                  </div>
                  <p className="text-sm text-foreground">
                    #{selectedContent.id}
                  </p>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Content Type
                  </div>
                  <p className="text-sm text-foreground">
                    {selectedContent.content_type}
                  </p>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Reporter
                  </div>
                  <p className="text-sm text-foreground">
                    {selectedContent.reporter_name || "N/A"}
                  </p>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Reported
                  </div>
                  <p className="text-sm text-foreground">
                    {new Date(selectedContent.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Reason for Report
                </div>
                <p className="text-sm text-foreground p-3 bg-muted rounded-md">
                  {selectedContent.reason}
                </p>
              </div>

              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Add moderation notes..."
              />

              <div className="flex space-x-3">
                <Button
                  onClick={() => handleTakeAction("approved")}
                  disabled={moderateMutation.isPending}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => handleTakeAction("removed")}
                  disabled={moderateMutation.isPending}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  Remove
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
