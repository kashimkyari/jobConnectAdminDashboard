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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Gavel } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dispute } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DisputesPage() {
  const [page, setPage] = useState(1);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolution, setResolution] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const limit = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["adminDisputes", page, limit, statusFilter],
    queryFn: () => api.getDisputes(page, limit, { status: statusFilter }),
  });

  useEffect(() => {
    const titleElement = document.querySelector('[data-testid="page-title"]');
    if (titleElement) {
      titleElement.textContent = "Dispute Resolution";
    }
  }, []);

  const resolveMutation = useMutation({
    mutationFn: ({
      disputeId,
      resolution,
    }: {
      disputeId: number;
      resolution: string;
    }) => api.resolveDispute(disputeId, resolution),
    onSuccess: () => {
      toast({
        title: "Dispute Resolved",
        description: "The dispute has been successfully resolved.",
      });
      queryClient.invalidateQueries({ queryKey: ["adminDisputes"] });
      setShowResolveModal(false);
      setResolution("");
      setSelectedDispute(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to resolve dispute.",
        variant: "destructive",
      });
    },
  });

  const disputes = data?.disputes || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 0;

  const handleResolveDispute = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setShowResolveModal(true);
  };

  const handleSubmitResolution = () => {
    if (!selectedDispute || !resolution.trim()) return;

    resolveMutation.mutate({
      disputeId: selectedDispute.id,
      resolution: resolution.trim(),
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      open: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400",
      resolved:
        "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400",
      escalated:
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
              Dispute Resolution
            </h3>
            <Select
              onValueChange={(value) =>
                setStatusFilter(value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispute ID</TableHead>
                <TableHead>Job ID</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disputes.map((dispute: Dispute) => (
                <TableRow key={dispute.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Gavel className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-foreground">
                          #{dispute.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-foreground">
                      #{dispute.job_id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-foreground">
                        {dispute.reason}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(dispute.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {dispute.status === "open" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolveDispute(dispute)}
                      >
                        Resolve
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

      <Dialog open={showResolveModal} onOpenChange={setShowResolveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Resolution Message
              </Label>
              <Textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Enter your resolution message..."
                className="h-32"
              />
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleSubmitResolution}
                disabled={resolveMutation.isPending || !resolution.trim()}
                className="flex-1"
              >
                {resolveMutation.isPending
                  ? "Resolving..."
                  : "Resolve Dispute"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowResolveModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
