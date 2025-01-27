import mongoose from "mongoose";

export interface IFolder {
  _id: string;
  name: string;
  path: string;
  fileType: string;
  owner: {
    _id: string;
    name: string;
    avatar: string;
  };
  parent?: string; // Parent folder ID
  isPublic: boolean;
  sharedWith: string[]; // Array of user IDs
  color?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const folderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    path: { type: String, required: true },
    fileType: { type: String, default: "folder" },
    owner: {
      _id: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      avatar: String,
    },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Folder" },
    isPublic: { type: Boolean, default: false },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    color: String,
    description: String,
  },
  {
    timestamps: true,
  }
);

export const Folder =
  mongoose.models.Folder || mongoose.model("Folder", folderSchema);
