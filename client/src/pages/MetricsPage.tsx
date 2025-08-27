import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const chartData = (label: string, data: any[] | undefined) => ({
    labels: data?.map((item) => new Date(item.timestamp).toLocaleDateString()),
    datasets: [
      {
        label,
        data: data?.map((item) => item.value),
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
              data={chartData("New Users", metrics?.user_growth || [])}
              options={chartOptions}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Job Postings</h3>
          <div className="h-64">
            <Line
              data={chartData("Job Postings", metrics?.job_postings || [])}
              options={chartOptions}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Job Completions</h3>
          <div className="h-64">
            <Line
              data={chartData("Job Completions", metrics?.job_completions || [])}
              options={chartOptions}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Volume</h3>
          <div className="h-64">
            <Line
              data={chartData("Payment Volume", metrics?.payment_volume || [])}
              options={chartOptions}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Active Users</h3>
          <div className="h-64">
            <Line
              data={chartData("Active Users", metrics?.active_users || [])}
              options={chartOptions}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Disputes</h3>
          <div className="h-64">
            <Line
              data={chartData("Disputes", metrics?.disputes || [])}
              options={chartOptions}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
