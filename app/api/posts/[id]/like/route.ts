// app/api/posts/[id]/like/route.ts
import { Post } from "@/app/models/Post";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options } from "../../../auth/[...nextauth]/option";
import mongoose from "mongoose";

connectDB();

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(options);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const postId = id || null;
    const userId = new mongoose.Types.ObjectId(session.user.id);
    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json({ error: "Post non trouvé" }, { status: 404 });
    }

    const userLikedIndex = post.likes.indexOf(userId);

    if (userLikedIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(userLikedIndex, 1);
    }

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author", "name avatar")
      .populate("comments.author", "name avatar");

    return NextResponse.json(updatedPost);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du like" },
      { status: 500 }
    );
  }
}
