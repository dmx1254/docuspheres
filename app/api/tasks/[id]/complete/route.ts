import { options } from "@/app/api/auth/[...nextauth]/option";
import { Task } from "@/app/models/Task";
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

    const { id } = await params;
    const taskId = id || null;

    const task = await Task.findOneAndUpdate(
      {
        _id: taskId,
        $or: [
          { "assignedTo._id": session.user.id },
          { "createdBy._id": session.user.id },
        ],
      },
      {
        completed: true,
        completedAt: new Date(),
        status: "completed",
      },
      { new: true }
    );

    if (!task) {
      return NextResponse.json(
        { error: "Tâche non trouvée ou non autorisée" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la tâche" },
      { status: 500 }
    );
  }
}
