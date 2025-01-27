// app/models/Post.ts
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    avatar: String,
  },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      _id: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      avatar: String,
    },
    files: [
      {
        name: String,
        size: Number,
        type: String,
        url: String,
        secureUrl: String,
        cloudinaryId: String,
        format: String,
        resourceType: String,
      },
    ],
    tags: [String],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
  },
  { timestamps: true }
);

export const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
