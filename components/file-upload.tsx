// components/file-upload.tsx
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { IFileUpload } from "@/app/types";
import { IFile } from "@/app/models/File";

interface FileUploadProps {
  onUploadComplete: (fileData: IFile) => void;
  parentId?: string | null;
}

export function FileUpload({ onUploadComplete, parentId }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérification de la taille (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas dépasser 10MB");
      return;
    }

    setSelectedFile(file);
  };

  const uploadFile = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setProgress(0);

    try {
      // Créer un FormData pour l'upload
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (parentId) {
        formData.append("parentId", parentId);
      }
      // console.log(parentId);

      // Simuler la progression
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      // console.log(formData);

      // Upload vers notre API
      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'upload");
      }

      const data = await response.json();
      setProgress(100);
      toast.success("Fichier uploadé avec succès");
      onUploadComplete(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'upload"
      );
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />

      {!selectedFile && (
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          Sélectionner un fichier
        </Button>
      )}

      {selectedFile && (
        <div className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!isUploading && (
              <Button onClick={() => setSelectedFile(null)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {isUploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                Upload en cours... {progress}%
              </p>
            </div>
          )}

          {!isUploading && (
            <div className="flex space-x-2">
              <Button onClick={uploadFile} className="flex-1">
                Démarrer l'upload
              </Button>
              <Button onClick={() => setSelectedFile(null)}>Annuler</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
