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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, IdCard, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function KYCPage() {
  const [page, setPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"approved" | "rejected">("approved");
  const [notes, setNotes] = useState("");

  const limit = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/v1/admin/kyc/pending", page, limit],
    queryFn: () => api.getPendingKYC(page, limit),
  });

  // Update page title
  useEffect(() => {
    const titleElement = document.querySelector('[data-testid="page-title"]');
    if (titleElement) {
      titleElement.textContent = "KYC Verification";
    }
  }, []);

  const verifyMutation = useMutation({
    mutationFn: ({ submissionId, status, notes }: { submissionId: string; status: "approved" | "rejected"; notes?: string }) =>
      api.verifyKYC(submissionId, status, notes),
    onSuccess: () => {
      toast({
        title: "KYC Verified",
        description: "The KYC submission has been processed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/kyc/pending"] });
      setShowVerifyModal(false);
      setNotes("");
      setSelectedSubmission(null);
      setVerificationStatus("approved");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process KYC submission.",
        variant: "destructive",
      });
    },
  });

  const submissions = data?.submissions || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleVerifyKYC = (submission: any) => {
    setSelectedSubmission(submission);
    setShowVerifyModal(true);
  };

  const handleSubmitVerification = () => {
    if (!selectedSubmission) return;
    
    verifyMutation.mutate({
      submissionId: selectedSubmission.id,
      status: verificationStatus,
      notes: notes.trim() || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400",
      approved: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400",
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || "bg-muted text-muted-foreground"}>
        {status}
      </Badge>
    );
  };

  const getDocumentIcon = (documentType: string) => {
    return <FileText className="h-4 w-4" />;
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
            <h3 className="text-lg font-semibold text-foreground">KYC Verification</h3>
          </div>
        </div>
        
        {/* KYC Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Submission ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No pending KYC submissions found
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((submission: any) => (
                  <TableRow key={submission.id} className="hover:bg-muted/50" data-testid={`row-kyc-${submission.id}`}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                          <IdCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-foreground" data-testid={`text-submission-id-${submission.id}`}>
                            #{submission.id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-foreground" data-testid={`text-user-id-${submission.id}`}>
                        #{submission.userId?.slice(-8) || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getDocumentIcon(submission.documentType)}
                        <span className="ml-2 text-sm text-foreground" data-testid={`text-document-type-${submission.id}`}>
                          {submission.documentType || "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(submission.status)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground" data-testid={`text-submitted-${submission.id}`}>
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {submission.status === "pending" ? (
                        <Button 
                          variant="outline"
                          size="sm" 
                          onClick={() => handleVerifyKYC(submission)}
                          className="text-primary hover:text-primary/90"
                          data-testid={`button-verify-${submission.id}`}
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

      {/* Verify KYC Modal */}
      <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
        <DialogContent className="max-w-lg" data-testid="modal-verify-kyc">
          <DialogHeader>
            <DialogTitle>Review KYC Submission</DialogTitle>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Submission ID</Label>
                  <p className="text-sm text-foreground">#{selectedSubmission.id.slice(-8)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Document Type</Label>
                  <p className="text-sm text-foreground">{selectedSubmission.documentType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                  <p className="text-sm text-foreground">#{selectedSubmission.userId?.slice(-8)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Submitted</Label>
                  <p className="text-sm text-foreground">
                    {new Date(selectedSubmission.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">
                  Verification Decision
                </Label>
                <Select value={verificationStatus} onValueChange={(value: "approved" | "rejected") => setVerificationStatus(value)}>
                  <SelectTrigger data-testid="select-verification-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approve</SelectItem>
                    <SelectItem value="rejected">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">
                  Notes (Optional)
                </Label>
                <Textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this verification..."
                  className="h-24"
                  data-testid="textarea-notes"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={handleSubmitVerification}
                  disabled={verifyMutation.isPending}
                  className={`flex-1 ${verificationStatus === "approved" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
                  data-testid="button-submit-verification"
                >
                  {verifyMutation.isPending ? "Processing..." : `${verificationStatus === "approved" ? "Approve" : "Reject"} KYC`}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowVerifyModal(false)}
                  className="flex-1"
                  data-testid="button-cancel-verification"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
