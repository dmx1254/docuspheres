"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  CalendarIcon,
  Plus,
  Tag,
  Loader2,
  ClipboardList,
  ListTodo,
  CheckCircle2,
  PlusCircle,
  X,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { motion } from "framer-motion";

type Priority = "low" | "medium" | "high";
type Status = "todo" | "in-progress" | "completed";

interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "completed";
  dueDate?: Date;
  tags: string[];
  completed: boolean;
  createdBy: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface TaskColumnProps {
  title: string;
  icon: React.ReactNode;
  tasks: Task[];
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

const priorityColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const statusColors = {
  todo: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  "in-progress":
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    tags: [],
    completed: false,
  });
  const [newTag, setNewTag] = useState("");
  const [activeTab, setActiveTab] = useState("todo");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des tâches");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des tâches");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title) {
      toast.error("Veuillez entrer un titre pour la tâche");
      return;
    }

    // console.log(newTask);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok)
        throw new Error("Erreur lors de la création de la tâche");

      const createdTask = await response.json();
      setTasks((prev) => [createdTask, ...prev]);
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
        tags: [],
        completed: false,
      });
      toast.success("Tâche créée avec succès");
    } catch (error) {
      toast.error("Erreur lors de la création de la tâche");
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    setNewTask((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), newTag.trim()],
    }));
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTask((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  // Dans le composant principal TasksPage
  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la suppression");
      }

      // Mettre à jour l'état local en retirant la tâche
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
      toast.success("Tâche supprimée avec succès");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la suppression"
      );
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed,
          status: completed ? "completed" : "todo",
        }),
      });

      if (!response.ok)
        throw new Error("Erreur lors de la mise à jour de la tâche");

      const updatedTask = await response.json();
      setTasks((prev) =>
        prev.map((task) => (task._id === taskId ? updatedTask : task))
      );
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de la tâche");
    }
  };

  const filteredTasks = (status: Status) =>
    tasks.filter((task) => task.status === status);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Tableau de bord</h2>
          <p className="text-muted-foreground mt-2">
            Gérez et suivez vos tâches efficacement.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <PlusCircle className="h-5 w-5" />
              Nouvelle tâche
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Créer une nouvelle tâche
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-base">
                    Titre
                  </Label>
                  <Input
                    id="title"
                    placeholder="Qu'est-ce qui doit être fait ?"
                    className="mt-2"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-base">
                    Description
                  </Label>
                  <Input
                    id="description"
                    placeholder="Ajoutez plus de détails..."
                    className="mt-2"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base">Priorité</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) =>
                        setNewTask((prev) => ({
                          ...prev,
                          priority: value as Priority,
                        }))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low" className="text-green-600">
                          Basse
                        </SelectItem>
                        <SelectItem value="medium" className="text-yellow-600">
                          Moyenne
                        </SelectItem>
                        <SelectItem value="high" className="text-red-600">
                          Haute
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base">Statut</Label>
                    <Select
                      value={newTask.status}
                      onValueChange={(value) =>
                        setNewTask((prev) => ({
                          ...prev,
                          status: value as Status,
                        }))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">À faire</SelectItem>
                        <SelectItem value="in-progress">En cours</SelectItem>
                        <SelectItem value="completed">Terminé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-base">Tags</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Ajouter un tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {newTask.tags && newTask.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {newTask.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="px-3 py-1 text-sm gap-2"
                        >
                          {tag}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => handleRemoveTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  handleCreateTask();
                  setIsCreateDialogOpen(false);
                }}
              >
                Créer la tâche
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TaskColumn
          title="À faire"
          icon={<ListTodo className="h-5 w-5" />}
          tasks={filteredTasks("todo")}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
        />
        <TaskColumn
          title="En cours"
          icon={<ClipboardList className="h-5 w-5" />}
          tasks={filteredTasks("in-progress")}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
        />
        <TaskColumn
          title="Terminées"
          icon={<CheckCircle2 className="h-5 w-5" />}
          tasks={filteredTasks("completed")}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
        />
      </div>
    </div>
  );
}

function TaskColumn({
  title,
  icon,
  tasks,
  onToggle,
  onDelete,
}: TaskColumnProps) {
  return (
    <Card className="h-[700px] flex flex-col">
      <div className="p-4 border-b flex items-center gap-2">
        {icon}
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="secondary" className="ml-auto">
          {tasks.length}
        </Badge>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Aucune tâche
            </div>
          ) : (
            tasks.map((task) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="group relative flex flex-col space-y-2 rounded-lg border p-4 hover:border-primary transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) =>
                      onToggle(task._id, checked as boolean)
                    }
                    className="mt-1"
                  />
                  <div className="space-y-1 flex-1">
                    <p
                      className={
                        task.completed
                          ? "line-through text-muted-foreground"
                          : "font-medium"
                      }
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onDelete(task._id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge
                    variant="secondary"
                    className={priorityColors[task.priority]}
                  >
                    {task.priority === "high" && "Urgent"}
                    {task.priority === "medium" && "Moyenne"}
                    {task.priority === "low" && "Faible"}
                  </Badge>

                  {task.tags &&
                    task.tags.length > 0 &&
                    task.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                </div>

                {task.dueDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      {format(new Date(task.createdAt), "dd MMM yyyy")}
                    </span>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
