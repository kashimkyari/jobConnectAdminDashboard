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
  Repeat,
  UserPlus,
  Briefcase as BriefcaseIcon,
  CheckCircle,
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
  BarElement,
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
  BarElement,
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

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["recentActivity"],
    queryFn: () => api.getRecentActivity(),
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
    {
      title: "Total Payment Volume",
      value: formatCurrency(metrics?.payments?.total_volume || 0),
      icon: DollarSign,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400",
    },
    {
      title: "Total Transactions",
      value: metrics?.payments?.transaction_count || 0,
      icon: Repeat,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
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
        borderColor: "#4FD1C5",
        backgroundColor: "rgba(79, 209, 197, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_registered":
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      case "job_created":
        return <BriefcaseIcon className="h-5 w-5 text-green-500" />;
      case "job_completed":
        return <CheckCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-base font-semibold text-foreground mb-2">
              User Growth
            </h3>
            <div className="h-56">
              {metricsLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <Line data={userGrowthData} options={chartOptions} />
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="text-base font-semibold mb-2">Recent Activity</h3>
            <div className="h-56 overflow-y-auto">
              {activityLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="space-y-4">
                  {recentActivity?.map((activity) => (
                    <li key={activity.id} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
