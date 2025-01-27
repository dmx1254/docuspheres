import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { File } from "@/app/models/File";

import { PreviewDataType } from "@/app/types";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/option";

connectDB();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(options);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const filId = id || null;

    const file = await File.findOne({
      _id: filId,
      $or: [
        { "owner._id": session?.user.id },
        { sharedWith: session?.user.id },
        { isPublic: true },
      ],
    });

    if (!file) {
      return NextResponse.json(
        { error: "Fichier non trouvé ou accès non autorisé" },
        { status: 404 }
      );
    }

    // Générer des URLs de prévisualisation selon le type de fichier
    let previewData: PreviewDataType = {
      url: file.secureUrl,
      type: file.type,
    };

    // Pour les images, générer différentes tailles
    if (file.type.startsWith("image/")) {
      previewData = {
        ...previewData,
        thumbnail: cloudinary.url(file.cloudinaryId, {
          width: 150,
          height: 150,
          crop: "fill",
        }),
        medium: cloudinary.url(file.cloudinaryId, {
          width: 500,
          height: 500,
          crop: "fit",
        }),
        large: cloudinary.url(file.cloudinaryId, {
          width: 1024,
          crop: "fit",
        }),
      };
    }

    // Pour les PDFs, générer une URL de prévisualisation
    if (file.type === "application/pdf") {
      previewData = {
        ...previewData,
        previewUrl: cloudinary.url(file.cloudinaryId, {
          flags: "attachment:false",
          page: 1,
        }),
      };
    }

    // Enregistrer l'action de prévisualisation dans l'historique
    await File.findByIdAndUpdate(filId, {
      $push: {
        previewHistory: {
          userId: session?.user.id,
          previewedAt: new Date(),
        },
      },
    });

    return NextResponse.json(previewData);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la génération de la prévisualisation" },
      { status: 500 }
    );
  }
}
