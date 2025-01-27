import { Post } from "@/app/models/Post";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options } from "../../auth/[...nextauth]/option";

connectDB();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const postId = id || null;
    const post = await Post.findById(postId)
      .populate("author", "name avatar")
      .populate("comments.author", "name avatar");

    if (!post) {
      return NextResponse.json({ error: "Post non trouvé" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération du post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const postId = id || null;
    const session = await getServerSession(options);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { title, content, tags } = await req.json();

    const post = await Post.findOneAndUpdate(
      { _id: postId, author: session?.user.id, avatar: session.user.avatar },
      { title, content, tags },
      { new: true }
    );

    if (!post) {
      return NextResponse.json(
        { error: "Post non trouvé ou non autorisé" },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const post = await Post.findByIdAndDelete(postId);
    if (!post) {
      return NextResponse.json(
        { error: "Post non trouvé ou non autorisé" },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression du post" },
      { status: 500 }
    );
  }
}
