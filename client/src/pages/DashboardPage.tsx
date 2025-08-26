import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Briefcase, Gavel, DollarSign, TrendingUp, ArrowUp } from "lucide-react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/v1/admin/dashboard"],
    queryFn: () => api.getDashboardStats(),
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/v1/admin/metrics"],
    queryFn: () => api.getMetrics(),
  });

  // Update page title
  useEffect(() => {
    const titleElement = document.querySelector('[data-testid="page-title"]');
    if (titleElement) {
      titleElement.textContent = "Dashboard Overview";
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const statsCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      change: "+12%",
      icon: Users,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
      testId: "stat-total-users",
    },
    {
      title: "Active Jobs",
      value: stats?.activeJobs || 0,
      change: "+8%",
      icon: Briefcase,
      color: "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400",
      testId: "stat-active-jobs",
    },
    {
      title: "Pending Disputes",
      value: stats?.pendingDisputes || 0,
      change: "Requires attention",
      icon: Gavel,
      color: "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400",
      testId: "stat-pending-disputes",
    },
    {
      title: "Revenue (MTD)",
      value: stats?.monthlyRevenue ? formatCurrency(stats.monthlyRevenue) : "$0",
      change: "+15%",
      icon: DollarSign,
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400",
      testId: "stat-monthly-revenue",
    },
  ];

  const userGrowthData = {
    labels: metrics?.userGrowth?.map((item: any) => item.month) || [],
    datasets: [
      {
        label: "New Users",
        data: metrics?.userGrowth?.map((item: any) => item.users) || [],
        borderColor: "hsl(var(--primary))",
        backgroundColor: "hsla(var(--primary), 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const jobCompletionData = {
    labels: ["Completed", "In Progress", "Cancelled"],
    datasets: [
      {
        data: metrics?.jobCompletion ? [
          metrics.jobCompletion.completed,
          metrics.jobCompletion.inProgress,
          metrics.jobCompletion.cancelled,
        ] : [0, 0, 0],
        backgroundColor: ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  if (statsLoading || metricsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      {stat.title}
                    </p>
                    <p 
                      className="text-3xl font-bold text-foreground mt-2" 
                      data-testid={stat.testId}
                    >
                      {stat.value}
                    </p>
                    <p className="text-sm text-green-600 mt-2">
                      {stat.change.includes("+") && <ArrowUp className="inline h-3 w-3 mr-1" />}
                      <span>{stat.change}</span> from last month
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">User Growth</h3>
              <select className="text-sm border rounded-md px-3 py-1 bg-background text-foreground">
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Last 6 months</option>
              </select>
            </div>
            <div className="h-64" data-testid="chart-user-growth">
              <Line data={userGrowthData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Job Completion Rate</h3>
              <select className="text-sm border rounded-md px-3 py-1 bg-background text-foreground">
                <option>This month</option>
                <option>Last month</option>
                <option>Last quarter</option>
              </select>
            </div>
            <div className="h-64" data-testid="chart-job-completion">
              <Doughnut data={jobCompletionData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        </div>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[
              {
                icon: "fas fa-user-plus",
                bgColor: "bg-blue-100 dark:bg-blue-900/50",
                iconColor: "text-blue-600 dark:text-blue-400",
                title: "New user registration",
                description: "John Smith registered as a worker",
                time: "2 minutes ago",
              },
              {
                icon: "fas fa-briefcase",
                bgColor: "bg-green-100 dark:bg-green-900/50",
                iconColor: "text-green-600 dark:text-green-400",
                title: "Job completed",
                description: "Web Development project marked as completed",
                time: "15 minutes ago",
              },
              {
                icon: "fas fa-exclamation-triangle",
                bgColor: "bg-orange-100 dark:bg-orange-900/50",
                iconColor: "text-orange-600 dark:text-orange-400",
                title: "Dispute reported",
                description: "Payment dispute for project #1234",
                time: "1 hour ago",
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-center py-3 border-b last:border-b-0">
                <div className={`w-10 h-10 ${activity.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <TrendingUp className={`h-4 w-4 ${activity.iconColor}`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
