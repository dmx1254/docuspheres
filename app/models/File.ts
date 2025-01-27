import mongoose from "mongoose";

export interface IFile {
  _id: string;
  name: string;
  size: number;
  type: string;
  fileType: string;
  url: string;
  path: string;
  owner: {
    _id: string;
    name: string;
    avatar: string;
  };
  parent?: string; // Parent folder ID
  isPublic: boolean;
  sharedWith: string[]; // Array of user IDs
  tags: string[];
  // Cloudinary specific fields
  cloudinaryId: string;
  cloudinaryFolder?: string;
  format: string;
  resourceType: string;
  secureUrl: string;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    url: { type: String, required: true },
    path: { type: String, required: true },
    fileType: { type: String, default: "file" },
    owner: {
      _id: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      avatar: String,
    },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Folder" },
    isPublic: { type: Boolean, default: false },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    tags: [String],
    // Cloudinary specific fields
    cloudinaryId: { type: String, required: true, unique: true },
    cloudinaryFolder: String,
    format: { type: String, required: true },
    resourceType: { type: String, required: true },
    secureUrl: { type: String, required: true },
    thumbnailUrl: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
fileSchema.index({ owner: 1 });
fileSchema.index({ parent: 1 });
fileSchema.index({ "owner._id": 1, path: 1 });
fileSchema.index({ tags: 1 });

export const File =
  mongoose.models.File || mongoose.model<IFile>("File", fileSchema);
