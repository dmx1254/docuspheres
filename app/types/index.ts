import { IFile } from "../models/File";

// User types
export type UserRole = "Admin" | "Editor" | "Viewer";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  avatar?: string;
}

// File and folder types
export interface BaseItem {
  _id: string;
  name: string;
  createdAt: Date;
  createdBy: string;
  path: string;
  parentId: string | null;
}

export type FileType =
  | "application/pdf"
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/vnd.ms-excel"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/vnd.ms-powerpoint"
  | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "text/plain"
  | "text/csv"
  | "application/json"
  | "text/html"
  | "application/zip"
  | "video/mp4"
  | "audio/mpeg";

export interface FileP extends BaseItem {
  type: "file";
  size: number;
  mimeType: FileType;
  lastModified?: Date;
  sharedWith?: string[];
  tags?: string[];
  description?: string;
  thumbnail?: string;
}

export interface Folder extends BaseItem {
  type: "folder";
  items: (File | Folder)[];
  color?: string;
  isShared?: boolean;
  sharedWith?: string[];
  description?: string;
}

// Action log types
export type ActionType =
  | "upload"
  | "delete"
  | "share"
  | "modify"
  | "create_folder"
  | "move"
  | "rename"
  | "download"
  | "restore"
  | "archive";

export interface ActionLog {
  _id: string;
  userId: string;
  actionType: ActionType;
  targetId: string;
  targetType: "file" | "folder" | "user";
  timestamp: Date;
  details?: string;
  metadata?: Record<string, any>;
}

// Statistics types
export interface Statistics {
  fileTypes: { [key: string]: number };
  userStorage: { [key: string]: number };
  totalFiles: number;
  totalFolders: number;
  totalStorage: number;
  activeUsers: number;
  storageLimit?: number;
  storageUsagePercentage?: number;
  mostActiveUsers?: { userId: string; activityCount: number }[];
  recentActivities?: ActionLog[];
  popularFiles?: { fileId: string; accessCount: number }[];
}

export interface PreviewDataType {
  url: string;
  type: string;
  thumbnail?: string;
  medium?: string;
  large?: string;
  previewUrl?: string;
}

export interface LoginUserInfo {
  email: string;
  ip?: string;
  userAgent: string;
  success: boolean;
  browser?: string;
  os?: string;
  device?: string;
  failureReason?: string;
  userId?: string;
}

export interface ICloudinaryResponse {
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  resource_type: string;
  bytes: number;
}

export interface IFileUpload {
  _id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
  owner: {
    _id: string;
    name: string;
    avatar: string;
  };
  parent: string | null;
  isPublic: boolean;
  tags: string[];
  cloudinaryId: string;
  format: string;
  resourceType: string;
  secureUrl: string;
}

export interface IPostFile extends IFile {
  secureUrl: string;
  thumbnailUrl?: string;
  cloudinaryId: string;
}

export interface IAuthor {
  _id: string;
  name: string;
  avatar?: string;
}

export interface IComment {
  _id: string;
  content: string;
  author: IAuthor;
  createdAt: string;
}

export interface IPost {
  _id: string;
  title: string;
  content: string;
  author: IAuthor;
  files: IPostFile[];
  tags: string[];
  likes: string[];
  comments: IComment[];
  createdAt: string;
  updatedAt?: string;
}
