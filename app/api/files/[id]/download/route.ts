import { options } from "@/app/api/auth/[...nextauth]/option";
import { File } from "@/app/models/File";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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

    // Générer une URL de téléchargement signée si nécessaire
    // Pour Cloudinary, l'URL sécurisée est déjà disponible
    const downloadUrl = file.secureUrl;

    // Enregistrer l'action de téléchargement dans l'historique
    await File.findByIdAndUpdate(filId, {
      $push: {
        downloadHistory: {
          userId: session?.user.id,
          downloadedAt: new Date(),
        },
      },
    });

    return NextResponse.json({ downloadUrl });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la préparation du téléchargement" },
      { status: 500 }
    );
  }
}
