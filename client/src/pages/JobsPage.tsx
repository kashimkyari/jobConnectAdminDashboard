import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ChevronLeft, ChevronRight, DollarSign } from "lucide-react";

export default function JobsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [disputeFilter, setDisputeFilter] = useState("all");

  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["/api/v1/admin/jobs", page, limit, { status: statusFilter === "all" ? "" : statusFilter, hasDispute: disputeFilter === "true" ? true : disputeFilter === "false" ? false : undefined }],
    queryFn: () => api.getJobs(page, limit, { status: statusFilter === "all" ? "" : statusFilter, hasDispute: disputeFilter === "true" ? true : disputeFilter === "false" ? false : undefined }),
  });

  // Update page title
  useEffect(() => {
    const titleElement = document.querySelector('[data-testid="page-title"]');
    if (titleElement) {
      titleElement.textContent = "Job Management";
    }
  }, []);

  const jobs = data?.jobs || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: "bg-muted text-muted-foreground",
      active: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400",
      in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400",
      completed: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400",
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || "bg-muted text-muted-foreground"}>
        {status.replace('_', ' ')}
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
    <Card className="shadow-sm">
      {/* Table Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Job Management</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-64"
                data-testid="input-search-jobs"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={disputeFilter} onValueChange={setDisputeFilter}>
              <SelectTrigger className="w-40" data-testid="select-dispute-filter">
                <SelectValue placeholder="All Jobs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                <SelectItem value="true">With Disputes</SelectItem>
                <SelectItem value="false">Without Disputes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Jobs Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Has Dispute</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
            <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No jobs found
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job: any) => (
                <TableRow key={job.id} className="hover:bg-muted/50" data-testid={`row-job-${job.id}`}>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium text-foreground" data-testid={`text-job-title-${job.id}`}>
                        {job.title || "Untitled Job"}
                      </div>
                      <div className="text-sm text-muted-foreground max-w-xs truncate" data-testid={`text-job-description-${job.id}`}>
                        {job.description || "No description"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-foreground" data-testid={`text-job-budget-${job.id}`}>
                      <DollarSign className="h-4 w-4 mr-1" />
                      {job.budget ? `$${job.budget}` : "Not specified"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(job.status)}
                  </TableCell>
                  <TableCell>
                    {job.hasDispute ? (
                      <Badge variant="destructive">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground" data-testid={`text-job-created-${job.id}`}>
                    {new Date(job.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary hover:text-primary/90"
                      data-testid={`button-view-job-${job.id}`}
                    >
                      View Details
                    </Button>
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
  );
}
