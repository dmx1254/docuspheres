"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  FileIcon,
  MessageCircle,
  MoreVertical,
  ThumbsUp,
  Share2,
  Download,
  PenSquare,
  Loader2,
  X,
} from "lucide-react";
import { IFile } from "@/app/models/File";
import { toast } from "sonner";
import { PostFileUpload } from "@/components/post-file-upload";
import { IComment, IPost, IPostFile } from "../types";
import { useSession } from "next-auth/react";

interface NewPostData {
  title: string;
  content: string;
  tags: string;
  files: File[];
  fileData: IFile[];
}

function formatBytes(bytes: number) {
  const sizes = ["Octets", "Ko", "Mo", "Go", "To"];
  if (bytes === 0) return "0 Octet";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

const BlogPage = () => {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTab, setSelectedTab] = useState("posts");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>(
    {}
  );

  // console.log(posts);

  const [newPost, setNewPost] = useState<NewPostData>({
    title: "",
    content: "",
    tags: "",
    files: [],
    fileData: [],
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleFileUpload = (file: IFile, originalFile: File) => {
    setNewPost((prev) => ({
      ...prev,
      files: [...prev.files, originalFile],
      fileData: [...prev.fileData, file],
    }));
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/posts", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des posts");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error("Format de données incorrect reçu du serveur");
        setPosts([]);
        return;
      }

      // Vérification supplémentaire des données
      const validPosts = data.filter(
        (post) => post && post._id && post.author && post.author._id
      );

      setPosts(data);
    } catch (error) {
      console.error("Erreur lors du chargement des posts:", error);
      toast.error("Erreur lors du chargement des posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (fileId: string) => {
    setNewPost((prev) => ({
      ...prev,
      files: prev.files.filter(
        (_, index) => prev.fileData[index]._id !== fileId
      ),
      fileData: prev.fileData.filter((f) => f._id !== fileId),
    }));
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error("Veuillez remplir le titre et le contenu");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", newPost.title.trim());
      formData.append("content", newPost.content.trim());
      formData.append("avatar", session?.user.avatar as string);
      formData.append(
        "tags",
        JSON.stringify(
          newPost.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        )
      );

      // Ajout des fichiers originaux
      newPost.files.forEach((file, index) => {
        formData.append(`files`, file);
      });

      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la création du post");
      }

      const createdPost = await response.json();
      setPosts((prev) => [createdPost, ...prev]);
      setNewPost({ title: "", content: "", tags: "", files: [], fileData: [] });
      setIsDialogOpen(false);
      toast.success("Publication créée avec succès");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la création du post"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadFile = (file: IFile | IPostFile) => {
    const downloadUrl = (file as IPostFile).url as string;
    window.open(downloadUrl, "_blank");
  };

  const handleComment = async (postId: string) => {
    const comment = commentInputs[postId];
    if (!comment?.trim()) return;

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: comment }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout du commentaire");
      }

      const newComment = await response.json();
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: [newComment, ...(post.comments || [])],
              }
            : post
        )
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      toast.success("Commentaire ajouté avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'ajout du commentaire");
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du like");
      }

      const updatedPost = await response.json();
      console.log(updatedPost);
      setPosts((prev) =>
        prev.map((post) => (post._id === postId ? updatedPost : post))
      );
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du like");
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      const post = await response.json();

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du post");
      }

      setPosts((prev) => prev.filter((p) => p._id !== post._id));
      toast.success("Publication supprimée avec succès");
    } catch (error) {
      toast.error("Erreur lors de la suppression du post");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Blog Communautaire
          </h1>
          <p className="text-muted-foreground mt-2">
            Partagez vos connaissances et ressources avec la communauté
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PenSquare className="mr-2 h-4 w-4" />
              Nouvelle Publication
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle publication</DialogTitle>
              <DialogDescription>
                Partagez vos pensées et fichiers avec la communauté
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Input
                  placeholder="Titre de la publication"
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Écrivez votre contenu..."
                  className="min-h-[200px]"
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost((prev) => ({ ...prev, content: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Ajouter des tags (séparés par des virgules)"
                  value={newPost.tags}
                  onChange={(e) =>
                    setNewPost((prev) => ({ ...prev, tags: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <PostFileUpload onUploadComplete={handleFileUpload} />
                {newPost.fileData.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {newPost.fileData.map((file, index) => (
                      <div
                        key={file._id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-2">
                          <FileIcon className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatBytes(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(file._id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                onClick={handleCreatePost}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Publier"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts" onClick={() => setSelectedTab("posts")}>
            Toutes les Publications
          </TabsTrigger>
          <TabsTrigger
            value="trending"
            onClick={() => setSelectedTab("trending")}
          >
            Tendances
          </TabsTrigger>
          <TabsTrigger
            value="following"
            onClick={() => setSelectedTab("following")}
          >
            Abonnements
          </TabsTrigger>
        </TabsList>

        <div className="grid gap-6">
          {posts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Aucune publication trouvée
            </div>
          ) : (
            posts.map((post) => (
              <Card key={post._id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage
                          src={post.author.avatar}
                          alt={post.author.name}
                        />
                        <AvatarFallback>
                          {post.author.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{post.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{post.author.name}</span>
                          <span>•</span>
                          <span>
                            {format(new Date(post.createdAt), "PPP", {
                              locale: fr,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Share2 className="mr-2 h-4 w-4" />
                          Partager
                        </DropdownMenuItem>
                        {post.author._id === post.author._id && (
                          <DropdownMenuItem
                            onClick={() => handleDeletePost(post._id)}
                            className="text-destructive"
                          >
                            Supprimer
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{post.content}</p>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {post.files && post.files.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Fichiers joints</h4>
                      <div className="space-y-2">
                        {post.files.map((file: IPostFile) => (
                          <div
                            key={file._id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex items-center gap-2">
                              <FileIcon className="h-4 w-4 text-blue-500" />
                              <div>
                                <p className="text-sm font-medium">
                                  {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatBytes(file.size)}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                downloadFile(file as IFile | IPostFile)
                              }
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 w-full">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-muted-foreground ${
                        post.likes.includes(post.author._id)
                          ? "bg-primary/10"
                          : ""
                      }`}
                      onClick={() => handleLike(post._id)}
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      {post.likes.length}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {post.comments ? post.comments.length : 0}
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4 w-full">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={post.author.avatar}
                          alt={post.author.name}
                        />
                        <AvatarFallback>
                          {post.author.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2">
                        <Input
                          placeholder="Écrire un commentaire..."
                          value={commentInputs[post._id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({
                              ...prev,
                              [post._id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleComment(post._id);
                            }
                          }}
                        />
                        <Button onClick={() => handleComment(post._id)}>
                          Commenter
                        </Button>
                      </div>
                    </div>

                    <ScrollArea className="h-[200px]">
                      <div className="space-y-4">
                        {post.comments &&
                          post.comments.map((comment: IComment) => (
                            <div key={comment._id} className="flex gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={comment.author?.avatar || "/ava.jpg"}
                                  alt={comment.author?.name || "Utilisateur"}
                                />
                                <AvatarFallback>
                                  {comment.author?.name?.slice(0, 2) || "UN"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="rounded-lg bg-muted p-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                      {comment.author?.name ||
                                        "Utilisateur inconnu"}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {format(
                                        new Date(comment.createdAt),
                                        "PPp",
                                        { locale: fr }
                                      )}
                                    </span>
                                  </div>
                                  <p className="text-sm mt-1">
                                    {comment.content}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default BlogPage;
