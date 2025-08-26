import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Gavel } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DisputesPage() {
  const [page, setPage] = useState(1);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolution, setResolution] = useState("");

  const limit = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/v1/admin/disputes", page, limit],
    queryFn: () => api.getDisputes(page, limit),
  });

  // Update page title
  useEffect(() => {
    const titleElement = document.querySelector('[data-testid="page-title"]');
    if (titleElement) {
      titleElement.textContent = "Dispute Resolution";
    }
  }, []);

  const resolveMutation = useMutation({
    mutationFn: ({ disputeId, resolution }: { disputeId: string; resolution: string }) =>
      api.resolveDispute(disputeId, resolution),
    onSuccess: () => {
      toast({
        title: "Dispute Resolved",
        description: "The dispute has been successfully resolved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/disputes"] });
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
  const totalPages = Math.ceil(total / limit);

  const handleResolveDispute = (dispute: any) => {
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
    const colors = {
      pending: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400",
      resolved: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400",
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || "bg-muted text-muted-foreground"}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm">
        {/* Table Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Dispute Resolution</h3>
          </div>
        </div>
        
        {/* Disputes Table */}
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
              {disputes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No disputes found
                  </TableCell>
                </TableRow>
              ) : (
                disputes.map((dispute: any) => (
                  <TableRow key={dispute.id} className="hover:bg-muted/50" data-testid={`row-dispute-${dispute.id}`}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                          <Gavel className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-foreground" data-testid={`text-dispute-id-${dispute.id}`}>
                            #{dispute.id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-foreground" data-testid={`text-job-id-${dispute.id}`}>
                        #{dispute.jobId?.slice(-8) || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-foreground" data-testid={`text-reason-${dispute.id}`}>
                          {dispute.reason || "No reason provided"}
                        </div>
                        <div className="text-sm text-muted-foreground truncate" data-testid={`text-description-${dispute.id}`}>
                          {dispute.description || "No description"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(dispute.status)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground" data-testid={`text-created-${dispute.id}`}>
                      {new Date(dispute.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {dispute.status === "pending" ? (
                        <Button 
                          variant="outline"
                          size="sm" 
                          onClick={() => handleResolveDispute(dispute)}
                          className="text-primary hover:text-primary/90"
                          data-testid={`button-resolve-${dispute.id}`}
                        >
                          Resolve
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-muted-foreground cursor-not-allowed"
                          disabled
                        >
                          Resolved
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="bg-background px-4 py-3 flex items-center justify-between border-t sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button 
              variant="outline" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              data-testid="button-prev-mobile"
            >
              Previous
            </Button>
            <Button 
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              data-testid="button-next-mobile"
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-foreground" data-testid="text-pagination-info">
                Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to{" "}
                <span className="font-medium">{Math.min(page * limit, total)}</span> of{" "}
                <span className="font-medium">{total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md"
                  data-testid="button-prev"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {/* Page numbers */}
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="relative inline-flex items-center px-4 py-2"
                      data-testid={`button-page-${pageNum}`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md"
                  data-testid="button-next"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </Card>

      {/* Resolve Dispute Modal */}
      <Dialog open={showResolveModal} onOpenChange={setShowResolveModal}>
        <DialogContent className="max-w-md" data-testid="modal-resolve-dispute">
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
                data-testid="textarea-resolution"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={handleSubmitResolution}
                disabled={resolveMutation.isPending || !resolution.trim()}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-submit-resolution"
              >
                {resolveMutation.isPending ? "Resolving..." : "Resolve Dispute"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowResolveModal(false)}
                className="flex-1"
                data-testid="button-cancel-resolution"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
