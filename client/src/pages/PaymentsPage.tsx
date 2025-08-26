import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, DollarSign, Download } from "lucide-react";

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("history");

  const limit = 10;

  const { data: paymentHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/v1/payments/history", page, limit],
    queryFn: () => api.getPaymentHistory(page, limit),
    enabled: activeTab === "history",
  });

  const { data: paymentReports, isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/v1/admin/reports/payments"],
    queryFn: () => api.getPaymentReports(),
    enabled: activeTab === "reports",
  });

  // Update page title
  useEffect(() => {
    const titleElement = document.querySelector('[data-testid="page-title"]');
    if (titleElement) {
      titleElement.textContent = "Payment Reports";
    }
  }, []);

  const payments = paymentHistory?.payments || [];
  const reports = paymentReports?.payments || [];
  const total = paymentHistory?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount));
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400",
      failed: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400",
      refunded: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400",
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || "bg-muted text-muted-foreground"}>
        {status}
      </Badge>
    );
  };

  const LoadingTable = () => (
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

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="history" data-testid="tab-payment-history">Payment History</TabsTrigger>
        <TabsTrigger value="reports" data-testid="tab-payment-reports">Reports</TabsTrigger>
      </TabsList>

      <TabsContent value="history">
        {historyLoading ? (
          <LoadingTable />
        ) : (
          <Card className="shadow-sm">
            {/* Table Header */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Payment History</h3>
                <Button variant="outline" size="sm" data-testid="button-export-payments">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            
            {/* Payment History Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Payer</TableHead>
                    <TableHead>Payee</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No payment history found
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment: any) => (
                      <TableRow key={payment.id} className="hover:bg-muted/50" data-testid={`row-payment-${payment.id}`}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-foreground" data-testid={`text-payment-id-${payment.id}`}>
                                #{payment.id.slice(-8)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-foreground" data-testid={`text-job-id-${payment.id}`}>
                            #{payment.jobId?.slice(-8) || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-foreground" data-testid={`text-payer-${payment.id}`}>
                            #{payment.payerId?.slice(-8) || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-foreground" data-testid={`text-payee-${payment.id}`}>
                            #{payment.payeeId?.slice(-8) || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-foreground" data-testid={`text-amount-${payment.id}`}>
                            {formatCurrency(payment.amount)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payment.status)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground" data-testid={`text-date-${payment.id}`}>
                          {new Date(payment.createdAt).toLocaleDateString()}
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
        )}
      </TabsContent>

      <TabsContent value="reports">
        {reportsLoading ? (
          <LoadingTable />
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Total Revenue
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-2" data-testid="stat-total-revenue">
                        {formatCurrency(reports.reduce((sum: number, p: any) => sum + Number(p.amount), 0))}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Completed Payments
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-2" data-testid="stat-completed-payments">
                        {reports.filter((p: any) => p.status === "completed").length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Pending Payments
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-2" data-testid="stat-pending-payments">
                        {reports.filter((p: any) => p.status === "pending").length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reports Table */}
            <Card className="shadow-sm">
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Payment Reports</h3>
                  <Button variant="outline" size="sm" data-testid="button-export-reports">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
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
                    {reports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No payment reports found
                        </TableCell>
                      </TableRow>
                    ) : (
                      reports.slice(0, 10).map((payment: any) => (
                        <TableRow key={payment.id} className="hover:bg-muted/50" data-testid={`row-report-${payment.id}`}>
                          <TableCell>
                            <div className="text-sm font-medium text-foreground" data-testid={`text-report-id-${payment.id}`}>
                              #{payment.id.slice(-8)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-foreground" data-testid={`text-report-amount-${payment.id}`}>
                              {formatCurrency(payment.amount)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(payment.status)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground" data-testid={`text-report-date-${payment.id}`}>
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
