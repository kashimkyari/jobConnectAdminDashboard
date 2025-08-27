import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/contexts/ThemeContext";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
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
} from "chart.js";
import { Skeleton } from "@/components/ui/skeleton";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function MetricsPage() {
  const { theme } = useTheme();
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30))
      .toLocaleDateString("en-GB")
      .split("/")
      .join("/"),
    end: new Date().toLocaleDateString("en-GB").split("/").join("/"),
  });

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["platformMetrics", dateRange],
    queryFn: () => api.getPlatformMetrics(dateRange.start, dateRange.end),
  });

  useEffect(() => {
    const titleElement = document.querySelector('[data-testid="page-title"]');
    if (titleElement) {
      titleElement.textContent = "Platform Metrics";
    }
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
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

  const chartData = (
    label: string,
    data: any[] | undefined,
    labelKey: string,
    valueKey: string
  ) => ({
    labels: data?.map((item) =>
      new Date(item[labelKey]).toLocaleDateString()
    ),
    datasets: [
      {
        label,
        data: data?.map((item) => item[valueKey]),
        borderColor: "hsl(var(--primary))",
        backgroundColor: "hsla(var(--primary), 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-64 w-full mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">User Growth</h3>
          <div className="h-64">
            <Line
              data={chartData(
                "New Users",
                metrics?.user_growth?.daily_growth,
                "date",
                "count"
              )}
              options={chartOptions}
            />
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
          <h3 className="text-lg font-semibold mb-4">Total Payment Volume</h3>
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
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Total Messages</h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-4xl font-bold">
              {metrics?.engagement?.message_count ?? "N/A"}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Total Reviews</h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-4xl font-bold">
              {metrics?.engagement?.review_count ?? "N/A"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
