"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { IFile } from "@/app/models/File";

interface PostFileUploadProps {
  onUploadComplete: (fileData: IFile, originalFile: File) => void;
}

export function PostFileUpload({ onUploadComplete }: PostFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérification de la taille (5MB max pour les posts)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas dépasser 5MB");
      return;
    }

    // Vérifier les types de fichiers autorisés pour les posts
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/markdown",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Type de fichier non autorisé. Formats acceptés : images, PDF, DOC, DOCX, TXT, MD"
      );
      return;
    }

    setSelectedFile(file);
  };

  const uploadFile = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", "post");

      // Simuler la progression
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch("/api/posts/upload", {
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
      onUploadComplete(data, selectedFile); // Passage du fichier original
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
        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.md"
      />

      {!selectedFile && (
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          variant="outline"
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          Ajouter un fichier à la publication
        </Button>
      )}

      {selectedFile && (
        <div className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!isUploading && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {isUploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Upload en cours... {progress}%
              </p>
            </div>
          )}

          {!isUploading && (
            <div className="flex space-x-2">
              <Button onClick={uploadFile} className="flex-1">
                Ajouter à la publication
              </Button>
              <Button variant="outline" onClick={() => setSelectedFile(null)}>
                Annuler
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
