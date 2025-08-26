import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, CheckCircle, XCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import SuspendUserModal from "./SuspendUserModal";

interface UserDetailModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserDetailModal({ user, isOpen, onClose }: UserDetailModalProps) {
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const verifyMutation = useMutation({
    mutationFn: () => api.verifyUser(user.id),
    onSuccess: () => {
      toast({
        title: "User Verified",
        description: "User has been successfully verified.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/users"] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to verify user.",
        variant: "destructive",
      });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () => api.deactivateUser(user.id),
    onSuccess: () => {
      toast({
        title: "User Deactivated",
        description: "User has been successfully deactivated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/users"] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to deactivate user.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (user: any) => {
    if (user.isSuspended) {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    if (user.isActive) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      worker: "bg-blue-100 text-blue-800",
      employer: "bg-purple-100 text-purple-800",
      admin: "bg-red-100 text-red-800",
    };
    
    return (
      <Badge className={colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {role}
      </Badge>
    );
  };

  if (!user) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl" data-testid="modal-user-detail">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-semibold text-secondary-700" data-testid="text-user-name">
                      {user.firstName && user.lastName 
                        ? `${user.first_Name} ${user.last_Name}` 
                        : user.username}
                    </h4>
                    <p className="text-secondary-500" data-testid="text-user-email">{user.email}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-secondary-500">Role:</span>
                    {getRoleBadge(user.role)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-500">Status:</span>
                    {getStatusBadge(user)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-500">Verified:</span>
                    {user.isVerified ? (
                      <CheckCircle className="h-5 w-5 text-green-500" data-testid="icon-verified" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" data-testid="icon-not-verified" />
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-500">Joined:</span>
                    <span className="text-secondary-700" data-testid="text-joined-date">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="font-semibold text-secondary-700 mb-3">Recent Activity</h5>
                <div className="space-y-2">
                  <div className="text-sm">
                    <p className="font-medium text-secondary-700">Profile Updated</p>
                    <p className="text-secondary-500">2 hours ago</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-secondary-700">Applied to Job</p>
                    <p className="text-secondary-500">1 day ago</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-secondary-700">Completed KYC</p>
                    <p className="text-secondary-500">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t flex space-x-3">
              <Button 
                onClick={() => verifyMutation.mutate()}
                disabled={verifyMutation.isPending || user.isVerified}
                className="bg-primary-500 hover:bg-primary-600"
                data-testid="button-verify"
              >
                {user.isVerified ? "Already Verified" : "Verify User"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowSuspendModal(true)}
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
                data-testid="button-suspend"
              >
                Suspend
              </Button>
              <Button 
                variant="outline"
                onClick={() => deactivateMutation.mutate()}
                disabled={deactivateMutation.isPending}
                className="border-red-500 text-red-600 hover:bg-red-50"
                data-testid="button-deactivate"
              >
                Deactivate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SuspendUserModal 
        user={user}
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
      />
    </>
  );
}
