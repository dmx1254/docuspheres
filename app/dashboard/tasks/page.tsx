"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CalendarIcon, Plus, Tag, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    tags: [],
    completed: false,
  });
  const [newTag, setNewTag] = useState("");

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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tâches</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Créer une nouvelle tâche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  placeholder="Entrez le titre de la tâche"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Entrez la description de la tâche"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priorité</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) =>
                      setNewTask((prev) => ({
                        ...prev,
                        priority: value as Priority,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez la priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select
                    value={newTask.status}
                    onValueChange={(value) =>
                      setNewTask((prev) => ({
                        ...prev,
                        status: value as Status,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">À faire</SelectItem>
                      <SelectItem value="in-progress">En cours</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
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
                  <Button type="button" onClick={handleAddTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {newTask.tags && newTask.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {newTask.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Button onClick={handleCreateTask}>Créer la tâche</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tâches</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todo">
            <TabsList>
              <TabsTrigger value="todo">À faire</TabsTrigger>
              <TabsTrigger value="in-progress">En cours</TabsTrigger>
              <TabsTrigger value="completed">Terminées</TabsTrigger>
            </TabsList>
            <TabsContent value="todo">
              <TaskList
                tasks={filteredTasks("todo")}
                onToggle={handleToggleTask}
              />
            </TabsContent>
            <TabsContent value="in-progress">
              <TaskList
                tasks={filteredTasks("in-progress")}
                onToggle={handleToggleTask}
              />
            </TabsContent>
            <TabsContent value="completed">
              <TaskList
                tasks={filteredTasks("completed")}
                onToggle={handleToggleTask}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function TaskList({
  tasks,
  onToggle,
}: {
  tasks: Task[];
  onToggle: (id: string, completed: boolean) => void;
}) {
  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Aucune tâche trouvée
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className="flex items-start space-x-4 rounded-lg border p-4"
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={(checked) =>
                  onToggle(task._id, checked as boolean)
                }
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p
                    className={
                      task.completed ? "line-through text-muted-foreground" : ""
                    }
                  >
                    {task.title}
                  </p>
                  <Badge
                    variant="secondary"
                    className={priorityColors[task.priority]}
                  >
                    {task.priority === "high" && "Urgent"}
                    {task.priority === "medium" && "Moyenne"}
                    {task.priority === "low" && "Faible"}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={statusColors[task.status]}
                  >
                    {task.status === "todo" && "À faire"}
                    {task.status === "in-progress" && "En cours"}
                    {task.status === "completed" && "Terminé"}
                  </Badge>
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                )}
                {task.dueDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Due {format(new Date(task.createdAt), "PPP")}</span>
                  </div>
                )}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
