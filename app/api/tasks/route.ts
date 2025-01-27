import { connectDB } from "@/lib/mongodb";
import { Task } from "@/app/models/Task";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/option";
import mongoose from "mongoose";

connectDB();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query = status ? { status } : {};
    const tasks = await Task.find({
      ...query,
      $or: [
        { "assignedTo._id": session.user.id },
        { "createdBy._id": session.user.id },
      ],
    }).sort({ createdAt: -1 });

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des tâches" },
      { status: 500 }
    );
  }
}

// api/tasks/route.ts
export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const data = await req.json();

    // Assurez-vous que l'ID est une chaîne valide
    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json(
        { error: "ID utilisateur manquant" },
        { status: 400 }
      );
    }

    const task = await Task.create({
      ...data,
      createdBy: {
        _id: new mongoose.Types.ObjectId(userId),
        name: session.user.name || "Utilisateur",
        avatar: session.user.image || "",
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Erreur de création:", error);
    return NextResponse.json({ error: "Erreur de création" }, { status: 500 });
  }
}
