import { Post } from "@/app/models/Post";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/option";
import { uploadToCloudinary } from "@/lib/cloudinary";

connectDB();

export async function GET() {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).lean().exec();

    // Vérification et transformation sécurisée des données
    const formattedPosts = posts
      .map((post) => {
        if (!post || !post._id) {
          return null;
        }

        return {
          _id: post._id.toString(),
          title: post.title || "",
          content: post.content || "",
          author: post.author
            ? {
                _id: post.author._id?.toString() || "",
                name: post.author.name || "Utilisateur inconnu",
                avatar: post.author.avatar || "/ava.jpg",
              }
            : {
                _id: "",
                name: "Utilisateur inconnu",
                avatar: "/ava.jpg",
              },
          files: Array.isArray(post.files)
            ? post.files.map((file) => ({
                _id: file._id?.toString() || "",
                name: file.name || "",
                size: file.size || 0,
                type: file.type || "",
                url: file.url || "",
                secureUrl: file.secureUrl || "",
                cloudinaryId: file.cloudinaryId || "",
                format: file.format || "",
                resourceType: file.resourceType || "",
              }))
            : [],
          tags: Array.isArray(post.tags) ? post.tags : [],
          likes: Array.isArray(post.likes)
            ? post.likes.map((id) => id.toString())
            : [],
          comments: Array.isArray(post.comments)
            ? post.comments.map((comment) => ({
                _id: comment._id?.toString() || "",
                content: comment.content || "",
                author: comment.author
                  ? {
                      _id: comment.author._id?.toString() || "",
                      name: comment.author.name || "Utilisateur inconnu",
                      avatar: comment.author.avatar || "/ava.jpg",
                    }
                  : {
                      _id: "",
                      name: "Utilisateur inconnu",
                      avatar: "/ava.jpg",
                    },
                createdAt: comment.createdAt
                  ? new Date(comment.createdAt).toISOString()
                  : new Date().toISOString(),
              }))
            : [],
          createdAt: post.createdAt
            ? new Date(post.createdAt).toISOString()
            : new Date().toISOString(),
          updatedAt: post.updatedAt
            ? new Date(post.updatedAt).toISOString()
            : undefined,
        };
      })
      .filter((post) => post !== null);

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error("Erreur détaillée lors de la récupération des posts:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const avatar = formData.get("avatar") as string;
    const tags = JSON.parse(formData.get("tags") as string);
    const files = formData.getAll("files");

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        if (file instanceof Blob) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const dataURI = `data:${file.type};base64,${buffer.toString(
            "base64"
          )}`;

          const cloudinaryResponse = await uploadToCloudinary(dataURI);

          return {
            name: file.name,
            size: cloudinaryResponse.bytes,
            type: file.type,
            url: cloudinaryResponse.url,
            secureUrl: cloudinaryResponse.secure_url,
            cloudinaryId: cloudinaryResponse.public_id,
            format: cloudinaryResponse.format,
            resourceType: cloudinaryResponse.resource_type,
          };
        }
      })
    );

    const post = await Post.create({
      title,
      content,
      tags,
      files: uploadedFiles,
      author: {
        _id: session.user.id,
        name: session.user.name,
        avatar: avatar || session.user.name,
      },
      comments: [],
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Erreur détaillée:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du post" },
      { status: 500 }
    );
  }
}
