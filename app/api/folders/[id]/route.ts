import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/option";
import { NextResponse } from "next/server";
import { Folder } from "@/app/models/Folder";

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
    const folderId = id || null;

    let folder;

    if (session.user.role === "Admin") {
      // Si admin, on cherche juste par l'ID du fichier sans vérifier le owner
      folder = await Folder.findOne({
        _id: folderId,
      });
    } else {
      // Si pas admin, on vérifie que l'utilisateur est le owner
      folder = await Folder.findOne({
        _id: folderId,
        "owner._id": session.user.id,
      });
    }

    // console.log(file);
    // console.log(session.user);

    if (!folder) {
      return NextResponse.json(
        { error: "Dossier non trouvé ou non autorisé à etre modifié" },
        { status: 404 }
      );
    }

    // Supprimer de Cloudinary

    // Supprimer de la base de données
    await folder.deleteOne();

    return NextResponse.json({ message: "Fichier supprimé avec succès" });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression du fichier" },
      { status: 500 }
    );
  }
}
