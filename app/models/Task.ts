import mongoose from "mongoose";

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in-progress" | "completed";

export interface ITask {
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdBy: {
    _id: string;
    name: string;
    avatar: string;
  };
  tags: string[];
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "completed"],
      default: "todo",
    },

    createdBy: {
      _id: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      avatar: String,
    },
    tags: [String],
    completed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Task =
  mongoose.models.Task || mongoose.model<ITask>("Task", taskSchema);
