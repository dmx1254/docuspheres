import mongoose from 'mongoose';

export type ActionType = 
  | 'upload'
  | 'delete'
  | 'share'
  | 'modify'
  | 'create_folder'
  | 'move'
  | 'rename'
  | 'download'
  | 'restore'
  | 'archive';

export interface IHistory {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  actionType: ActionType;
  targetType: 'file' | 'folder' | 'task';
  targetId: string;
  details: string;
  metadata?: {
    oldPath?: string;
    newPath?: string;
    size?: number;
    sharedWith?: string[];
    [key: string]: any;
  };
  createdAt: Date;
}

const historySchema = new mongoose.Schema({
  user: {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    avatar: String,
  },
  actionType: {
    type: String,
    enum: [
      'upload',
      'delete',
      'share',
      'modify',
      'create_folder',
      'move',
      'rename',
      'download',
      'restore',
      'archive'
    ],
    required: true,
  },
  targetType: {
    type: String,
    enum: ['file', 'folder', 'task'],
    required: true,
  },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  details: { type: String, required: true },
  metadata: {
    oldPath: String,
    newPath: String,
    size: Number,
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
}, {
  timestamps: true,
});

export const History = mongoose.models.History || mongoose.model('History', historySchema);