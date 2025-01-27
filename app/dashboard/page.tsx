"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Legend,
  Bar,
} from "recharts";
import { FileIcon, FolderIcon, HardDriveIcon, UsersIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Statistics } from "@/app/types";
import { BrowserStat, LocationEntry } from "@/lib/utils";

interface LoginHistoryData {
  loginAttempts: Array<{
    date: string;
    successful: number;
    failed: number;
    total: number;
  }>;
  browserStats: Array<{
    browser: string;
    value: number;
  }>;
  locations: string[];
  locationData: Array<{
    date: string;
    [key: string]: number | string;
  }>;
  successRate: number;
  locationDiversity: number;
  verifiedDevices: number;
  securityScore: number;
  twoFactorUsage: number;
}

interface RadarDataPoint {
  subject: string;
  value: number;
}

interface SecurityData {
  subject: string;
  value: number;
}

function formatBytes(bytes: number) {
  const sizes = ["Octets", "Ko", "Mo", "Go", "To"];
  if (bytes === 0) return "0 Octet";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

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

export default function DashboardPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [storageData, setStorageData] = useState<any[]>([]);
  const [loginHistoryData, setLoginHistoryData] = useState<LoginHistoryData>({
    loginAttempts: [],
    browserStats: [],
    locations: [],
    locationData: [],
    successRate: 0,
    locationDiversity: 0,
    verifiedDevices: 0,
    securityScore: 0,
    twoFactorUsage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const COLORS = {
    light: [
      "hsl(222, 47%, 31%)", // Bleu foncé
      "hsl(143, 55%, 42%)", // Vert
      "hsl(36, 96%, 62%)", // Orange
      "hsl(334, 62%, 47%)", // Rose foncé
      "hsl(261, 44%, 48%)", // Violet
    ],
    dark: [
      "hsl(217, 91%, 60%)", // Bleu vif
      "hsl(142, 71%, 45%)", // Vert clair
      "hsl(37, 97%, 70%)", // Orange clair
      "hsl(335, 78%, 65%)", // Rose vif
      "hsl(262, 83%, 68%)", // Violet clair
    ],
  };
  // console.log(loginHistoryData);

  useEffect(() => {
    // Détecte le thème initial et les changements
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    // Observer les changements de thème
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark");
          setTheme(isDark ? "dark" : "light");
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Keep your existing fetch calls
        const [statsRes, activityRes, storageRes, loginHistoryRes] =
          await Promise.all([
            fetch("/api/statistics"),
            fetch("/api/activity/chart"),
            fetch("/api/storage/chart"),
            fetch("/api/login-history/chart"),
          ]);

        if (!statsRes.ok)
          throw new Error("Erreur lors de la récupération des statistiques");
        if (!activityRes.ok)
          throw new Error("Erreur lors de la récupération des activités");
        if (!storageRes.ok)
          throw new Error(
            "Erreur lors de la récupération des données de stockage"
          );
        if (!loginHistoryRes.ok)
          throw new Error(
            "Erreur lors de la récupération de l'historique de connexion"
          );

        const [statsData, activityData, storageData, loginHistoryData] =
          await Promise.all([
            statsRes.json(),
            activityRes.json(),
            storageRes.json(),
            loginHistoryRes.json(),
          ]);

        setStatistics(statsData);
        setActivityData(activityData);
        setStorageData(storageData);
        setLoginHistoryData(loginHistoryData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const securityData: SecurityData[] = [
    {
      subject: "Connexions réussies",
      value: loginHistoryData.successRate || 0,
    },
    {
      subject: "Géolocalisation unique",
      value: loginHistoryData.locationDiversity || 0,
    },
    {
      subject: "Appareils vérifiés",
      value: loginHistoryData.verifiedDevices || 0,
    },
    { subject: "Alertes", value: loginHistoryData.securityScore || 0 },
    {
      subject: "Authentification 2FA",
      value: loginHistoryData.twoFactorUsage || 0,
    },
  ];

  // const radarData: RadarDataPoint[] = [
  //   {
  //     subject: "Connexions réussies",
  //     value: loginHistoryData.successRate,
  //   },
  //   {
  //     subject: "Géolocalisation unique",
  //     value: loginHistoryData.locationDiversity,
  //   },
  //   {
  //     subject: "Appareils vérifiés",
  //     value: loginHistoryData.verifiedDevices,
  //   },
  //   {
  //     subject: "Alertes",
  //     value: loginHistoryData.securityScore,
  //   },
  //   {
  //     subject: "Authentification 2FA",
  //     value: loginHistoryData.twoFactorUsage,
  //   },
  // ];

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 pt-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="flex-1 p-8 pt-6">
        <p className="text-muted-foreground">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <Progress
              value={statistics.storageUsagePercentage}
              className="mt-2"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Utilisateurs Actifs
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.activeUsers || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vue d'ensemble des connexions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={loginHistoryData.loginAttempts}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="successful"
                    name="Connexions réussies"
                    fill="hsl(143, 85%, 53%)"
                    stroke="hsl(143, 85%, 53%)"
                    fillOpacity={0.3}
                  />
                  <Bar
                    dataKey="failed"
                    name="Échecs"
                    fill="hsl(346, 85%, 56%)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke="hsl(217, 91%, 60%)"
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution des navigateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={loginHistoryData.browserStats}
                    dataKey="value"
                    nameKey="browser"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    label={(entry) => entry.browser}
                  >
                    {loginHistoryData.browserStats.map(
                      (entry: BrowserStat, index: number) => (
                        <Cell
                          key={entry.browser}
                          fill={COLORS[theme][index % COLORS[theme].length]}
                        />
                      )
                    )}
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

        <Card>
          <CardHeader>
            <CardTitle>Analyse de sécurité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={securityData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
                  <Radar
                    name="Sécurité"
                    dataKey="value"
                    stroke="hsl(217, 91%, 60%)"
                    fill="hsl(217, 91%, 60%)"
                    fillOpacity={0.3}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Localisation des connexions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={loginHistoryData.locationData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  stackOffset="expand"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis dataKey="date" />
                  <YAxis
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value) =>
                      `${(Number(value) * 100).toFixed(2)}%`
                    }
                  />
                  <Legend />
                  {loginHistoryData.locations.map(
                    (location: string, index: number) => (
                      <Area
                        key={location}
                        type="monotone"
                        dataKey={location}
                        stackId="1"
                        stroke={COLORS[theme][index % COLORS[theme].length]}
                        fill={COLORS[theme][index % COLORS[theme].length]}
                        fillOpacity={0.6}
                      />
                    )
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aperçu de l'activité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={activityData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <CustomXAxis dataKey="date" />
                    <CustomYAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="uploads"
                      name="Envois"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="downloads"
                      name="Téléchargements"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">
                    Aucune donnée d'activité disponible
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Évolution du stockage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {storageData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={storageData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <CustomXAxis dataKey="month" />
                    <CustomYAxis
                      tickFormatter={(value: number) => `${value}Go`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                      formatter={(value: number) => [`${value}Go`, "Stockage"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="storage"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">
                    Aucune donnée de stockage disponible
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
