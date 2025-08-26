import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, User, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import UserDetailModal from "@/components/modals/UserDetailModal";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["/api/v1/admin/users", page, limit, { role: roleFilter === "all" ? "" : roleFilter, status: statusFilter === "all" ? "" : statusFilter }],
    queryFn: () => api.getUsers(page, limit, { role: roleFilter === "all" ? "" : roleFilter, status: statusFilter === "all" ? "" : statusFilter }),
  });

  // Update page title
  useEffect(() => {
    const titleElement = document.querySelector('[data-testid="page-title"]');
    if (titleElement) {
      titleElement.textContent = "User Management";
    }
  }, []);

  const users = data?.users || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const getStatusBadge = (user: any) => {
    if (user.isSuspended) {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    if (user.isActive) {
      return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400">Active</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      worker: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400",
      employer: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400",
      admin: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400",
    };
    
    return (
      <Badge className={colors[role as keyof typeof colors] || "bg-muted text-muted-foreground"}>
        {role}
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
            <h3 className="text-lg font-semibold text-foreground">User Management</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64"
                  data-testid="input-search-users"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40" data-testid="select-role-filter">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="employer">Employers</SelectItem>
                  <SelectItem value="worker">workers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40" data-testid="select-status-filter">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Users Table */}
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
              {users.map((user: any) => (
                <TableRow key={user.id} className="hover:bg-muted/50" data-testid={`row-user-${user.id}`}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-foreground" data-testid={`text-username-${user.id}`}>
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.username}
                        </div>
                        <div className="text-sm text-muted-foreground" data-testid={`text-email-${user.id}`}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user)}
                  </TableCell>
                  <TableCell>
                    {user.is_Verified ? (
                      <CheckCircle className="h-5 w-5 text-green-500" data-testid={`icon-verified-${user.id}`} />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" data-testid={`icon-not-verified-${user.id}`} />
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground" data-testid={`text-joined-${user.id}`}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewUser(user)}
                        className="text-primary hover:text-primary/90"
                        data-testid={`button-view-${user.id}`}
                      >
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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

      <UserDetailModal 
        user={selectedUser}
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
      />
    </>
  );
}
