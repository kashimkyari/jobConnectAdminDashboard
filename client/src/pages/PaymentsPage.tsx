import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentsPage() {
  const { data: reports, isLoading } = useQuery({
    queryKey: ["paymentReports"],
    queryFn: () => api.getPaymentReports(),
  });

  useEffect(() => {
    const titleElement = document.querySelector('[data-testid="page-title"]');
    if (titleElement) {
      titleElement.textContent = "Payment Reports";
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      pending:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400",
      completed:
        "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400",
      failed: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400",
    };
    return (
      <Badge className={colors[status] || "bg-muted text-muted-foreground"}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-12 w-3/4 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-1/4" />
            <div className="space-y-2 mt-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalRevenue =
    reports?.reduce((sum, p) => sum + (p.status === "completed" ? p.amount : 0), 0) ||
    0;
  const completedPayments =
    reports?.filter((p) => p.status === "completed").length || 0;
  const pendingPayments =
    reports?.filter((p) => p.status === "pending").length || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground uppercase">
              Total Revenue
            </p>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground uppercase">
              Completed Payments
            </p>
            <p className="text-2xl font-bold">{completedPayments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground uppercase">
              Pending Payments
            </p>
            <p className="text-2xl font-bold">{pendingPayments}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Payment Reports</h3>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports?.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium">#{payment.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    {new Date(payment.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
