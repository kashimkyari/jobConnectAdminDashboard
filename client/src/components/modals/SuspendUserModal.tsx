import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";

interface SuspendUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

// request body shape for frontend only (not validated here)
interface SuspendUserForm {
  duration: string;
  reason: string;
}

export default function SuspendUserModal({ user, isOpen, onClose }: SuspendUserModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SuspendUserForm>({
    defaultValues: {
      duration: "7",
      reason: "",
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async (data: SuspendUserForm) => {
      if (!user) return;
      // send request to backend
      return api.suspendUser(user.id, {
        reason: data.reason,
        duration_days: data.duration === "indefinite" ? -1 : parseInt(data.duration, 10),
      });
    },
    onSuccess: () => {
      toast({
        title: "User Suspended",
        description: "User has been successfully suspended.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/users"] });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to suspend user.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SuspendUserForm) => {
    suspendMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="modal-suspend-user">
        <DialogHeader>
          <DialogTitle>Suspend User</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Duration Selector */}
          <div>
            <Label htmlFor="duration" className="block text-sm font-medium text-foreground mb-2">
              Suspension Duration
            </Label>
            <Select 
              value={form.watch("duration")} 
              onValueChange={(value) => form.setValue("duration", value)}
            >
              <SelectTrigger data-testid="select-duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
                <SelectItem value="indefinite">Indefinite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Reason Textarea */}
          <div>
            <Label htmlFor="reason" className="block text-sm font-medium text-foreground mb-2">
              Reason
            </Label>
            <Textarea 
              {...form.register("reason")}
              placeholder="Enter reason for suspension..."
              className="h-24"
              data-testid="textarea-reason"
            />
          </div>
          
          {/* Actions */}
          <div className="flex space-x-3">
            <Button 
              type="submit" 
              disabled={suspendMutation.isPending}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              data-testid="button-submit-suspend"
            >
              {suspendMutation.isPending ? "Suspending..." : "Suspend User"}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel-suspend"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
