"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Download, MoreVertical, Share2, Trash2 } from "lucide-react";
import Image from "next/image";
import { IFile } from "@/app/models/File";
import { IFolder } from "@/app/models/Folder";

interface FileOrFolderItemProps {
  item: IFile | IFolder;
  onFolderClick?: (folder: IFolder) => void;
  onDownload?: (file: IFile) => void;
  onShare?: (file: IFile) => void;
  onDelete: (item: IFile | IFolder) => void;
  isSelected?: boolean;
  onSelect?: (item: IFile | IFolder) => void;
}

function formatBytes(bytes: number) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

function convertDate(date: Date) {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FileGridView({
  items,
  onFolderClick,
  onDownload,
  onShare,
  onDelete,
  onSelect,
  selectedItems = [],
}: {
  items: (IFile | IFolder)[];
  onFolderClick?: (folder: IFolder) => void;
  onDownload?: (file: IFile) => void;
  onShare?: (file: IFile) => void;
  onDelete: (item: IFile | IFolder) => void;
  onSelect?: (item: IFile | IFolder) => void;
  selectedItems?: (IFile | IFolder)[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4">
      {items.map((item) => (
        <FileGridItem
          key={item._id}
          item={item}
          onFolderClick={onFolderClick}
          onDownload={onDownload}
          onShare={onShare}
          onDelete={onDelete}
          isSelected={selectedItems.some(
            (selected) => selected._id === item._id
          )}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function FileGridItem({
  item,
  onFolderClick,
  onDownload,
  onShare,
  onDelete,
  isSelected,
  onSelect,
}: FileOrFolderItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isFolder = item.fileType === "folder";

  const getFileIcon = () => {
    if (isFolder) {
      return (
        <div className="w-16 h-16 mx-auto">
          <Image
            src="/folder_i.png"
            alt="folder"
            width={64}
            height={64}
            className="object-contain"
          />
        </div>
      );
    }

    const file = item as IFile;
    const fileType = file.type?.toLowerCase();

    if (fileType?.includes("pdf")) {
      return (
        <div className="w-16 h-16 mx-auto">
          <Image
            src="/pdf.png"
            alt="PDF"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
      );
    } else if (fileType?.includes("image")) {
      return (
        <div className="w-16 h-16 mx-auto overflow-hidden rounded-lg">
          <Image
            src={file.secureUrl || ""}
            alt={file.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else if (
      fileType?.includes("word") ||
      fileType?.includes("document") ||
      fileType?.includes("application/doc")
    ) {
      return (
        <div className="w-16 h-16 mx-auto">
          <Image
            src="/word.png"
            alt="Word"
            width={64}
            height={64}
            className="object-contain"
          />
        </div>
      );
    } else if (
      fileType?.includes(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) ||
      fileType?.includes("application/vnd.ms-excel") ||
      fileType?.includes("application/excel") ||
      fileType?.includes("application/x-excel") ||
      fileType?.includes("application/x-msexcel")
    ) {
      return (
        <div className="w-16 h-16 mx-auto">
          <Image
            src="/excel.png"
            alt="excel"
            width={64}
            height={64}
            className="object-contain"
          />
        </div>
      );
    } else if (
      fileType?.includes("text/plain") ||
      fileType?.includes("text/html") ||
      fileType?.includes("text/css") ||
      fileType?.includes("text/javascript")
    ) {
      return (
        <div className="w-16 h-16 mx-auto">
          <Image
            src="/txt.png"
            alt="texte"
            width={64}
            height={64}
            className="object-contain"
          />
        </div>
      );
    } else if (
      fileType?.includes("text/csv") ||
      fileType?.includes("application/csv")
    ) {
      return (
        <div className="w-16 h-16 mx-auto">
          <Image
            src="/csv.png"
            alt="csv"
            width={64}
            height={64}
            className="object-contain"
          />
        </div>
      );
    } else {
      return (
        <div className="w-16 h-16 mx-auto">
          <Image
            src="/text.png"
            alt="File"
            width={64}
            height={64}
            className="object-contain"
          />
        </div>
      );
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder && onFolderClick) {
      onFolderClick(item as IFolder);
    } else if (!isFolder && onSelect) {
      onSelect(item);
    }
  };

  return (
    <div
      className={cn(
        "relative group rounded-lg border p-4 hover:bg-accent transition-colors cursor-pointer select-none",
        isSelected && "bg-accent",
        isHovered && "shadow-md"
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!isFolder && (
              <>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload?.(item as IFile);
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare?.(item as IFile);
                  }}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Partager
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col items-center gap-2">
        {getFileIcon()}
        <div className="w-full text-center">
          <p className="text-sm font-medium truncate" title={item.name}>
            {item.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {isFolder ? "Dossier" : formatBytes((item as IFile).size)}
          </p>
          <p className="text-xs text-muted-foreground">
            {convertDate(item.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
