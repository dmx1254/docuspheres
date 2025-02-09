import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options } from "../../auth/[...nextauth]/option";
import { Task } from "@/app/models/Task";

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
    const taskId = id || null;

    const task = await Task.findOne({
      _id: taskId,
      $or: [
        { "assignedTo._id": session.user.id },
        { "createdBy._id": session.user.id },
      ],
    });

    if (!task) {
      return NextResponse.json({ error: "Tâche non trouvée" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la tâche" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const taskId = id || null;

    const {
      title,
      description,
      priority,
      status,
      dueDate,
      assignedTo,
      tags,
      completed,
    } = await req.json();

    const updateData: any = {
      title,
      description,
      priority,
      status,
      tags,
      completed,
    };

    if (dueDate) {
      updateData.dueDate = new Date(dueDate);
    }

    if (assignedTo) {
      updateData.assignedTo = assignedTo;
    }

    if (completed) {
      updateData.completedAt = new Date();
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: taskId,
        $or: [
          { "assignedTo._id": session.user.id },
          { "createdBy._id": session.user.id },
        ],
      },
      updateData,
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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { id } = await params;
    const taskId = id || null;

    const task = await Task.findOneAndDelete({
      _id: taskId,
    });

    if (!task) {
      return NextResponse.json(
        { error: "Tâche non trouvée ou non autorisée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Tâche supprimée avec succès" });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la tâche" },
      { status: 500 }
    );
  }
}
