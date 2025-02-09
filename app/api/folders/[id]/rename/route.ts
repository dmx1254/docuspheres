import { options } from "@/app/api/auth/[...nextauth]/option";
import { Folder } from "@/app/models/Folder";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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
    const filId = id || null;

    const { name } = await req.json();

    // console.log(name);
    let folder;

    if (session.user.role === "Admin") {
      // Si admin, on cherche juste par l'ID du fichier sans vérifier le owner
      folder = await Folder.findOne({
        _id: filId,
      });
    } else {
      // Si pas admin, on vérifie que l'utilisateur est le owner
      folder = await Folder.findOne({
        _id: filId,
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

    // console.log(nameFile);

    const folderUpdate = await Folder.findByIdAndUpdate(
      filId,
      {
        name: name,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // Supprimer de Cloudinary

    // Supprimer de la base de données

    return NextResponse.json(folderUpdate, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression du fichier" },
      { status: 500 }
    );
  }
}
