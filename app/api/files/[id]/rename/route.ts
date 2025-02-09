import { options } from "@/app/api/auth/[...nextauth]/option";
import { File } from "@/app/models/File";
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
    let file;

    if (session.user.role === "Admin") {
      // Si admin, on cherche juste par l'ID du fichier sans vérifier le owner
      file = await File.findOne({
        _id: filId,
      });
    } else {
      // Si pas admin, on vérifie que l'utilisateur est le owner
      file = await File.findOne({
        _id: filId,
        "owner._id": session.user.id,
      });
    }

    // console.log(file);
    // console.log(session.user);

    if (!file) {
      return NextResponse.json(
        { error: "Fichier non trouvé ou non autorisé à etre modifié" },
        { status: 404 }
      );
    }

    const newName = file.name.split(".")[1];

    const nameFile = name + "." + newName;

    // console.log(nameFile);

    const fileUpdated = await File.findByIdAndUpdate(
      filId,
      {
        name: nameFile,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // Supprimer de Cloudinary

    // Supprimer de la base de données

    return NextResponse.json(fileUpdated, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression du fichier" },
      { status: 500 }
    );
  }
}
