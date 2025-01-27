"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoreVerticalIcon,
  Search,
  FolderIcon,
  Download,
  Share2,
  Trash2,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/file-upload";
import { toast } from "sonner";
import { IFile } from "@/app/models/File";
import { Label } from "@/components/ui/label";
import { IFolder } from "@/app/models/Folder";
import Image from "next/image";
import { convertDate } from "@/lib/utils";

interface CurrentFolder {
  _id: string;
  name: string;
  path: string;
}

function formatBytes(bytes: number) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

interface FileOrFolderItemProps {
  item: IFile | IFolder;
  onFolderClick?: (folder: IFolder) => void;
  onDownload?: (file: IFile) => Promise<void>;
  onShare?: (file: IFile) => Promise<void>;
  onDelete: (item: IFile | IFolder) => Promise<void>;
}

function FileItem({
  item,
  onFolderClick,
  onDownload,
  onShare,
  onDelete,
}: FileOrFolderItemProps) {
  const isFolder = item.fileType === "folder";

  const getFileIcon = () => {
    if (isFolder) return <FolderIcon className="h-4 w-4" />;

    const fileType = (item as IFile).type?.toLowerCase();
    if (fileType?.includes("pdf")) {
      return (
        <Image
          src="/pdf.png"
          alt={item.name}
          width={40}
          height={40}
          className="h-4 w-4 text-blue-500"
        />
      ); // Icône PDF en rouge
    } else if (fileType?.includes("image")) {
      return (
        <Image
          src={(item as any).secureUrl || ""}
          alt={item.name}
          width={40}
          height={40}
          className="h-4 w-4 text-blue-500 rounded"
        />
      ); // Icône image en bleu
    } else if (fileType?.includes("word") || fileType?.includes("document")) {
      return (
        <Image
          src="/word.png"
          alt={item.name}
          width={40}
          height={40}
          className="h-4 w-4 text-blue-500"
        />
      ); // Icône Word en bleu foncé
    } else {
      return (
        <Image
          src="/text.png"
          alt={item.name}
          width={40}
          height={40}
          className="h-4 w-4 text-blue-500"
        />
      ); // Icône par défaut
    }
  };

  return (
    <TableRow
      className={isFolder ? "cursor-pointer hover:bg-accent" : ""}
      onClick={() => isFolder && onFolderClick?.(item as IFolder)}
    >
      <TableCell>
        <div className="flex items-center gap-2">
          {isFolder ? (
            <div className="flex items-center gap-2">
              <Image
                src="/folder_i.png"
                alt="folder"
                width={20}
                height={20}
                className="object-cover object-center"
              />
              <span>{item.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {getFileIcon()}
              <span>{item.name}</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        {isFolder ? "-" : formatBytes((item as IFile).size)}
      </TableCell>
      <TableCell>{convertDate(item.createdAt)}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8 p-0">
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!isFolder && (
              <>
                <DropdownMenuItem onClick={() => onDownload?.(item as IFile)}>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare?.(item as IFile)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Partager
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem
              onClick={() => onDelete(item)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function FilesPage() {
  const [files, setFiles] = useState<IFile[]>([]);
  const [currentFolder, setCurrentFolder] = useState<CurrentFolder | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "file" | "folder">("all");
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [folders, setFolders] = useState<IFolder[]>([]);
  const [breadcrumbPath, setBreadcrumbPath] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const handleBreadcrumbClick = (item: { id: string; name: string }) => {
    setCurrentFolder({ _id: item.id, name: item.name, path: `/${item.name}` });
  };

  // console.log(currentFolder?._id);

  const fetchFolders = async () => {
    try {
      const response = await fetch("/api/folders");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des dossiers");
      }
      const data = await response.json();
      setFolders(data);
    } catch (error) {
      toast.error("Erreur lors de la récupération des dossiers");
      console.error(error);
    }
  };

  const fetchFolderContents = async (folderId?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        folderId ? `/api/folders/${folderId}/contents` : "/api/folders/contents"
      );
      const data = await response.json();
      setFiles(data.files);
      setFolders(data.folders);
    } catch (error) {
      toast.error("Erreur lors du chargement du dossier");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          parentId: currentFolder?._id || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la création du dossier");
      }

      toast.success("Dossier créé avec succès");
      await fetchFolderContents(currentFolder?._id);
      // Mettre à jour la liste des dossiers
      // Vous devrez adapter cette partie selon votre gestion d'état
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    }
  };

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/files");
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des fichiers");
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des fichiers");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
    fetchFiles();
  }, []);

  const handleUploadComplete = async (data: IFile) => {
    // On attend un File, pas un IFileUpload
    setFiles((prev) => [data, ...prev]);
    toast.success("Fichier uploadé avec succès");
    setFiles((prev) => [...prev]);
    await fetchFolderContents(currentFolder?._id); // Refetch pour avoir la bonne hiérarchie
  };

  const handleDownload = async (file: IFile) => {
    try {
      // Pour les PDFs
      if (file.type?.includes("pdf")) {
        const downloadUrl = file.secureUrl.replace(
          "/upload/",
          "/upload/fl_attachment/"
        );
        window.open(downloadUrl);
        return;
      }

      // Pour les images
      if (file.type?.includes("image")) {
        window.open(file.secureUrl);
        return;
      }

      // Pour les autres types de fichiers
      const response = await fetch(`/api/files/${file._id}/download`);
      if (!response.ok) throw new Error("Erreur de téléchargement");

      const data = await response.json();
      await fetch("/api/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actionType: "download",
          targetType: "file",
          targetId: file._id,
          details: file.name,
          metadata: {
            size: file.size,
          },
        }),
      });
      window.open(data.downloadUrl);
    } catch (error) {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleShare = async (file: IFile) => {
    try {
      await fetch("/api/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actionType: "share",
          targetType: "file",
          targetId: file._id,
          details: file.name,
          metadata: {
            size: file.size,
          },
        }),
      });
      await navigator.clipboard.writeText(file.secureUrl);
      toast.success("Lien de partage copié dans le presse-papier !");
    } catch (error) {
      toast.error("Erreur lors de la copie du lien");
      console.error(error);
    }
  };

  const handleDelete = async (item: IFile | IFolder) => {
    try {
      const endpoint =
        item.fileType === "folder" ? "/api/folders" : "/api/files";
      const response = await fetch(`${endpoint}/${item._id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      await fetch("/api/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actionType: "delete",
          targetType: "file",
          targetId: item._id,
          details: item.name,
          metadata: {
            size: (item as any).size || 0,
          },
        }),
      });

      if (item.fileType === "folder") {
        setFolders((prev) => prev.filter((f) => f._id !== item._id));
      } else {
        setFiles((prev) => prev.filter((f) => f._id !== item._id));
      }

      toast.success("Supprimé avec succès");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Fichiers</h2>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => {
                    setCurrentFolder(null);
                    setBreadcrumbPath([]);
                    fetchFolderContents();
                  }}
                >
                  Accueil
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbPath.map((item, index) => (
                <BreadcrumbItem key={item.id}>
                  <BreadcrumbLink
                    onClick={() => {
                      const newPath = breadcrumbPath.slice(0, index + 1);
                      setBreadcrumbPath(newPath);
                      handleBreadcrumbClick(item);
                      fetchFolderContents(item.id);
                    }}
                  >
                    {item.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload de fichier</DialogTitle>
              </DialogHeader>
              <FileUpload
                onUploadComplete={handleUploadComplete}
                parentId={currentFolder?._id}
              />
            </DialogContent>
          </Dialog>
          <Dialog
            open={isFolderDialogOpen}
            onOpenChange={setIsFolderDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <FolderIcon className="mr-2 h-4 w-4" />
                Nouveau Dossier
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau dossier</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="folderName">Nom du dossier</Label>
                  <Input
                    id="folderName"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Mon dossier"
                  />
                </div>
                <Button
                  onClick={() => {
                    handleCreateFolder(newFolderName);
                    setIsFolderDialogOpen(false);
                    setNewFolderName("");
                  }}
                  className="w-full"
                >
                  Créer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des fichiers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 max-w-sm"
          />
        </div>
        <Select
          value={filter}
          onValueChange={(value: "all" | "file" | "folder") => setFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="file">Fichiers</SelectItem>
            <SelectItem value="folder">Dossiers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mes fichiers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {folders.length === 0 && filteredFiles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                    >
                      Aucun fichier trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableBody>
                    {[...folders, ...filteredFiles]
                      .filter((item) =>
                        item.name.toLowerCase().includes(search.toLowerCase())
                      )
                      .filter(
                        (item) => item.fileType === filter || filter === "all"
                      )
                      .map((item) => (
                        <FileItem
                          key={item._id}
                          item={item}
                          onFolderClick={(folder) => {
                            setCurrentFolder(folder);
                            // Mettre à jour le chemin de navigation
                            setBreadcrumbPath((prev) => [
                              ...prev,
                              { id: folder._id, name: folder.name },
                            ]);
                            fetchFolderContents(folder._id);
                          }}
                          onDownload={handleDownload}
                          onShare={handleShare}
                          onDelete={handleDelete}
                        />
                      ))}
                  </TableBody>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
