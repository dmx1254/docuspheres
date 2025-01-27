// app/api/folders/route.ts
import { connectDB } from "@/lib/mongodb";
import { Folder } from "@/app/models/Folder";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/option";

connectDB();

export async function GET() {
  try {
    const session = await getServerSession(options);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const folders = await Folder.find({
      "owner._id": session.user.id,
    });

    return NextResponse.json(folders);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des dossiers" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { name, parentId } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Le nom du dossier est requis" },
        { status: 400 }
      );
    }

    // Construire le chemin du dossier
    let path = `/${name}`;
    if (parentId) {
      const parentFolder = await Folder.findById(parentId);
      if (parentFolder) {
        path = `${parentFolder.path}/${name}`;
      }
    }

    const folder = await Folder.create({
      name: name.trim(),
      path,
      owner: {
        _id: session.user.id,
        name: session.user.name,
        avatar: session.user.image,
      },
      parent: parentId || null,
      isPublic: false,
      fileType: "folder",
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Erreur lors de la création du dossier:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du dossier" },
      { status: 500 }
    );
  }
}
