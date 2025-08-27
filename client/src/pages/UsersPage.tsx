import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  User,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import UserDetailModal from "@/components/modals/UserDetailModal";
import SuspendUserModal from "@/components/modals/SuspendUserModal";
import { User as UserType, UserRole } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<{
    role?: UserRole;
    is_active?: boolean;
  }>({});
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  const debouncedSearch = useDebounce(search, 500);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["adminUsers", page, limit, filters, debouncedSearch],
    queryFn: () =>
      api.getUsers(page, limit, { ...filters, search: debouncedSearch }),
  });

  const suspendUserMutation = useMutation({
    mutationFn: (data: {
      userId: number;
      duration_days: number;
      reason: string;
    }) => api.suspendUser(data.userId, data),
    onSuccess: () => {
      toast({ title: "User suspended successfully" });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setShowSuspendModal(false);
    },
    onError: () => {
      toast({
        title: "Failed to suspend user",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const titleElement = document.querySelector('[data-testid="page-title"]');
    if (titleElement) {
      titleElement.textContent = "User Management";
    }
  }, []);

  const users = data?.users || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 0;

  const handleViewUser = (user: UserType) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleSuspendUser = (user: UserType) => {
    setSelectedUser(user);
    setShowSuspendModal(true);
  };

  const getStatusBadge = (user: UserType) => {
    if (!user.is_active) {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    return (
      <Badge
        variant="default"
        className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400"
      >
        Active
      </Badge>
    );
  };

  const getRoleBadge = (role: UserRole) => {
    const colors = {
      [UserRole.WORKER]:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400",
      [UserRole.EMPLOYER]:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400",
      [UserRole.ADMIN]:
        "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400",
    };
    return <Badge className={colors[role]}>{role}</Badge>;
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
              User Management
            </h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
              <Select
                onValueChange={(value) =>
                  setFilters((f) => ({
                    ...f,
                    role: value === "all" ? undefined : (value as UserRole),
                  }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {Object.values(UserRole).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                onValueChange={(value) =>
                  setFilters((f) => ({
                    ...f,
                    is_active:
                      value === "all"
                        ? undefined
                        : value === "active"
                        ? true
                        : false,
                  }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-foreground">
                          {user.full_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user)}</TableCell>
                  <TableCell>
                    {user.is_verified ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleViewUser(user)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleSuspendUser(user)}
                        >
                          Suspend User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      {selectedUser && (
        <>
          <UserDetailModal
            user={selectedUser}
            isOpen={showUserModal}
            onClose={() => setShowUserModal(false)}
          />
          <SuspendUserModal
            user={selectedUser}
            isOpen={showSuspendModal}
            onClose={() => setShowSuspendModal(false)}
          />
        </>
      )}
    </div>
  );
}
