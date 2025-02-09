"use client";

import React, { useEffect, useState } from "react";
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
  ChevronRight,
  TableIcon,
  GridIcon,
  Table2,
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
  BreadcrumbSeparator,
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
import { FileGridView } from "@/components/file-grid-preview";

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

export default function FilesPage() {
  const [files, setFiles] = useState<IFile[]>([]);
  const [folders, setFolders] = useState<IFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<CurrentFolder | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "file" | "folder">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [breadcrumbPath, setBreadcrumbPath] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [selectedItems, setSelectedItems] = useState<(IFile | IFolder)[]>([]);

  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [idEditingText, setIdEditingText] = useState<string>("");
  const [nameEditing, setNameEditing] = useState<string>("");

  // console.log(isRenaming);
  // console.log(idEditingText);

  // const fetchFolders = async () => {
  //   try {
  //     const response = await fetch("/api/folders");
  //     if (!response.ok) {
  //       throw new Error("Erreur lors de la récupération des dossiers");
  //     }
  //     const data = await response.json();
  //     setFolders(data);
  //   } catch (error) {
  //     toast.error("Erreur lors de la récupération des dossiers");
  //     console.error(error);
  //   }
  // };

  const fetchFolderContents = async (folderId?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        folderId
          ? `/api/folders/${folderId}/contents`
          : "/api/folders/contents",
        {
          method: "GET",
        }
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
      setIsFolderDialogOpen(false);
      setNewFolderName("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    }
  };

  const handleUploadComplete = async (data: IFile) => {
    setFiles((prev) => [data, ...prev]);
    toast.success("Fichier uploadé avec succès");
    await fetchFolderContents(currentFolder?._id);
  };

  const handleDownload = async (file: IFile) => {
    try {
      if (file.type?.includes("pdf") || file.type?.includes("image")) {
        window.open(file.secureUrl);
        return;
      }

      const response = await fetch(`/api/files/${file._id}/download`);
      if (!response.ok) throw new Error("Erreur de téléchargement");

      const data = await response.json();
      window.open(data.downloadUrl);
    } catch (error) {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleShare = async (file: IFile) => {
    try {
      await navigator.clipboard.writeText(file.secureUrl);
      toast.success("Lien de partage copié dans le presse-papier !");
    } catch (error) {
      toast.error("Erreur lors de la copie du lien");
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

  const handleRename = async (item: IFile | IFolder) => {
    try {
      const endpoint =
        item.fileType === "folder" ? "/api/folders" : "/api/files";
      const response = await fetch(`${endpoint}/${item._id}/rename`, {
        method: "PUT",
        body: JSON.stringify({ name: nameEditing }),
      });

      if (!response.ok) throw new Error("Erreur lors du changement de nom");

      const res = await response.json();

      if (item.fileType === "folder") {
        setFolders((prev) =>
          prev.map((f) => {
            if (f._id === res._id) {
              return {
                ...f,
                name: res.name,
              };
            }
            return f;
          })
        );
      } else {
        setFiles((prev) =>
          prev.map((f) => {
            if (f._id === res._id) {
              return {
                ...f,
                name: res.name,
              };
            }
            return f;
          })
        );
      }

      setIsRenaming(false);
      setIdEditingText("");
      setNameEditing("");

      toast.success("Fichier renommé avec succès!", {
        style: {
          color: "#22c55e",
        },
      });

      // toast.success("Supprimé avec succès");
    } catch (error: any) {
      toast.error(error.response.data.error, {
        style: {
          color: "#ef4444",
        },
      });
    }
  };

  useEffect(() => {
    fetchFolderContents(currentFolder?._id);
  }, [currentFolder?._id]);

  const allItems = [...folders, ...files];
  const filteredItems = allItems?.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter = filter === "all" || item.fileType === filter;
    return matchesSearch && matchesFilter;
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
                  className="cursor-pointer"
                >
                  Accueil
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbPath.map((item, index) => (
                <React.Fragment key={item.id}>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      onClick={() => {
                        const newPath = breadcrumbPath.slice(0, index + 1);
                        setBreadcrumbPath(newPath);
                        setCurrentFolder({
                          _id: item.id,
                          name: item.name,
                          path: `/${item.name}`,
                        });
                      }}
                      className="cursor-pointer"
                    >
                      {item.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </React.Fragment>
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
                  onClick={() => handleCreateFolder(newFolderName)}
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Mes documents</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-accent" : ""}
            >
              <Table2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-accent" : ""}
            >
              <GridIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Aucun fichier trouvé
            </div>
          ) : viewMode === "grid" ? (
            <FileGridView
              items={filteredItems}
              onFolderClick={(folder) => {
                setCurrentFolder(folder);
                setBreadcrumbPath((prev) => [
                  ...prev,
                  { id: folder._id, name: folder.name },
                ]);
              }}
              onDownload={handleDownload}
              onShare={handleShare}
              onDelete={handleDelete}
              onRename={handleRename}
              isRenaming={isRenaming}
              idEditingText={idEditingText}
              setIsRenaming={setIsRenaming}
              setIdEditingText={setIdEditingText}
              selectedItems={selectedItems}
              nameEditing={nameEditing}
              setNameEditing={setNameEditing}
              onSelect={(item) => {
                setSelectedItems((prev) => {
                  const isSelected = prev.some((i) => i._id === item._id);
                  if (isSelected) {
                    return prev.filter((i) => i._id !== item._id);
                  }
                  return [...prev, item];
                });
              }}
            />
          ) : (
            <div className="rounded-md border">
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
                  {filteredItems.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.fileType === "folder" ? (
                            <div
                              className="flex items-center gap-2 cursor-pointer hover:text-primary"
                              onClick={() => {
                                setCurrentFolder(item as IFolder);
                                setBreadcrumbPath((prev) => [
                                  ...prev,
                                  { id: item._id, name: item.name },
                                ]);
                              }}
                            >
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
                              {(item as IFile).type?.includes("pdf") ? (
                                <Image
                                  src="/pdf.png"
                                  alt="PDF"
                                  width={20}
                                  height={20}
                                  className="object-cover object-center"
                                />
                              ) : (item as IFile).type?.includes("image") ? (
                                <Image
                                  src={(item as IFile).secureUrl}
                                  alt={item.name}
                                  width={20}
                                  height={20}
                                  className="object-cover object-center rounded"
                                />
                              ) : (item as IFile).type?.includes("word") ? (
                                <Image
                                  src="/word.png"
                                  alt="Word"
                                  width={20}
                                  height={20}
                                  className="object-cover object-center"
                                />
                              ) : (
                                <Image
                                  src="/text.png"
                                  alt="File"
                                  width={20}
                                  height={20}
                                  className="object-cover object-center"
                                />
                              )}
                              <span>{item.name}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.fileType === "folder"
                          ? "-"
                          : formatBytes((item as IFile).size)}
                      </TableCell>
                      <TableCell>{convertDate(item.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVerticalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {item.fileType !== "folder" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleDownload(item as IFile)}
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Télécharger
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleShare(item as IFile)}
                                >
                                  <Share2 className="mr-2 h-4 w-4" />
                                  Partager
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDelete(item)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
