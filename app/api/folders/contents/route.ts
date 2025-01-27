// app/api/folders/contents/route.ts
import { connectDB } from "@/lib/mongodb";
import { Folder } from "@/app/models/Folder";
import { File } from "@/app/models/File";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options } from "@/app/api/auth/[...nextauth]/option";

connectDB();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer les fichiers et dossiers à la racine (parent: null)
    const [files, folders] = await Promise.all([
      File.find({
        parent: null,
        $or: [
          { "owner._id": session.user.id },
          { sharedWith: session.user.id },
          { isPublic: true },
        ],
      }),
      Folder.find({
        parent: null,
        $or: [
          { "owner._id": session.user.id },
          { sharedWith: session.user.id },
          { isPublic: true },
        ],
      }),
    ]);

    return NextResponse.json({ files, folders });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
