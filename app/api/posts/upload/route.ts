import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/option";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { File } from "@/app/models/File";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const type = formData.get("type");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Aucun fichier fourni ou format invalide" },
        { status: 400 }
      );
    }

    // Vérification du type de fichier pour les posts
    if (type !== "post") {
      return NextResponse.json(
        { error: "Type de fichier invalide pour un post" },
        { status: 400 }
      );
    }

    // Vérification de la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Le fichier ne doit pas dépasser 5MB" },
        { status: 400 }
      );
    }

    // Vérification des types de fichiers autorisés
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/markdown",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Type de fichier non autorisé pour un post" },
        { status: 400 }
      );
    }

    // Conversion du fichier en format base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const dataURI = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload vers Cloudinary
    const cloudinaryResponse = await uploadToCloudinary(dataURI);
    if (!cloudinaryResponse) {
      throw new Error("Échec de l'upload sur Cloudinary");
    }

    // Création du document dans la base de données
    const newFile = await File.create({
      name: file.name,
      size: cloudinaryResponse.bytes,
      type: file.type,
      url: cloudinaryResponse.url,
      path: `/posts/${file.name}`,
      owner: {
        _id: session.user.id,
        name: session.user.name,
        avatar: session.user.image,
      },
      isPublic: true, // Les fichiers de posts sont toujours publics
      tags: ["post"], // Tag spécifique pour les fichiers de posts
      cloudinaryId: cloudinaryResponse.public_id,
      format: cloudinaryResponse.format,
      resourceType: cloudinaryResponse.resource_type,
      secureUrl: cloudinaryResponse.secure_url,
      fileType: "post",
      thumbnailUrl:
        cloudinaryResponse.resource_type === "image"
          ? cloudinaryResponse.secure_url.replace(
              "/upload/",
              "/upload/c_thumb,w_200,g_face/"
            )
          : null,
    });

    if (!newFile) {
      throw new Error(
        "Échec de la création du fichier dans la base de données"
      );
    }

    // Retourne uniquement les informations nécessaires
    return NextResponse.json({
      _id: newFile._id,
      name: newFile.name,
      size: newFile.size,
      type: newFile.type,
      url: newFile.url,
      secureUrl: newFile.secureUrl,
      thumbnailUrl: newFile.thumbnailUrl,
    });
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
