// app/api/folders/route.ts
import { connectDB } from "@/lib/mongodb";
import { Folder } from "@/app/models/Folder";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options } from "@/app/api/auth/[...nextauth]/option";
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
    const folderId = id || null;

    const [files, folders] = await Promise.all([
      File.find({
        parent: folderId,
        $or: [
          { "owner._id": session.user.id },
          { sharedWith: session.user.id },
          { isPublic: true },
        ],
      }),
      Folder.find({
        parent: folderId,
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
