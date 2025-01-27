import { File } from "@/app/models/File";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options } from "../../auth/[...nextauth]/option";

connectDB();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer les fichiers partagés avec l'utilisateur
    const sharedWithMe = await File.find({
      sharedWith: session?.user.id,
    }).populate("owner", "name avatar");

    // Récupérer les fichiers que l'utilisateur a partagés
    const sharedByMe = await File.find({
      "owner._id": session?.user.id,
      sharedWith: { $exists: true, $not: { $size: 0 } },
    }).populate("sharedWith", "name email avatar");

    return NextResponse.json({
      sharedWithMe,
      sharedByMe,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des fichiers partagés" },
      { status: 500 }
    );
  }
}
