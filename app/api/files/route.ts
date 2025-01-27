import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { File } from "@/app/models/File";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/option";

connectDB();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");
    const query = folderId ? { parent: folderId } : { parent: null };

    const files = await File.find({
      ...query,
      $or: [
        { "owner._id": session.user.id },
        { sharedWith: session.user.id },
        { isPublic: true },
      ],
    }).populate("owner", "name avatar");

    return NextResponse.json(files);
  } catch (error) {
    console.error("Erreur lors de la récupération des fichiers:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des fichiers" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const folderId = formData.get("folderId") as string;
    const parentId = formData.get("parentId") as string;
    const isPublic = formData.get("isPublic") === "true";
    const tags = formData.get("tags") as string;

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Aucun fichier fourni ou format invalide" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const dataURI = `data:${file.type};base64,${buffer.toString("base64")}`;

    const cloudinaryResponse = await uploadToCloudinary(dataURI);
    if (!cloudinaryResponse) {
      throw new Error("Échec de l'upload sur Cloudinary");
    }

    const newFile = await File.create({
      name: file.name,
      size: cloudinaryResponse.bytes,
      type: file.type,
      url: cloudinaryResponse.url,
      path: `/${folderId ? folderId + "/" : ""}${file.name}`,
      owner: {
        _id: session.user.id,
        name: session.user.name,
        avatar: session.user.image,
      },
      parent: parentId || null,
      isPublic,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      cloudinaryId: cloudinaryResponse.public_id,
      format: cloudinaryResponse.format,
      resourceType: cloudinaryResponse.resource_type,
      secureUrl: cloudinaryResponse.secure_url,
      fileType: "file",
    });

    if (!newFile) {
      throw new Error(
        "Échec de la création du fichier dans la base de données"
      );
    }

    return NextResponse.json(newFile);
  } catch (error) {
    console.error("Erreur détaillée lors de l'upload:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'upload du fichier",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
