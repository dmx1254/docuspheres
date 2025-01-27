import { options } from "@/app/api/auth/[...nextauth]/option";
import { File } from "@/app/models/File";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

connectDB();

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(options);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { userIds } = await req.json();
    const { id } = await params;
    const filId = id || null;

    const file = await File.findOneAndUpdate(
      { _id: filId, "owner._id": session?.user.id },
      { $addToSet: { sharedWith: { $each: userIds } } },
      { new: true }
    ).populate("sharedWith", "name email avatar");

    if (!file) {
      return NextResponse.json(
        { error: "Fichier non trouvé ou non autorisé" },
        { status: 404 }
      );
    }

    return NextResponse.json(file);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors du partage du fichier" },
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

    const { userId } = await req.json();
    const { id } = await params;
    const filId = id || null;

    const file = await File.findOneAndUpdate(
      { _id: filId, "owner._id": session?.user.id },
      { $pull: { sharedWith: userId } },
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
      { error: "Erreur lors de la révocation du partage" },
      { status: 500 }
    );
  }
}
