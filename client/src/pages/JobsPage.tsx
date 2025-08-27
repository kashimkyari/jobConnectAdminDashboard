import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
  ChevronLeft,
  ChevronRight,
  DollarSign,
  MoreVertical,
} from "lucide-react";
import { Job, JobStatus } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export default function JobsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<{
    status?: string;
    has_dispute?: boolean;
  }>({});

  const debouncedSearch = useDebounce(search, 500);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["adminJobs", page, limit, filters, debouncedSearch],
    queryFn: () =>
      api.getJobs(page, limit, { ...filters, search: debouncedSearch }),
  });

  useEffect(() => {
    const titleElement = document.querySelector('[data-testid="page-title"]');
    if (titleElement) {
      titleElement.textContent = "Job Management";
    }
  }, []);

  const jobs = data?.jobs || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 0;

  const getStatusBadge = (status: JobStatus) => {
    const colors = {
      [JobStatus.OPEN]:
        "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400",
      [JobStatus.IN_PROGRESS]:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400",
      [JobStatus.COMPLETED]:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400",
      [JobStatus.CANCELLED]:
        "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400",
      [JobStatus.DISPUTED]:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400",
    };
    return (
      <Badge className={colors[status]}>
        {status.replace("_", " ")}
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
    <Card className="shadow-sm">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Job Management
          </h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search jobs..."
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
                  status: value === "all" ? undefined : value,
                }))
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.values(JobStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() +
                      status.slice(1).replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) =>
                setFilters((f) => ({
                  ...f,
                  has_dispute:
                    value === "all"
                      ? undefined
                      : value === "true"
                      ? true
                      : false,
                }))
              }
            >
              <SelectTrigger className="w-40">
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

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job: Job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {job.title}
                    </div>
                    <div className="text-sm text-muted-foreground max-w-xs truncate">
                      {job.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-foreground">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {job.budget}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(job.status)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(job.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-background px-4 py-3 flex items-center justify-between border-t sm:px-6">
        <div>
          <p className="text-sm text-foreground">
            Showing{" "}
            <span className="font-medium">{((page - 1) * limit) + 1}</span> to{" "}
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
  );
}
