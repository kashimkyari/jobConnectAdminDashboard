import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Shield, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContentModerationPage() {
  const [page, setPage] = useState(1);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const limit = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/v1/admin/content-moderation", page, limit],
    queryFn: () => api.getFlaggedContent(page, limit),
  });

  // Update page title
  useEffect(() => {
    const titleElement = document.querySelector('[data-testid="page-title"]');
    if (titleElement) {
      titleElement.textContent = "Content Moderation";
    }
  }, []);

  const moderateMutation = useMutation({
    mutationFn: ({ contentId, action }: { contentId: string; action: "approved" | "removed" }) =>
      api.moderateContent(contentId, action),
    onSuccess: (data, variables) => {
      toast({
        title: "Content Moderated",
        description: `Content has been ${variables.action === "approved" ? "approved" : "removed"} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/content-moderation"] });
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
  const totalPages = Math.ceil(total / limit);

  const handleModerateContent = (content: any) => {
    setSelectedContent(content);
    setShowActionModal(true);
  };

  const handleTakeAction = (action: "approved" | "removed") => {
    if (!selectedContent) return;
    
    moderateMutation.mutate({
      contentId: selectedContent.id,
      action,
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400",
      approved: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400",
      removed: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400",
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || "bg-muted text-muted-foreground"}>
        {status}
      </Badge>
    );
  };

  const getContentTypeIcon = (contentType: string) => {
    return <Flag className="h-4 w-4" />;
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
            <h3 className="text-lg font-semibold text-foreground">Content Moderation</h3>
          </div>
        </div>
        
        {/* Content Table */}
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
              {flaggedContent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No flagged content found
                  </TableCell>
                </TableRow>
              ) : (
                flaggedContent.map((content: any) => (
                  <TableRow key={content.id} className="hover:bg-muted/50" data-testid={`row-content-${content.id}`}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                          <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-foreground" data-testid={`text-content-id-${content.id}`}>
                            #{content.contentId?.slice(-8) || content.id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getContentTypeIcon(content.contentType)}
                        <span className="ml-2 text-sm text-foreground" data-testid={`text-content-type-${content.id}`}>
                          {content.contentType || "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-foreground" data-testid={`text-reporter-${content.id}`}>
                        #{content.reporterId?.slice(-8) || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="text-sm text-foreground truncate" data-testid={`text-reason-${content.id}`}>
                          {content.reason || "No reason provided"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(content.status)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground" data-testid={`text-created-${content.id}`}>
                      {new Date(content.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {content.status === "pending" ? (
                        <Button 
                          variant="outline"
                          size="sm" 
                          onClick={() => handleModerateContent(content)}
                          className="text-primary hover:text-primary/90"
                          data-testid={`button-moderate-${content.id}`}
                        >
                          Review
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-muted-foreground cursor-not-allowed"
                          disabled
                        >
                          Processed
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

      {/* Moderate Content Modal */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent className="max-w-lg" data-testid="modal-moderate-content">
          <DialogHeader>
            <DialogTitle>Moderate Content</DialogTitle>
          </DialogHeader>
          
          {selectedContent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Content ID</div>
                  <p className="text-sm text-foreground">#{selectedContent.contentId?.slice(-8) || selectedContent.id.slice(-8)}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Content Type</div>
                  <p className="text-sm text-foreground">{selectedContent.contentType}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Reporter</div>
                  <p className="text-sm text-foreground">#{selectedContent.reporterId?.slice(-8)}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Reported</div>
                  <p className="text-sm text-foreground">
                    {new Date(selectedContent.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Reason for Report</div>
                <p className="text-sm text-foreground p-3 bg-muted rounded-md">
                  {selectedContent.reason || "No reason provided"}
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={() => handleTakeAction("approved")}
                  disabled={moderateMutation.isPending}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  data-testid="button-approve-content"
                >
                  {moderateMutation.isPending ? "Processing..." : "Approve Content"}
                </Button>
                <Button 
                  onClick={() => handleTakeAction("removed")}
                  disabled={moderateMutation.isPending}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  data-testid="button-remove-content"
                >
                  {moderateMutation.isPending ? "Processing..." : "Remove Content"}
                </Button>
              </div>
              
              <Button 
                variant="outline"
                onClick={() => setShowActionModal(false)}
                className="w-full"
                data-testid="button-cancel-moderation"
              >
                Cancel
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
