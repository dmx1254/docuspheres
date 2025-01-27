import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/option";
import { File } from "@/app/models/File";

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
        { owner: session.user.id },
        { sharedWith: session.user.id },
        { isPublic: true },
      ],
    }).populate("owner", "name avatar");

    if (!file) {
      return NextResponse.json(
        { error: "Fichier non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(file);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération du fichier" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(options);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { name, isPublic, tags, sharedWith } = await req.json();
    const { id } = await params;
    const filId = id || null;

    const file = await File.findOneAndUpdate(
      { _id: filId, "owner._id": session.user.id },
      { name, isPublic, tags, sharedWith },
      { new: true }
    );

    if (!file) {
      return NextResponse.json(
        { error: "Fichier non trouvé ou non autorisé" },
        { status: 404 }
      );
    }

    return NextResponse.json(file);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du fichier" },
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
    const filId = id || null;

    const file = await File.findOne({
      _id: filId,
      "owner._id": session.user.id,
    });

    if (!file) {
      return NextResponse.json(
        { error: "Fichier non trouvé ou non autorisé" },
        { status: 404 }
      );
    }

    // Supprimer de Cloudinary
    await deleteFromCloudinary(file.cloudinaryId);

    // Supprimer de la base de données
    await file.deleteOne();

    return NextResponse.json({ message: "Fichier supprimé avec succès" });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression du fichier" },
      { status: 500 }
    );
  }
}
