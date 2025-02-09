"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FileIcon, FolderIcon, HardDriveIcon, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function formatBytes(bytes: number) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

// Custom axis components with default parameters instead of defaultProps
const CustomXAxis = ({
  tick = { fontSize: 12 },
  tickLine = { stroke: "hsl(var(--border))" },
  axisLine = { stroke: "hsl(var(--border))" },
  ...props
}) => <XAxis tick={tick} tickLine={tickLine} axisLine={axisLine} {...props} />;

const CustomYAxis = ({
  tick = { fontSize: 12 },
  tickLine = { stroke: "hsl(var(--border))" },
  axisLine = { stroke: "hsl(var(--border))" },
  ...props
}) => <YAxis tick={tick} tickLine={tickLine} axisLine={axisLine} {...props} />;

interface Statistics {
  totalFiles: number;
  totalFolders: number;
  totalStorage: number;
  storageLimit: number;
  storageUsagePercentage: number;
  fileTypes: Record<string, number>;
  userStorage: Record<string, number>;
  activeUsers: number;
}

export default function StatisticsPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [storageData, setStorageData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Récupérer les statistiques générales
      const statsResponse = await fetch("/api/statistics", {
        cache: "force-cache",
      });
      if (!statsResponse.ok) {
        const data = await statsResponse.json();
        throw new Error(
          data.error || "Erreur lors de la récupération des statistiques"
        );
      }
      const statsData = await statsResponse.json();
      setStatistics(statsData);

      // Récupérer les données de stockage
      const storageResponse = await fetch("/api/storage/chart", {
        cache: "force-cache",
      });
      if (!storageResponse.ok) {
        const data = await storageResponse.json();
        throw new Error(
          data.error || "Erreur lors de la récupération des données de stockage"
        );
      }
      const storageData = await storageResponse.json();
      setStorageData(storageData);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Une erreur est survenue";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-destructive">
          <p>{error}</p>
          <Button variant="outline" onClick={fetchData} className="mt-4">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Aucune donnée disponible</p>
      </div>
    );
  }

  // Prepare data for file types chart
  const fileTypesData = Object.entries(statistics.fileTypes).map(
    ([type, count]) => ({
      name: type.split("/")[1]?.toUpperCase() || type.toUpperCase(),
      value: count,
    })
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Statistiques</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Fichiers
            </CardTitle>
            <FileIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalFiles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Dossiers
            </CardTitle>
            <FolderIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalFolders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Stockage Utilisé
            </CardTitle>
            <HardDriveIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(statistics.totalStorage)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Utilisation du stockage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Stockage utilisé</span>
                  <span className="text-muted-foreground">
                    {formatBytes(statistics.totalStorage)} sur{" "}
                    {formatBytes(statistics.storageLimit)}
                  </span>
                </div>
                <Progress value={statistics.storageUsagePercentage} />
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={storageData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <CustomXAxis
                      dataKey="month"
                      interval={0}
                      height={60}
                      angle={-45}
                      textAnchor="end"
                      scale="band"
                      padding={{ left: 0, right: 0 }}
                    />
                    <CustomYAxis
                      width={80}
                      tickFormatter={(value: number) => `${value} GB`}
                      scale="auto"
                      orientation="left"
                      type="number"
                      padding={{ top: 0, bottom: 0 }}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `${value.toFixed(2)} GB`,
                        "Stockage",
                      ]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                      cursor={{ fill: "hsl(var(--muted))" }}
                    />
                    <Bar
                      dataKey="storage"
                      fill="hsl(var(--chart-1))"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={50}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution des types de fichiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fileTypesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                    minAngle={3}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {fileTypesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
