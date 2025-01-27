import mongoose from 'mongoose';

export interface IComment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatar: string;
  };
  post: string;
  likes: string[]; // Array of user IDs
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    avatar: String,
  },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: true,
});

export const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);