import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User as UserType } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function KYCPage() {
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "approved" | "rejected"
  >("approved");
  const [notes, setNotes] = useState("");

  const limit = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["pendingKYC", page, limit],
    queryFn: () => api.getPendingKYC(page, limit),
  });

  useEffect(() => {
    const titleElement = document.querySelector('[data-testid="page-title"]');
    if (titleElement) {
      titleElement.textContent = "KYC Verification";
    }
  }, []);

  const verifyMutation = useMutation({
    mutationFn: ({
      userId,
      status,
      notes,
    }: {
      userId: number;
      status: "approved" | "rejected";
      notes?: string;
    }) => api.verifyKYC(userId, status, notes),
    onSuccess: () => {
      toast({
        title: "KYC Verified",
        description: "The KYC submission has been processed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["pendingKYC"] });
      setShowVerifyModal(false);
      setNotes("");
      setSelectedUser(null);
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

  const users = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 0;

  const handleVerifyKYC = (user: UserType) => {
    setSelectedUser(user);
    setShowVerifyModal(true);
  };

  const handleSubmitVerification = () => {
    if (!selectedUser) return;

    verifyMutation.mutate({
      userId: selectedUser.id,
      status: verificationStatus,
      notes: notes.trim() || undefined,
    });
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
          <h3 className="text-lg font-semibold text-foreground">
            KYC Verification
          </h3>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: UserType) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-foreground">
                          {user.full_name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerifyKYC(user)}
                    >
                      Review
                    </Button>
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

      <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review KYC Submission</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    User Name
                  </Label>
                  <p className="text-sm text-foreground">
                    {selectedUser.full_name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    User Email
                  </Label>
                  <p className="text-sm text-foreground">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">
                  Verification Decision
                </Label>
                <Select
                  value={verificationStatus}
                  onValueChange={(value: "approved" | "rejected") =>
                    setVerificationStatus(value)
                  }
                >
                  <SelectTrigger>
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
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleSubmitVerification}
                  disabled={verifyMutation.isPending}
                  className={`flex-1 ${
                    verificationStatus === "approved"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {verifyMutation.isPending
                    ? "Processing..."
                    : `${
                        verificationStatus === "approved" ? "Approve" : "Reject"
                      } KYC`}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowVerifyModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
