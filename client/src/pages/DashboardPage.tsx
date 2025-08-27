import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/contexts/ThemeContext";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Briefcase,
  Gavel,
  DollarSign,
  TrendingUp,
  UserCheck,
  FileText,
  Activity,
} from "lucide-react";
import { Line } from "react-chartjs-2";
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
import { Skeleton } from "@/components/ui/skeleton";

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
  const { theme } = useTheme();
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30))
      .toLocaleDateString("en-GB")
      .split("/")
      .join("/"),
    end: new Date().toLocaleDateString("en-GB").split("/").join("/"),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: () => api.getDashboardStats(),
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["platformMetrics", dateRange],
    queryFn: () => api.getPlatformMetrics(dateRange.start, dateRange.end),
  });

  useEffect(() => {
    const titleElement = document.querySelector('[data-testid="page-title"]');
    if (titleElement) {
      titleElement.textContent = "Dashboard Overview";
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const statsCards = [
    {
      title: "Total Users",
      value: stats?.total_users || 0,
      icon: Users,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
    },
    {
      title: "Active Jobs",
      value: stats?.active_jobs || 0,
      icon: Briefcase,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400",
    },
    {
      title: "Open Disputes",
      value: stats?.open_disputes || 0,
      icon: Gavel,
      color:
        "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400",
    },
    {
      title: "Platform Earnings",
      value: formatCurrency(stats?.platform_earnings || 0),
      icon: DollarSign,
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400",
    },
    {
      title: "Pending Verifications",
      value: stats?.pending_verifications || 0,
      icon: UserCheck,
      color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400",
    },
    {
      title: "Job Completion Rate",
      value: `${(stats?.job_completion_rate || 0).toFixed(2)}%`,
      icon: FileText,
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400",
    },
    {
      title: "User Growth Rate",
      value: `${(stats?.user_growth_rate || 0).toFixed(2)}%`,
      icon: TrendingUp,
      color: "bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-400",
    },
    {
      title: "Active Users (7d)",
      value: stats?.active_users_last_7_days || 0,
      icon: Activity,
      color: "bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400",
    },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        labels: {
          color: theme === "dark" ? "#fff" : "#000",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: theme === "dark" ? "#fff" : "#000",
        },
        grid: {
          color: theme === "dark" ? "#444" : "#ddd",
        },
      },
      x: {
        ticks: {
          color: theme === "dark" ? "#fff" : "#000",
        },
        grid: {
          color: theme === "dark" ? "#444" : "#ddd",
        },
      },
    },
  };

  const userGrowthData = {
    labels: metrics?.user_growth?.daily_growth?.map((item) =>
      new Date(item.date).toLocaleDateString()
    ),
    datasets: [
      {
        label: "New Users",
        data: metrics?.user_growth?.daily_growth?.map((item) => item.count),
        borderColor: "hsl(var(--primary))",
        backgroundColor: "hsla(var(--primary), 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-12 w-3/4 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              User Growth
            </h3>
            <div className="h-64">
              {metricsLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <Line data={userGrowthData} options={chartOptions} />
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Job Completion Rate</h3>
            <div className="h-64 flex items-center justify-center">
              <p className="text-4xl font-bold">
                {metrics?.jobs?.completion_rate !== undefined
                  ? `${(metrics.jobs.completion_rate * 100).toFixed(2)}%`
                  : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Total Payment Volume
            </h3>
            <div className="h-64 flex items-center justify-center">
              <p className="text-4xl font-bold">
                {metrics?.payments?.total_volume !== undefined
                  ? `$${metrics.payments.total_volume.toFixed(2)}`
                  : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Total Transactions</h3>
            <div className="h-64 flex items-center justify-center">
              <p className="text-4xl font-bold">
                {metrics?.payments?.transaction_count ?? "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
