"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileIcon,
  FolderIcon,
  UserIcon,
  UploadIcon,
  TrashIcon,
  ShareIcon,
  PencilIcon,
  FolderPlusIcon,
  MoveIcon,
  DownloadIcon,
  ArchiveIcon,
  UndoIcon,
  FilterIcon,
} from "lucide-react";
import { format, startOfDay, subDays } from "date-fns";
import { ActionType } from "@/app/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Types pour l'historique
interface HistoryLog {
  _id: string;
  actionType: ActionType;
  targetType: "file" | "folder" | "user";
  details: string;
  metadata?: {
    path?: string;
    [key: string]: any;
  };
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
}

interface PaginationInfo {
  total: number;
  pages: number;
  current: number;
  limit: number;
}

const actionIcons: Record<ActionType, React.ElementType> = {
  upload: UploadIcon,
  delete: TrashIcon,
  share: ShareIcon,
  modify: PencilIcon,
  create_folder: FolderPlusIcon,
  move: MoveIcon,
  rename: PencilIcon,
  download: DownloadIcon,
  restore: UndoIcon,
  archive: ArchiveIcon,
};

const actionColors: Record<ActionType, string> = {
  upload: "text-blue-500",
  delete: "text-red-500",
  share: "text-purple-500",
  modify: "text-yellow-500",
  create_folder: "text-green-500",
  move: "text-orange-500",
  rename: "text-teal-500",
  download: "text-cyan-500",
  restore: "text-indigo-500",
  archive: "text-gray-500",
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<HistoryLog[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<ActionType | "all">("all");
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState<
    "all" | "today" | "week" | "month"
  >("all");

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filter !== "all") params.append("type", filter);

      // Ajouter les paramètres de date selon timeRange
      const now = new Date();
      if (timeRange === "today") {
        params.append("from", startOfDay(now).toISOString());
      } else if (timeRange === "week") {
        params.append("from", subDays(now, 7).toISOString());
      } else if (timeRange === "month") {
        params.append("from", subDays(now, 30).toISOString());
      }

      const response = await fetch(`/api/history?${params.toString()}`, {
        cache: "force-cache",
      });
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des logs");

      const data = await response.json();
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Erreur lors du chargement de l'historique");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filter, timeRange]);

  const filteredLogs = logs.filter((log) => {
    if (search && !log.details.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Activité</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher dans l'historique..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select
          value={filter}
          onValueChange={(value) => setFilter(value as ActionType | "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les activités</SelectItem>
            <SelectItem value="upload">Uploads</SelectItem>
            <SelectItem value="delete">Suppressions</SelectItem>
            <SelectItem value="share">Partages</SelectItem>
            <SelectItem value="modify">Modifications</SelectItem>
            <SelectItem value="create_folder">Création de dossiers</SelectItem>
            <SelectItem value="move">Déplacements</SelectItem>
            <SelectItem value="rename">Renommages</SelectItem>
            <SelectItem value="download">Téléchargements</SelectItem>
            <SelectItem value="restore">Restaurations</SelectItem>
            <SelectItem value="archive">Archives</SelectItem>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <FilterIcon className="mr-2 h-4 w-4" />
              Période
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTimeRange("all")}>
              Tout
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeRange("today")}>
              Aujourd'hui
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeRange("week")}>
              7 derniers jours
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeRange("month")}>
              30 derniers jours
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activités récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Aucune activité trouvée
              </div>
            ) : (
              <div className="space-y-8">
                {filteredLogs.map((log) => {
                  const IconComponent = actionIcons[log.actionType];
                  const iconColor = actionColors[log.actionType];

                  return (
                    <div key={log._id} className="flex gap-4">
                      <div className={`mt-1 ${iconColor}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {log.user.name} a{" "}
                            {log.actionType === "download"
                              ? "téléchargé"
                              : log.actionType === "share"
                                ? "partagé"
                                : log.actionType === "delete"
                                  ? "supprimé"
                                  : ""}{" "}
                            le{" "}
                            {log.targetType === "file"
                              ? "fichier"
                              : log.targetType === "folder"
                                ? "dossier"
                                : ""}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {log.details}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.createdAt), "PPpp")}
                          </span>
                          {log.targetType === "file" && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <FileIcon className="h-3 w-3" />
                              {log.metadata?.path}
                            </span>
                          )}
                          {log.targetType === "folder" && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <FolderIcon className="h-3 w-3" />
                              {log.metadata?.path}
                            </span>
                          )}
                          {log.targetType === "user" && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <UserIcon className="h-3 w-3" />
                              Utilisateur
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
