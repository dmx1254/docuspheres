// app/api/history/route.ts
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/option";
import { History } from "@/app/models/History";

connectDB();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(options);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const type = searchParams.get("type");
    const target = searchParams.get("target");

    // Construire la requête
    const query: any = {};
    if (type) query.actionType = type;
    if (target) query.targetType = target;

    // Récupérer les logs avec pagination
    const logs = await History.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name avatar");

    // Compter le total pour la pagination
    const total = await History.countDocuments(query);

    return NextResponse.json({
      logs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'historique" },
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

    const data = await req.json();

    const log = await History.create({
      ...data,
      user: {
        _id: session.user.id,
        name: session.user.name,
        avatar: session.user.image,
      },
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'action:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement de l'action" },
      { status: 500 }
    );
  }
}
