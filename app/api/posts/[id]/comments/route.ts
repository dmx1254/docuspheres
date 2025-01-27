import { options } from "@/app/api/auth/[...nextauth]/option";
import { Post } from "@/app/models/Post";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

connectDB();

// app/api/posts/[id]/comments/route.ts
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(options);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { content } = await req.json();
    const { id } = await params;
    const postId = id || null;

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            content,
            author: {
              _id: session.user.id,
              name: session.user.name,
              avatar: session.user.image,
            },
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!post) {
      return NextResponse.json({ error: "Post non trouvé" }, { status: 404 });
    }

    // Retourner le dernier commentaire ajouté avec les informations complètes
    const newComment = post.comments[post.comments.length - 1];
    return NextResponse.json(newComment);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de l'ajout du commentaire" },
      { status: 500 }
    );
  }
}
